"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { getSavedProperties, toggleSaveProperty } from "@/lib/userProperties";
import { Property } from "@/lib/types";

export default function SavedListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSavedProperties();
        setListings(res.data);
      } catch (err) {
        console.error("Failed to fetch saved listings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleRemove = async (id: string) => {
    if (removingId) return;
    setRemovingId(id);
    try {
      await toggleSaveProperty(id); // toggles off (unsaves)
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      console.error("Failed to remove listing:", err);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader size={28} className="text-secondary animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5">
      <h1 className="text-xl font-bold text-[#1a1a1a] mb-6">Saved Listings</h1>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-400 text-sm">No saved listings yet.</p>
          <button
            onClick={() => router.push("/huttspotter/dashboard")}
            className="mt-4 bg-secondary text-white rounded-full px-6 py-3 text-sm font-semibold cursor-pointer"
          >
            Browse listings
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map((listing) => {
            const coverPhoto = listing.media?.photos?.[0];
            const isRemoving = removingId === listing._id;

            return (
              <div
                key={listing._id}
                className="bg-gray-200 rounded-2xl overflow-hidden flex items-center gap-3 p-3"
              >
                {coverPhoto ? (
                  <img
                    src={coverPhoto}
                    alt={listing.title}
                    className="w-24 h-20 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-24 h-20 rounded-xl bg-gray-300 flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a] leading-snug mb-0.5 line-clamp-2">
                    {listing.title}
                  </p>
                  <p className="text-xs text-gray-400 mb-1">
                    {listing.location?.city ?? ""},{" "}
                    {listing.location?.state ?? ""}
                  </p>
                  <p className="text-sm font-bold text-[#1a1a1a] mb-2">
                    ₦{listing.price.toLocaleString()} / {listing.paymentType}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        router.push(`/huttspotter/listing/${listing._id}`)
                      }
                      className="bg-secondary text-white rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleRemove(listing._id)}
                      disabled={isRemoving}
                      className="border-2 border-red-400 text-red-400 rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50"
                    >
                      {isRemoving ? "..." : "Remove"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
