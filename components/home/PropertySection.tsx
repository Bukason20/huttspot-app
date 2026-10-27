"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  ArrowRight,
  MapPin,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  Bath,
} from "lucide-react";
import { ListingCardData } from "@/lib/types";

interface PropertySectionProps {
  title: string;
  properties: ListingCardData[];
  onSaveToggle?: (id: string) => void;
  savedIds?: string[];
  /**
   * Rendered inside a stacked category card on the landing page:
   * no outer margin / fade (the card handles that) and the carousel
   * bleeds to the card's padding instead of the page's.
   */
  stacked?: boolean;
  /** Override where a listing opens (e.g. landing page: sign-in gate) */
  onViewListing?: (id: string) => void;
  /** Override where "See all" goes */
  onSeeAll?: (title: string) => void;
}

export default function PropertySection({
  title,
  properties,
  onSaveToggle,
  savedIds = [],
  stacked = false,
  onViewListing,
  onSeeAll,
}: PropertySectionProps) {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Carousel: watch the first & last cards inside the scroller so the
  // arrow buttons know when we are at either end
  const scrollerRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);
  const lastCardRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true); // animate only once
        }
      },
      {
        threshold: 0.1, // trigger when 10% of section is visible
        rootMargin: "0px 0px -50px 0px", // slight offset from bottom
      },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === firstCardRef.current) setAtStart(entry.isIntersecting);
          if (entry.target === lastCardRef.current) setAtEnd(entry.isIntersecting);
        });
      },
      { root, threshold: 0.9 },
    );
    if (firstCardRef.current) observer.observe(firstCardRef.current);
    if (lastCardRef.current) observer.observe(lastCardRef.current);
    return () => observer.disconnect();
  }, [properties.length]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  if (properties.length === 0) return null;

  // In a stacked card the cards are always shown (no scroll fade)
  const show = stacked || isVisible;

  return (
    <div
      ref={sectionRef}
      className={
        stacked
          ? ""
          : `mb-10 transition-all duration-700 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`
      }
    >
      {/* Section header */}
      <div
        className={`mb-4 flex justify-between gap-4 ${stacked ? "items-center" : "items-end"}`}
      >
        <div>
          <h3 className="font-poppins text-lg font-semibold text-[#1a1a1a] sm:text-xl">
            {title}
          </h3>
          {/* Counts aren't meaningful for the landing page's featured pick */}
          {!stacked && (
            <p className="text-sm text-gray-500">
              {properties.length}{" "}
              {properties.length === 1 ? "listing" : "listings"}
            </p>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-4">
        <button
          onClick={() =>
            onSeeAll
              ? onSeeAll(title)
              : router.push(
                  `/huttspotter/dashboard?type=${encodeURIComponent(title)}`,
                )
          }
          className="group flex flex-shrink-0 cursor-pointer items-center gap-1.5 text-sm font-semibold text-secondary"
        >
          See all
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
        {/* Arrows — tablet & desktop, only when there is more to scroll */}
        {Math.min(properties.length, 6) > 1 && !(atStart && atEnd) && (
          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={() => scrollByPage(-1)}
              disabled={atStart}
              aria-label={`Previous ${title} listings`}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-[#1a1a1a] transition-colors hover:bg-gray-50 disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollByPage(1)}
              disabled={atEnd}
              aria-label={`Next ${title} listings`}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-[#1a1a1a] transition-colors hover:bg-gray-50 disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Carousel — swipe on touch, arrows on tablet & desktop */}
      <div
        ref={scrollerRef}
        className={`scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 ${
          stacked
            ? "-mx-5 scroll-px-5 px-5 sm:-mx-7 sm:scroll-px-7 sm:px-7 lg:-mx-8 lg:scroll-px-8 lg:px-8"
            : "-mx-5 scroll-px-5 px-5 sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:scroll-px-0 lg:px-0"
        }`}
      >
        {properties.slice(0, 6).map((listing, i, shown) => {
          const coverPhoto = listing.media?.photos?.[0];
          const isSaved = savedIds.includes(listing._id);
          const edgeRef =
            i === 0 ? firstCardRef : i === shown.length - 1 ? lastCardRef : undefined;

          return (
            <div
              key={listing._id}
              ref={edgeRef}
              onClick={() =>
                onViewListing
                  ? onViewListing(listing._id)
                  : router.push(`/huttspotter/listing/${listing._id}`)
              }
              className={`group w-[78%] flex-shrink-0 cursor-pointer snap-start overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-500 ease-out hover:border-gray-200 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:w-[300px] lg:w-[calc((100%-2rem)/3)] ${
                show
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{
                // Stagger each card's animation
                transitionDelay: show && !stacked ? `${i * 60}ms` : "0ms",
              }}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                {coverPhoto ? (
                  <img
                    src={coverPhoto}
                    alt={listing.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400">
                    <ImageOff size={20} />
                    <span className="text-xs">No photo</span>
                  </div>
                )}

                {/* Heart */}
                {onSaveToggle && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSaveToggle(listing._id);
                    }}
                    aria-label={isSaved ? "Remove from saved" : "Save listing"}
                    className="heart-btn absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white"
                  >
                    <Heart
                      size={16}
                      fill={isSaved ? "#ff6b35" : "none"}
                      color={isSaved ? "#ff6b35" : "#1a1a1a"}
                    />
                  </button>
                )}

                {/* Purpose chip */}
                {listing.purpose && (
                  <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#1a1a1a]">
                    {listing.purpose}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="line-clamp-1 font-semibold text-[#1a1a1a]">
                  {listing.title}
                </p>
                {listing.location?.city && (
                  <p className="mt-1 flex h-5 items-center gap-1 text-sm text-gray-500">
                    <MapPin size={13} className="flex-shrink-0" />
                    <span className="truncate">
                      {listing.location.city}
                      {listing.location.state
                        ? `, ${listing.location.state}`
                        : ""}
                    </span>
                  </p>
                )}
                <div className="mt-2 flex h-5 items-center gap-3 text-xs font-semibold text-tertiary">
                  {!!listing.details?.bedrooms && (
                    <span className="flex items-center gap-1">
                      <BedDouble size={14} className="text-gray-400" />
                      {listing.details.bedrooms}{" "}
                      {listing.details.bedrooms === 1 ? "bed" : "beds"}
                    </span>
                  )}
                  {!!listing.details?.bathrooms && (
                    <span className="flex items-center gap-1">
                      <Bath size={14} className="text-gray-400" />
                      {listing.details.bathrooms}{" "}
                      {listing.details.bathrooms === 1 ? "bath" : "baths"}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                  <p className="min-w-0 truncate whitespace-nowrap font-poppins text-base font-semibold text-[#1a1a1a]">
                    ₦{listing.price?.toLocaleString()}
                    <span className="font-nunito text-xs font-semibold text-gray-500">
                      {" "}
                      / {listing.paymentType}
                    </span>
                  </p>
                  <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-white transition-colors group-hover:bg-[#08744a]">
                    View
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
