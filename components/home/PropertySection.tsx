"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ChevronRight } from "lucide-react";
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
      className={`mb-6 transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Section header */}
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="text-sm font-bold text-[#1a1a1a]">{title}</h2>
        <button
          onClick={() =>
            router.push(
              `/huttspotter/dashboard?type=${encodeURIComponent(title)}`,
            )
          }
          className="flex items-center gap-0.5 text-xs text-gray-400 cursor-pointer"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Horizontal scroll grid — 3 per row */}
      <div className="grid grid-cols-3 gap-2 px-5">
        {properties.slice(0, 6).map((listing, i) => {
          const coverPhoto = listing.media?.photos?.[0];
          const isSaved = savedIds.includes(listing._id);

          return (
            <div
              key={listing._id}
              onClick={() => router.push(`/huttspotter/listing/${listing._id}`)}
              className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-500 ease-out ${
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
              {coverPhoto ? (
                <img
                  src={coverPhoto}
                  alt={listing.title}
                  className="w-full h-24 object-cover"
                />
              ) : (
                <div className="w-full h-24 bg-gray-200 flex items-center justify-center">
                  <span className="text-[10px] text-gray-400">No photo</span>
                </div>
              )}

              {/* Heart */}
              {onSaveToggle && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveToggle(listing._id);
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/85 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <Heart
                    size={11}
                    fill={isSaved ? "#e8622a" : "none"}
                    color={isSaved ? "#e8622a" : "#374151"}
                  />
                </button>
              )}

              {/* Time badge */}
              <div className="absolute bottom-8 left-1 bg-black/40 rounded-full px-1.5 py-0.5">
                <p className="text-white text-[8px] font-medium">
                  {listing.location?.city ?? ""}
                </p>
              </div>

              {/* View listing button */}
              <div className="pt-1 pb-1">
                <p className="text-[9px] text-gray-400 font-medium mb-0.5">
                  ₦{listing.price?.toLocaleString()} / {listing.paymentType}
                </p>
                <button className="bg-secondary text-white rounded-full px-2 py-1 text-[9px] font-semibold cursor-pointer">
                  View Listing
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
