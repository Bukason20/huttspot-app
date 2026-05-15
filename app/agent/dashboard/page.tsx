"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getAgentProperties } from "@/lib/agent";
import { PropertyResponse } from "@/lib/types";

export default function AgentDashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
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

  if (userLoading || listingsLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-secondary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Calculate active listings (properties that are published)
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
          {/* Still pending a real API endpoint for requests */}
          <p className="text-white text-3xl font-bold">0</p>
        </div>
      </div>

      {/* Placeholder avatar row for requests/chats */}
      <div className="flex items-center gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-14 h-14 rounded-full bg-gray-300" />
        ))}
      </div>

      {/* My Listings */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1a1a1a]">Recent Listings</h2>
        <button
          onClick={() => router.push("/agent/listings")}
          className="text-sm font-semibold text-secondary cursor-pointer"
        >
          View all
        </button>
      </div>
      <div className="h-px bg-gray-300 mt-2 mb-4" />

      <div className="flex flex-col gap-3">
        {listings.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">
            You don't have any properties yet.
          </p>
        ) : (
          // Slicing to show only the 3 most recent on the dashboard
          listings.slice(0, 3).map((listing) => {
            const coverImage =
              listing.media?.photos?.[0] ||
              "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&q=80";

            return (
              <div
                key={listing._id}
                className="bg-gray-300 rounded-2xl overflow-hidden flex items-center gap-3 p-3"
              >
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

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        router.push(`/agent/listings/${listing._id}/edit`)
                      }
                      className="bg-secondary text-white rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer"
                    >
                      {listing.isPublished ? "Edit" : "Resume"}
                    </button>
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
