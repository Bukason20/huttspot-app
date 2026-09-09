"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAgentProperties } from "@/lib/agent";
import { PropertyResponse } from "@/lib/types";
import { useListing } from "@/context/ListingContext";

// Maps currentStep from backend to the correct page
// Step 1 = basic info done → resume at step 2 (location)
// Step 2 = location done → resume at step 3 (details)
// Step 3 = details done → resume at step 4 (media)
const getResumeRoute = (currentStep: number) => {
  switch (currentStep) {
    case 1:
      return "/agent/listings/add/location";
    case 2:
      return "/agent/listings/add/details";
    case 3:
      return "/agent/listings/add/media";
    default:
      return "/agent/listings/add";
  }
};

export default function MyListingsPage() {
  const router = useRouter();
  const { setFormData, reset } = useListing();
  const [listings, setListings] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await getAgentProperties();
        setListings(res.properties);
        console.log(res.properties);
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

  const handleResume = (listing: PropertyResponse) => {
    // Pre-populate context with existing data so forms are pre-filled
    setFormData({
      propertyId: listing._id,
      propertyName: listing.title,
      propertyType: listing.type,
      listingFor: listing.purpose as any,
      price: listing.price.toString(),
      paymentType: listing.paymentType as any,
      // Location if available
      ...(listing.location && {
        state: listing.location.state,
        city: listing.location.city,
        street: listing.location.street ?? "",
      }),
      // Details if available
      ...(listing.details && {
        bedrooms: listing.details.bedrooms.toString(),
        bathrooms: listing.details.bathrooms.toString(),
        toilets: listing.details.toilets.toString(),
        parkingSpaces: listing.details.parkingSpaces.toString(),
        amenities: listing.details.features,
      }),
    });

    const route = getResumeRoute(listing.currentStep ?? 0);
    router.push(route);
  };

  const handleAddNew = () => {
    reset(); // clear any existing data
    router.push("/agent/listings/add");
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
          onClick={handleAddNew}
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
            <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-400 text-sm">No listings yet.</p>
            <button
              onClick={handleAddNew}
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

            const stepLabel: Record<number, string> = {
              1: "Location pending",
              2: "Details pending",
              3: "Media pending",
            };

            return (
              <div
                key={listing._id}
                onClick={() => deleteMode && toggleSelect(listing._id)}
                className={`bg-gray-300 rounded-2xl overflow-hidden flex items-center gap-3 p-3 transition-all duration-200 ${
                  deleteMode ? "cursor-pointer" : ""
                } ${selectedIds.includes(listing._id) ? "ring-2 ring-red-500" : ""}`}
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

                {/* Image */}
                <div className="relative flex-shrink-0">
                  <img
                    src={coverImage}
                    alt={listing.title}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  {!listing.isPublished && (
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                      Draft
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a] leading-snug mb-0.5 truncate">
                    {listing.title}
                  </p>

                  {/* Draft progress indicator */}
                  {!listing.isPublished &&
                    listing.currentStep !== undefined && (
                      <p className="text-[10px] text-orange-500 font-medium mb-1">
                        {stepLabel[listing.currentStep] ?? "Incomplete"}
                      </p>
                    )}

                  <p className="text-sm font-bold text-[#1a1a1a] mb-2">
                    ₦{listing.price.toLocaleString()}
                    {listing.paymentType ? ` / ${listing.paymentType}` : ""}
                  </p>

                  {!deleteMode && (
                    <div className="flex items-center gap-2">
                      {listing.isPublished ? (
                        // Published — show Edit button
                        <button
                          onClick={() =>
                            router.push(`/agent/listings/${listing._id}/edit`)
                          }
                          className="bg-secondary text-white rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                      ) : (
                        // Draft — show Resume button
                        <button
                          onClick={() => handleResume(listing)}
                          className="bg-secondary text-white rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer"
                        >
                          Resume
                        </button>
                      )}
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
