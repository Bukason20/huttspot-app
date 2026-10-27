"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import PropertySection from "@/components/home/PropertySection";
import { ListingCardData } from "@/lib/types";

export interface ListingGroup {
  title: string;
  properties: ListingCardData[];
}

interface ListingStackProps {
  groups: ListingGroup[];
  onSaveToggle?: (id: string) => void;
  savedIds?: string[];
}

// Solid (not translucent) backgrounds so a covered card never shows through
const CARD_TONES = ["bg-white", "bg-[#fafaf8]", "bg-[#fff5f0]", "bg-[#eef7f2]"];

// Sticky offsets (px). The navbar is 64px tall once scrolled.
const NAV_H = 64;
const TABS_H = 60; // category tabs bar
const PEEK = 16; // how much of each covered card stays visible

/**
 * Landing page listings: one card per property type. While scrolling, each
 * card pins under the header and the next one slides up over it, so any
 * number of categories takes the same space on screen. An IntersectionObserver
 * tracks which card is in front to drive the tabs and the "pushed back" look.
 */
export default function ListingStack({
  groups,
  onSaveToggle,
  savedIds = [],
}: ListingStackProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const anchorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const hasTabs = groups.length > 1;
  const top = NAV_H + (hasTabs ? TABS_H : 0) + 16;

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    // Several stuck cards can cross the middle line at once — the one in
    // front is the highest index (also correct when scrolling back up).
    const crossing = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number((entry.target as HTMLElement).dataset.idx);
          if (entry.isIntersecting) crossing.add(idx);
          else crossing.delete(idx);
        });
        if (crossing.size) setActive(Math.max(...crossing));
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [groups.length]);

  // Keep the active tab in view inside the (horizontally scrolling) tab strip
  useEffect(() => {
    const strip = tabsRef.current;
    const tab = tabRefs.current[active];
    if (!strip || !tab) return;
    const left = tab.offsetLeft - strip.clientWidth / 2 + tab.clientWidth / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [active]);

  // Scroll to a category's natural (un-stuck) position
  const goTo = (i: number) => {
    anchorRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative">
      {/* Category tabs — pinned under the navbar while the stack scrolls */}
      {hasTabs && (
        <div
          className="sticky z-20 -mx-5 bg-white px-5 sm:-mx-8 sm:px-8"
          style={{ top: NAV_H, height: TABS_H }}
        >
          <div className="flex h-full items-center gap-3">
            <div
              ref={tabsRef}
              className="scrollbar-hide relative flex min-w-0 flex-1 gap-2 overflow-x-auto"
            >
              {groups.map((g, i) => (
                <button
                  key={g.title}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  onClick={() => goTo(i)}
                  aria-current={active === i}
                  className={`flex h-9 flex-shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                    active === i
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-[#f4f4f2] text-tertiary hover:bg-gray-200"
                  }`}
                >
                  {g.title}
                  <span
                    className={`text-xs ${active === i ? "text-white/60" : "text-gray-400"}`}
                  >
                    {g.properties.length}
                  </span>
                </button>
              ))}
            </div>
            <span className="hidden flex-shrink-0 font-poppins text-sm font-semibold text-gray-400 sm:block">
              <span className="text-[#1a1a1a]">{String(active + 1).padStart(2, "0")}</span>
              {" / "}
              {String(groups.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      )}

      <div className="pt-2">
        {/* Cards must be direct siblings in ONE parent: a sticky element
            can only stick within its parent, so wrapping each card in its
            own div would stop the stacking. */}
        {groups.map((group, i) => (
          <Fragment key={group.title}>
            {/* Where this card sits before it sticks — used by the tabs */}
            <div
              ref={(el) => {
                anchorRefs.current[i] = el;
              }}
              style={{ scrollMarginTop: top + i * PEEK }}
            />
            <div
              data-idx={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={`sticky ${i < groups.length - 1 ? "mb-6" : ""}`}
              style={{ top: top + i * PEEK }}
            >
              <div
                className={`origin-top rounded-3xl border border-gray-100 transition-transform duration-500 ease-out motion-reduce:transition-none ${
                  CARD_TONES[i % CARD_TONES.length]
                } ${i < active ? "scale-[0.95]" : "scale-100"} ${
                  i > 0 ? "shadow-[0_-12px_32px_rgba(0,0,0,0.06)]" : ""
                }`}
              >
                <div className="overflow-hidden rounded-3xl p-5 pb-4 sm:p-7 sm:pb-5 lg:p-8 lg:pb-6">
                  <PropertySection
                    stacked
                    title={group.title}
                    properties={group.properties}
                    onSaveToggle={onSaveToggle}
                    savedIds={savedIds}
                  />
                </div>
              </div>
            </div>
          </Fragment>
        ))}

        {/* Room (inside the same parent) for the last card to reach its
            spot and hold for a moment before the stack scrolls away */}
        {hasTabs && <div className="h-[22vh]" aria-hidden />}
      </div>
    </div>
  );
}
