"use client";

import { useRouter } from "next/navigation";
import { Heart, MapPin, ImageOff, ArrowRight } from "lucide-react";
import { Property } from "@/lib/types";

interface ListingCardProps {
  listing: Property;
  saved?: boolean;
  onToggleSave?: (listing: Property) => void;
}

/**
 * Listing card used on the huttspotter dashboard and Listings page.
 * The whole card opens the listing; the View button does the same for
 * people who look for an explicit action. The heart saves / unsaves.
 */
export default function ListingCard({
  listing,
  saved = false,
  onToggleSave,
}: ListingCardProps) {
  const router = useRouter();
  const coverPhoto = listing.media?.photos?.[0];
  const open = () => router.push(`/huttspotter/listing/${listing._id}`);

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter") open();
      }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-line bg-surface outline-none transition-shadow hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] focus-visible:ring-4 focus-visible:ring-secondary/20"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-subtle">
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-faint">
            <ImageOff size={20} />
            <span className="text-xs">No photo</span>
          </div>
        )}

        {listing.purpose && (
          <span className="absolute left-2 top-2 rounded-full bg-surface px-2.5 py-1 text-[10px] font-bold text-ink sm:left-3 sm:top-3 sm:text-[11px]">
            {listing.purpose}
          </span>
        )}

        {onToggleSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(listing);
            }}
            aria-label={saved ? "Remove from saved" : "Save listing"}
            aria-pressed={saved}
            className="heart-btn absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-surface sm:right-3 sm:top-3 sm:h-9 sm:w-9"
          >
            <Heart
              size={16}
              fill={saved ? "#ff6b35" : "none"}
              color={saved ? "#ff6b35" : "var(--color-ink)"}
            />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="line-clamp-1 text-sm font-semibold text-ink sm:text-[15px]">
          {listing.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted sm:text-sm">
          <MapPin size={12} className="flex-shrink-0" />
          <span className="truncate">
            {listing.location?.city ?? ""}
            {listing.location?.state ? `, ${listing.location.state}` : ""}
          </span>
        </p>

        <div className="mt-auto pt-3">
          <p className="truncate font-poppins text-sm font-semibold text-secondary sm:text-base">
            ₦{listing.price.toLocaleString()}
            <span className="font-nunito text-xs font-semibold text-muted">
              {" "}
              / {listing.paymentType}
            </span>
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            className="mt-3 flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-ink text-xs font-semibold text-on-ink transition-colors hover:bg-ink/90 sm:h-10 sm:text-sm"
          >
            View listing
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
