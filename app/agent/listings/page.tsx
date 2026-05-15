"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAgentProperties } from "@/lib/agent";
import { PropertyResponse } from "@/lib/types";

export default function MyListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await getAgentProperties();
        setListings(res.properties);
      } catch (error) {
        console.error("Failed to fetch agent properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleDeleteSelected = () => {
    // TODO: Add bulk delete API call here
    setListings((prev) => prev.filter((l) => !selectedIds.includes(l._id)));
    setSelectedIds([]);
    setDeleteMode(false);
  };

  const handleRemoveSingle = (id: string) => {
    // TODO: Add single delete API call here
    setListings((prev) => prev.filter((l) => l._id !== id));
  };

  return (
    <div className="px-5">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="cursor-pointer">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-[#1a1a1a]">My Listings</h1>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/agent/listings/add")}
          className="flex-1 bg-secondary text-white rounded-full py-3 text-sm font-semibold cursor-pointer"
        >
          Add Listing
        </button>
        <button
          onClick={() => {
            setDeleteMode(!deleteMode);
            setSelectedIds([]);
          }}
          className={`flex-1 rounded-full py-3 text-sm font-semibold cursor-pointer border transition-all duration-200 ${
            deleteMode
              ? "bg-red-500 text-white border-red-500"
              : "bg-white text-[#1a1a1a] border-gray-300"
          }`}
        >
          {deleteMode ? "Cancel" : "Delete listing"}
        </button>
      </div>

      {/* Delete selected bar */}
      {deleteMode && selectedIds.length > 0 && (
        <button
          onClick={handleDeleteSelected}
          className="w-full bg-red-500 text-white rounded-full py-3 text-sm font-semibold cursor-pointer mb-4"
        >
          Delete {selectedIds.length} selected
        </button>
      )}

      {/* Listings */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-400 text-sm">No listings yet.</p>
            <button
              onClick={() => router.push("/agent/listings/add")}
              className="mt-4 bg-secondary text-white rounded-full px-6 py-3 text-sm font-semibold cursor-pointer"
            >
              Add your first listing
            </button>
          </div>
        ) : (
          listings.map((listing) => {
            const coverImage =
              listing.media?.photos?.[0] ||
              "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&q=80";

            return (
              <div
                key={listing._id}
                onClick={() => deleteMode && toggleSelect(listing._id)}
                className={`bg-gray-300 rounded-2xl overflow-hidden flex items-center gap-3 p-3 transition-all duration-200 ${
                  deleteMode ? "cursor-pointer" : ""
                } ${
                  selectedIds.includes(listing._id) ? "ring-2 ring-red-500" : ""
                }`}
              >
                {/* Delete mode checkbox */}
                {deleteMode && (
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      selectedIds.includes(listing._id)
                        ? "bg-red-500 border-red-500"
                        : "bg-white border-gray-400"
                    }`}
                  >
                    {selectedIds.includes(listing._id) && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                )}

                {/* Image with Draft Overlay */}
                <div className="relative flex-shrink-0">
                  <img
                    src={coverImage}
                    alt={listing.title}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  {!listing.isPublished && (
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                      Draft (Step {listing.currentStep})
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a] leading-snug mb-1 truncate">
                    {listing.title}
                  </p>
                  <p className="text-sm font-bold text-[#1a1a1a] mb-3">
                    ₦{listing.price.toLocaleString()}{" "}
                    {listing.paymentType ? `/ ${listing.paymentType}` : ""}
                  </p>

                  {/* Action buttons — hidden in delete mode */}
                  {!deleteMode && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          router.push(`/agent/listings/${listing._id}/edit`)
                        }
                        className="bg-secondary text-white rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer"
                      >
                        {listing.isPublished ? "Edit" : "Resume"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSingle(listing._id);
                        }}
                        className="border-2 border-red-500 text-red-500 rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
