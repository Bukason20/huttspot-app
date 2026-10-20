"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useListing } from "@/context/ListingContext";
import { getAgentProperties } from "@/lib/agent";
import { PropertyResponse } from "@/lib/types";
import { AgentDashboardSkeleton } from "@/components/ui";

// Maps currentStep to the correct resume route
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

export default function AgentDashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { setFormData } = useListing();
  const [listings, setListings] = useState<PropertyResponse[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await getAgentProperties();
        setListings(res.properties);
      } catch (error) {
        console.error("Failed to load dashboard listings", error);
      } finally {
        setListingsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleResume = (listing: PropertyResponse) => {
    // Pre-populate context with existing data
    setFormData({
      propertyId: listing._id,
      propertyName: listing.title,
      propertyType: listing.type,
      listingFor: listing.purpose as any,
      price: listing.price.toString(),
      paymentType: listing.paymentType as any,
      ...(listing.location && {
        state: listing.location.state,
        city: listing.location.city,
        street: listing.location.street ?? "",
      }),
      ...(listing.details && {
        bedrooms: listing.details.bedrooms.toString(),
        bathrooms: listing.details.bathrooms.toString(),
        toilets: listing.details.toilets.toString(),
        parkingSpaces: listing.details.parkingSpaces.toString(),
        amenities: listing.details.features,
      }),
    });

    router.push(getResumeRoute(listing.currentStep ?? 0));
  };

  if (userLoading || listingsLoading) {
    return <AgentDashboardSkeleton />;
  }

  const activeListingsCount = listings.filter((l) => l.isPublished).length;

  return (
    <div className="px-5">
      {/* Welcome */}
      <div className="flex items-center gap-3 mb-6">
        {user?.profilePhoto ? (
          <img
            src={user.profilePhoto}
            alt={user.name}
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {user?.name?.charAt(0) ?? "?"}
          </div>
        )}
        <div>
          <p className="text-lg font-normal text-[#1a1a1a]">
            Welcome Back,{" "}
            <span className="font-bold">
              {user?.name?.split(" ")[0] ?? "..."}
            </span>
          </p>
          <p className="text-sm text-gray-500">
            {user?.accountMode === "AGENT" ? "Agent" : "Huttspoter"}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-secondary rounded-2xl px-4 py-5 flex flex-col gap-1">
          <p className="text-white/80 text-sm font-medium">Active Listings</p>
          <p className="text-white text-3xl font-bold">{activeListingsCount}</p>
        </div>
        <div className="bg-secondary rounded-2xl px-4 py-5 flex flex-col gap-1">
          <p className="text-white/80 text-sm font-medium">New Requests</p>
          <p className="text-white text-3xl font-bold">0</p>
        </div>
      </div>

      {/* Placeholder avatar row */}
      <div className="flex items-center gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-14 h-14 rounded-full bg-gray-300" />
        ))}
      </div>

      {/* Recent Listings */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1a1a1a]">Recent Listings</h2>
        <button
          onClick={() => router.push("/agent/listings")}
          className="text-sm font-semibold text-secondary cursor-pointer"
        >
          View all
        </button>
      </div>
      <div className="h-px bg-gray-300 mb-4" />

      <div className="flex flex-col gap-3">
        {listings.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">
            You don't have any properties yet.
          </p>
        ) : (
          listings.slice(0, 3).map((listing) => {
            const coverImage =
              listing.media?.photos?.[0] ||
              "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&q=80";

            return (
              <div
                key={listing._id}
                className="bg-gray-300 rounded-2xl overflow-hidden flex items-center gap-3 p-3"
              >
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

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a] leading-snug mb-1 truncate">
                    {listing.title}
                  </p>
                  <p className="text-sm font-bold text-[#1a1a1a] mb-3">
                    ₦{listing.price.toLocaleString()}
                    {listing.paymentType ? ` / ${listing.paymentType}` : ""}
                  </p>

                  <div className="flex items-center gap-2">
                    {listing.isPublished ? (
                      // Published → Edit
                      <button
                        onClick={() =>
                          router.push(`/agent/listings/${listing._id}/edit`)
                        }
                        className="bg-secondary text-white rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer"
                      >
                        Edit
                      </button>
                    ) : (
                      // Draft → Resume (pre-fills context, routes to correct step)
                      <button
                        onClick={() => handleResume(listing)}
                        className="bg-secondary text-white rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer"
                      >
                        Resume
                      </button>
                    )}
                    <button className="border-2 border-red-500 text-red-500 rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
