"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

// Temporary mock data — replace with API data later
const mockListings = [
  {
    id: 1,
    title: "1 Bedroom Self-Con at GRA Phase 2",
    price: "1,550,000",
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&q=80",
  },
  {
    id: 2,
    title: "1 Bedroom Self-Con at GRA Phase 2",
    price: "1,550,000",
    image:
      "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=300&q=80",
  },
  {
    id: 3,
    title: "1 Bedroom Self-Con at GRA Phase 2",
    price: "1,550,000",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=80",
  },
  {
    id: 4,
    title: "1 Bedroom Self-Con at GRA Phase 2",
    price: "1,550,000",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80",
  },
  {
    id: 5,
    title: "1 Bedroom Self-Con at GRA Phase 2",
    price: "1,550,000",
    image:
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=300&q=80",
  },
];

export default function MyListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState(mockListings);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleDeleteSelected = () => {
    setListings((prev) => prev.filter((l) => !selectedIds.includes(l.id)));
    setSelectedIds([]);
    setDeleteMode(false);
  };

  const handleRemoveSingle = (id: number) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
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
        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-400 text-sm">No listings yet.</p>
            <button
              onClick={() => router.push("/listings/add")}
              className="mt-4 bg-secondary text-white rounded-full px-6 py-3 text-sm font-semibold cursor-pointer"
            >
              Add your first listing
            </button>
          </div>
        ) : (
          listings.map((listing) => (
            <div
              key={listing.id}
              onClick={() => deleteMode && toggleSelect(listing.id)}
              className={`bg-gray-300 rounded-2xl overflow-hidden flex items-center gap-3 p-3 transition-all duration-200 ${
                deleteMode ? "cursor-pointer" : ""
              } ${
                selectedIds.includes(listing.id) ? "ring-2 ring-red-500" : ""
              }`}
            >
              {/* Delete mode checkbox */}
              {deleteMode && (
                <div
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                    selectedIds.includes(listing.id)
                      ? "bg-red-500 border-red-500"
                      : "bg-white border-gray-400"
                  }`}
                >
                  {selectedIds.includes(listing.id) && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
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

              {/* Image */}
              <Image
                src={listing.image}
                alt={listing.title}
                width={100}
                height={100}
                className="rounded-xl object-cover flex-shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1a1a1a] leading-snug mb-1">
                  {listing.title}
                </p>
                <p className="text-sm font-bold text-[#1a1a1a] mb-3">
                  ₦{listing.price} / year
                </p>

                {/* Action buttons — hidden in delete mode */}
                {!deleteMode && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        router.push(`/listings/${listing.id}/edit`)
                      }
                      className="bg-secondary text-white rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveSingle(listing.id)}
                      className="border-2 border-red-500 text-red-500 rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer"
                    >
                      Remove Listing
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
