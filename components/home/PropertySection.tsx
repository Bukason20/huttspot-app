"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ArrowRight, MapPin, ImageOff } from "lucide-react";
import { Property } from "@/lib/types";

interface PropertySectionProps {
  title: string;
  properties: Property[];
  onSaveToggle?: (id: string) => void;
  savedIds?: string[];
}

export default function PropertySection({
  title,
  properties,
  onSaveToggle,
  savedIds = [],
}: PropertySectionProps) {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

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

  if (properties.length === 0) return null;

  return (
    <div
      ref={sectionRef}
      className={`mb-10 transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Section header */}
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h3 className="font-poppins text-lg font-semibold text-[#1a1a1a] sm:text-xl">
            {title}
          </h3>
          <p className="text-sm text-gray-500">
            {properties.length} {properties.length === 1 ? "listing" : "listings"}
          </p>
        </div>
        <button
          onClick={() =>
            router.push(
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
      </div>

      {/* Horizontal scroller on small screens, grid from lg up */}
      <div className="scrollbar-hide -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {properties.slice(0, 6).map((listing, i) => {
          const coverPhoto = listing.media?.photos?.[0];
          const isSaved = savedIds.includes(listing._id);

          return (
            <div
              key={listing._id}
              onClick={() => router.push(`/huttspotter/listing/${listing._id}`)}
              className={`group w-[78%] flex-shrink-0 cursor-pointer snap-start overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-500 ease-out hover:border-gray-200 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:w-[300px] lg:w-auto ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{
                // Stagger each card's animation
                transitionDelay: isVisible ? `${i * 60}ms` : "0ms",
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
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={13} className="flex-shrink-0" />
                    <span className="truncate">
                      {listing.location.city}
                      {listing.location.state
                        ? `, ${listing.location.state}`
                        : ""}
                    </span>
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                  <p className="font-poppins text-base font-semibold text-[#1a1a1a]">
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
