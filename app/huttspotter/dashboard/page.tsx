"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Heart, SlidersHorizontal, MapPin } from "lucide-react";
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
      {/* Header + search */}
      <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-500">
            Hello, {user?.name?.split(" ")[0] ?? "there"}
          </p>
          <h1 className="font-poppins text-2xl font-semibold tracking-tight sm:text-3xl">
            Find your next spot
          </h1>
        </div>

        <div className="flex w-full items-center gap-2 lg:max-w-md">
          <div className="flex h-12 flex-1 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 transition-colors focus-within:border-secondary">
            <Search size={18} className="flex-shrink-0 text-gray-400" />
            <input
              type="text"
              placeholder="Search location, property..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            aria-label="Filters"
            className="flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#1a1a1a] transition-colors hover:bg-black"
          >
            <SlidersHorizontal size={18} color="#fff" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Map — top on mobile, sticky right column on desktop */}
        <aside className="lg:order-2">
          <div className="h-48 overflow-hidden rounded-3xl border border-gray-100 bg-gray-100 sm:h-64 lg:sticky lg:top-8 lg:h-[calc(100vh-10rem)]">
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
        </aside>

        {/* Listings */}
        <section className="lg:order-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-poppins text-lg font-semibold">
              Recent Listings
              <span className="ml-2 text-sm font-normal text-gray-500">
                {filtered.length}
              </span>
            </h2>
            <button className="cursor-pointer text-sm font-semibold text-secondary hover:underline">
              See all
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
              <Search size={24} className="mx-auto text-gray-300" />
              <p className="mt-3 font-semibold">No listings found.</p>
              <p className="mt-1 text-sm text-gray-500">
                Try a different location or property name.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((listing) => {
                const coverPhoto = listing.media?.photos?.[0];
                const isSaved = savedIds.includes(listing._id);

                return (
                  <div
                    key={listing._id}
                    onClick={() =>
                      router.push(`/huttspotter/listing/${listing._id}`)
                    }
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      {coverPhoto ? (
                        <img
                          src={coverPhoto}
                          alt={listing.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-xs text-gray-400">No photo</span>
                        </div>
                      )}

                      {/* Save button */}
                      <button
                        onClick={(e) => handleToggleSave(e, listing._id)}
                        aria-label={isSaved ? "Remove from saved" : "Save listing"}
                        className="heart-btn absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white sm:right-3 sm:top-3"
                      >
                        <Heart
                          size={15}
                          fill={isSaved ? "#ff6b35" : "none"}
                          color={isSaved ? "#ff6b35" : "#1a1a1a"}
                        />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-3 sm:p-4">
                      <p className="line-clamp-1 text-sm font-semibold text-[#1a1a1a] sm:text-[15px]">
                        {listing.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 sm:text-sm">
                        <MapPin size={12} className="flex-shrink-0" />
                        <span className="truncate">
                          {listing.location?.city ?? ""}
                          {listing.location?.state
                            ? `, ${listing.location.state}`
                            : ""}
                        </span>
                      </p>
                      <p className="mt-2 font-poppins text-sm font-semibold text-secondary sm:text-base">
                        ₦{listing.price.toLocaleString()}
                        <span className="font-nunito text-xs font-semibold text-gray-500">
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
        </section>
      </div>
    </div>
  );
}
