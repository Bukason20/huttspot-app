"use client";

import { useUser } from "@/context/UserContext";
import { listings } from "@/data";

export default function AgentDashboardPage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-secondary border-t-transparent animate-spin" />
      </div>
    );
  }

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
              {/* Show only first name */}
              {user?.name?.split(" ")[0] ?? "..."}
            </span>
          </p>
          <p className="text-sm text-gray-500">
            {user?.accountMode === "AGENT" ? "Agent" : "Huttspoter"}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      {/* TODO: replace values with real API data when endpoint is available */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-secondary rounded-2xl px-4 py-5 flex flex-col gap-1">
          <p className="text-white/80 text-sm font-medium">Active Listings</p>
          <p className="text-white text-3xl font-bold">--</p>
        </div>
        <div className="bg-secondary rounded-2xl px-4 py-5 flex flex-col gap-1">
          <p className="text-white/80 text-sm font-medium">New Requests</p>
          <p className="text-white text-3xl font-bold">--</p>
        </div>
      </div>

      {/* Placeholder avatar row */}
      <div className="flex items-center gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-14 h-14 rounded-full bg-gray-300" />
        ))}
      </div>

      {/* My Listings */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#1a1a1a]">My Listings</h2>
        <div className="h-px bg-gray-300 mt-2" />
      </div>

      {/* TODO: replace with real listings from API when endpoint is available */}
      <div className="flex flex-col gap-3">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="bg-gray-300 rounded-2xl overflow-hidden flex items-center gap-3 p-3"
          >
            {/* Image */}
            <img
              src={listing.image}
              alt="listing"
              className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1a1a1a] leading-snug mb-1">
                {listing.title ?? "1 Bedroom Self-Con at GRA Phase 2"}
              </p>
              <p className="text-sm font-bold text-[#1a1a1a] mb-3">
                ₦{listing.price ?? "1,550,000"} / year
              </p>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button className="bg-secondary text-white rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer">
                  Edit
                </button>
                <button className="border-2 border-red-500 text-red-500 rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer">
                  Remove Listing
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
