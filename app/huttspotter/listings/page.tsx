"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Heart, LayoutGrid, Home, X } from "lucide-react";
import { getAllProperties } from "@/lib/properties";
import { Property } from "@/lib/types";
import { useSavedListings } from "@/lib/useSavedListings";
import { categoryFor, categoryRank } from "@/lib/categories";
import ListingCard from "@/components/huttspotter/ListingCard";
import { SkeletonText } from "@/components/ui";

const PAGE_SIZE = 24;
type Tab = "all" | "saved";

function ListingsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid animate-pulse grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
        >
          <div className="aspect-[4/3] bg-gray-200" />
          <div className="flex flex-col gap-2 p-3 sm:p-4">
            <SkeletonText className="w-full" />
            <SkeletonText className="w-2/3" />
            <SkeletonText className="mt-2 w-1/2" />
            <div className="mt-2 h-9 rounded-full bg-gray-200 sm:h-10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ListingsContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [tab, setTab] = useState<Tab>(
    params.get("tab") === "saved" ? "saved" : "all",
  );
  const [type, setType] = useState<string>(params.get("type") ?? "All");
  const [search, setSearch] = useState("");

  const [listings, setListings] = useState<Property[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const saved = useSavedListings();

  // Keep the URL in sync so the tab / filter survive refresh & back button
  useEffect(() => {
    const q = new URLSearchParams();
    if (tab === "saved") q.set("tab", "saved");
    if (type !== "All") q.set("type", type);
    const qs = q.toString();
    router.replace(qs ? `/huttspotter/listings?${qs}` : "/huttspotter/listings", {
      scroll: false,
    });
  }, [tab, type, router]);

  const loadPage = async (p: number) => {
    const res = await getAllProperties({ page: p, limit: PAGE_SIZE });
    setListings((prev) => (p === 1 ? res.data : [...prev, ...res.data]));
    setPage(p);
    setTotalPages(res.totalPages ?? 1);
  };

  useEffect(() => {
    loadPage(1)
      .catch((err) => console.error("Failed to load listings:", err))
      .finally(() => setLoading(false));
  }, []);

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      await loadPage(page + 1);
    } catch (err) {
      console.error("Failed to load more listings:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const source = tab === "saved" ? saved.savedListings : listings;

  // Type chips: categories present in the current tab (+ the one in the URL)
  const types = useMemo(() => {
    const set = new Set(source.map((p) => categoryFor(p.type)));
    if (type !== "All") set.add(type);
    return ["All", ...[...set].sort((a, b) => categoryRank(a) - categoryRank(b) || a.localeCompare(b))];
  }, [source, type]);

  const q = search.trim().toLowerCase();
  const visible = source.filter((l) => {
    if (type !== "All" && categoryFor(l.type) !== type) return false;
    if (!q) return true;
    return [l.title, l.location?.city, l.location?.state]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(q));
  });

  const isLoading = tab === "saved" ? saved.loading : loading;
  const hasFilters = type !== "All" || !!q;

  return (
    <div className="px-5">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-poppins text-2xl font-semibold tracking-tight sm:text-3xl">
            Listings
          </h1>
          <p className="mt-1 text-gray-500">
            Browse every property on HuttSpot, or jump to the ones you saved.
          </p>
        </div>
        <div className="flex h-12 w-full items-center gap-2 rounded-full border border-gray-200 bg-white px-4 transition-colors focus-within:border-secondary lg:max-w-sm">
          <Search size={18} className="flex-shrink-0 text-gray-400" />
          <input
            type="text"
            placeholder="Search title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="cursor-pointer text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* All / Saved tabs */}
      <div
        role="tablist"
        className="mb-4 inline-grid grid-cols-2 gap-1 rounded-full border border-gray-200 bg-white p-1"
      >
        {(
          [
            { key: "all", label: "All listings", icon: LayoutGrid },
            { key: "saved", label: "Saved", icon: Heart },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => {
              setTab(key);
              setType("All");
            }}
            className={`flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors sm:px-5 ${
              tab === key
                ? "bg-[#1a1a1a] text-white"
                : "text-tertiary hover:bg-gray-50"
            }`}
          >
            <Icon
              size={15}
              fill={key === "saved" && tab === key ? "#fff" : "none"}
            />
            {label}
            {key === "saved" && !saved.loading && (
              <span
                className={`rounded-full px-1.5 text-xs ${
                  tab === key ? "bg-white/20" : "bg-gray-100"
                }`}
              >
                {saved.savedIds.size}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Type chips */}
      {!isLoading && types.length > 2 && (
        <div className="scrollbar-hide -mx-5 mb-6 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`h-9 flex-shrink-0 cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors ${
                type === t
                  ? "border-secondary bg-secondary/10 text-secondary"
                  : "border-gray-200 bg-white text-tertiary hover:border-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <ListingsGridSkeleton />
      ) : visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f7f7f5]">
            {tab === "saved" && !hasFilters ? (
              <Heart size={22} className="text-gray-400" />
            ) : (
              <Home size={22} className="text-gray-400" />
            )}
          </span>
          <p className="mt-4 font-semibold">
            {tab === "saved" && !hasFilters
              ? "No saved listings yet"
              : "No listings match your filters"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {tab === "saved" && !hasFilters
              ? "Tap the heart on any listing to keep it here."
              : "Try another type or search term."}
          </p>
          <button
            onClick={() => {
              setSearch("");
              setType("All");
              if (tab === "saved" && !hasFilters) setTab("all");
            }}
            className="mt-5 h-11 cursor-pointer rounded-full bg-secondary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#08744a]"
          >
            {tab === "saved" && !hasFilters ? "Browse listings" : "Clear filters"}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {visible.map((listing) => (
              <ListingCard
                key={listing._id}
                listing={listing}
                saved={saved.isSaved(listing._id)}
                onToggleSave={(l) => saved.toggle(l._id, l)}
              />
            ))}
          </div>

          {tab === "all" && page < totalPages && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex h-12 cursor-pointer items-center gap-2 rounded-full border border-gray-300 bg-white px-7 text-sm font-semibold transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMore && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {loadingMore ? "Loading..." : "Load more listings"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// useSearchParams needs a Suspense boundary in the App Router
export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="px-5">
          <SkeletonText className="mb-8 h-7 w-40" />
          <ListingsGridSkeleton />
        </div>
      }
    >
      <ListingsContent />
    </Suspense>
  );
}
