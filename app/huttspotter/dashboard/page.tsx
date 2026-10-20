"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Heart, SlidersHorizontal, Loader } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { getAllProperties } from "@/lib/properties";
import { toggleSaveProperty } from "@/lib/userProperties";
import { Property } from "@/lib/types";
import { HuttspotterDashboardSkeleton } from "@/components/ui";

export default function HuttspotterDashboard() {
  const router = useRouter();
  const { user } = useUser();

  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAllProperties({ limit: 20 });
        setListings(res.data);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleToggleSave = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (savingId) return;
    setSavingId(id);
    try {
      await toggleSaveProperty(id);
      setSavedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    } catch (err) {
      console.error("Failed to save listing:", err);
    } finally {
      setSavingId(null);
    }
  };

  const filtered = listings.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.location?.city ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (l.location?.state ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return <HuttspotterDashboardSkeleton />;
  }

  return (
    <div className="px-5">
      {/* Search bar */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-full px-4 py-3 shadow-sm">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search location, property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none placeholder:text-gray-400 bg-transparent"
          />
        </div>
        <button className="w-11 h-11 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer">
          <SlidersHorizontal size={18} color="#fff" />
        </button>
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden mb-5 h-48">
        <iframe
          src="https://maps.google.com/maps?q=Port+Harcourt+Nigeria&output=embed&z=12"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-[#1a1a1a]">Recent Listings</h2>
        <button className="text-xs text-secondary font-semibold cursor-pointer">
          See all
        </button>
      </div>

      {/* Listings */}
      {filtered.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-10">
          No listings found.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((listing) => {
            const coverPhoto = listing.media?.photos?.[0];
            const isSaved = savedIds.includes(listing._id);

            return (
              <div
                key={listing._id}
                onClick={() =>
                  router.push(`/huttspotter/listing/${listing._id}`)
                }
                className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm"
              >
                {/* Image */}
                <div className="relative">
                  {coverPhoto ? (
                    <img
                      src={coverPhoto}
                      alt={listing.title}
                      className="w-full h-28 object-cover"
                    />
                  ) : (
                    <div className="w-full h-28 bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-400">No photo</span>
                    </div>
                  )}

                  {/* Save button */}
                  <button
                    onClick={(e) => handleToggleSave(e, listing._id)}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center cursor-pointer"
                  >
                    <Heart
                      size={14}
                      fill={isSaved ? "#e8622a" : "none"}
                      color={isSaved ? "#e8622a" : "#374151"}
                    />
                  </button>

                  {/* Time badge */}
                  <div className="absolute bottom-2 left-2 bg-black/50 rounded-full px-2 py-0.5">
                    <p className="text-white text-[9px] font-medium">
                      {listing.location?.city ?? ""},{" "}
                      {listing.location?.state ?? ""}
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2.5">
                  <p className="text-xs font-semibold text-[#1a1a1a] leading-snug mb-1 line-clamp-2">
                    {listing.title}
                  </p>
                  <p className="text-xs font-bold text-secondary">
                    ₦{listing.price.toLocaleString()}
                    <span className="text-gray-400 font-normal">
                      {" "}
                      / {listing.paymentType}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
