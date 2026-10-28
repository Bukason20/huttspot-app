"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ArrowRight } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { getAllProperties } from "@/lib/properties";
import { useSavedListings } from "@/lib/useSavedListings";
import ListingCard from "@/components/huttspotter/ListingCard";
import { Property } from "@/lib/types";
import { HuttspotterDashboardSkeleton } from "@/components/ui";

export default function HuttspotterDashboard() {
  const router = useRouter();
  const { user } = useUser();

  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  // Saved state comes from the API, so hearts stay filled after a refresh
  const { isSaved, toggle } = useSavedListings();

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
          <p className="text-sm font-semibold text-muted">
            Hello, {user?.name?.split(" ")[0] ?? "there"}
          </p>
          <h1 className="font-poppins text-2xl font-semibold tracking-tight sm:text-3xl">
            Find your next spot
          </h1>
        </div>

        <div className="flex w-full items-center gap-2 lg:max-w-md">
          <div className="flex h-12 flex-1 items-center gap-2 rounded-full border border-line-strong bg-surface px-4 transition-colors focus-within:border-secondary">
            <Search size={18} className="flex-shrink-0 text-faint" />
            <input
              type="text"
              placeholder="Search location, property..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-faint"
            />
          </div>
          <button
            aria-label="Filters"
            className="flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-ink transition-colors hover:bg-ink/90"
          >
            <SlidersHorizontal size={18} className="text-on-ink" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Map — top on mobile, sticky right column on desktop */}
        <aside className="lg:order-2">
          <div className="h-48 overflow-hidden rounded-3xl border border-line bg-subtle sm:h-64 lg:sticky lg:top-8 lg:h-[calc(100vh-10rem)]">
            <iframe
              className="theme-map"
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
              <span className="ml-2 text-sm font-normal text-muted">
                {filtered.length}
              </span>
            </h2>
            <button
              onClick={() => router.push("/huttspotter/listings")}
              className="group flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-secondary"
            >
              See all
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
              <Search size={24} className="mx-auto text-faint" />
              <p className="mt-3 font-semibold">No listings found.</p>
              <p className="mt-1 text-sm text-muted">
                Try a different location or property name.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((listing) => (
                <ListingCard
                  key={listing._id}
                  listing={listing}
                  saved={isSaved(listing._id)}
                  onToggleSave={(l) => toggle(l._id, l)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
