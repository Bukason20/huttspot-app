"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Bath,
  BedDouble,
  CircleAlert,
  ImageOff,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { getAgentProperties } from "@/lib/agent";
import { PropertyResponse } from "@/lib/types";
import { useListing } from "@/context/ListingContext";
import {
  DRAFT_STEP_LABEL,
  getResumeRoute,
  resumeFormData,
} from "@/components/agent/listing/resume";

type Tab = "all" | "live" | "drafts";

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-gray-100 bg-white">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-3.5 w-3/4 rounded-full bg-gray-200" />
        <div className="h-2.5 w-1/2 rounded-full bg-gray-200" />
        <div className="mt-2 h-4 w-1/3 rounded-full bg-gray-200" />
        <div className="mt-3 h-10 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}

export default function MyListingsPage() {
  const router = useRouter();
  const { setFormData, reset } = useListing();
  const [listings, setListings] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<PropertyResponse | null>(null);

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

  const handleRemoveSingle = (id: string) => {
    // TODO: Add single delete API call here
    setListings((prev) => prev.filter((l) => l._id !== id));
  };

  const handleResume = (listing: PropertyResponse) => {
    // Pre-populate context with existing data so forms are pre-filled
    setFormData(resumeFormData(listing));
    router.push(getResumeRoute(listing.currentStep ?? 0));
  };

  const handleAddNew = () => {
    reset(); // clear any existing data
    router.push("/agent/listings/add");
  };

  const live = listings.filter((l) => l.isPublished);
  const drafts = listings.filter((l) => !l.isPublished);
  const q = query.trim().toLowerCase();
  const visible = useMemo(() => {
    const base = tab === "live" ? live : tab === "drafts" ? drafts : listings;
    if (!q) return base;
    return base.filter((l) =>
      [l.title, l.type, l.location?.city, l.location?.state]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings, tab, q]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: listings.length },
    { key: "live", label: "Live", count: live.length },
    { key: "drafts", label: "Drafts", count: drafts.length },
  ];

  return (
    <div className="px-5">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
        <div>
          <h1 className="font-poppins text-2xl font-semibold tracking-tight sm:text-3xl">
            My listings
          </h1>
          <p className="mt-1 text-gray-500">
            Manage your properties and pick up drafts where you left off.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-secondary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#08744a]"
        >
          <Plus size={18} /> New listing
        </button>
      </div>

      {/* Tabs + search */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div role="tablist" className="inline-flex gap-1 self-start rounded-full border border-gray-200 bg-white p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                tab === t.key ? "bg-[#1a1a1a] text-white" : "text-tertiary hover:bg-gray-50"
              }`}
            >
              {t.label}
              {!loading && (
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    tab === t.key ? "bg-white/20" : "bg-gray-100"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex h-12 w-full items-center gap-2 rounded-full border border-gray-200 bg-white px-4 transition-colors focus-within:border-secondary md:max-w-xs">
          <Search size={17} className="flex-shrink-0 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your listings"
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search" className="cursor-pointer text-gray-400">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7f7f5]">
            <Plus size={24} className="text-secondary" />
          </span>
          <p className="mt-4 font-poppins text-lg font-semibold">
            {q
              ? "No listings match"
              : tab === "drafts"
                ? "No drafts"
                : tab === "live"
                  ? "Nothing live yet"
                  : "Add your first property"}
          </p>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            {q
              ? "Try another title or area."
              : "It takes about 5 minutes. Have a few photos of the place ready."}
          </p>
          {!q && (
            <button
              onClick={handleAddNew}
              className="mt-5 h-11 cursor-pointer rounded-full bg-secondary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#08744a]"
            >
              New listing
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((listing) => {
            const cover = listing.media?.photos?.[0];
            const step = listing.currentStep ?? 0;
            const place = [listing.location?.city, listing.location?.state].filter(Boolean).join(", ");

            return (
              <article
                key={listing._id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white transition-shadow hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f3efe6]">
                  {cover ? (
                    <img
                      src={cover}
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1.5 text-gray-400">
                      <ImageOff size={22} />
                      <span className="text-xs font-semibold">No photos yet</span>
                    </div>
                  )}
                  <span
                    className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      listing.isPublished ? "bg-secondary text-white" : "bg-white text-primary"
                    }`}
                  >
                    {listing.isPublished && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    {listing.isPublished ? "Live" : "Draft"}
                  </span>
                  <button
                    onClick={() => setConfirmDelete(listing)}
                    aria-label="Remove listing"
                    className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/70"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs font-bold text-secondary">{listing.type}</p>
                  <p className="mt-1 line-clamp-1 font-bold">{listing.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={13} className="flex-shrink-0" />
                    <span className="truncate">{place || "Location not added"}</span>
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="font-poppins text-lg font-semibold">
                      ₦{listing.price.toLocaleString()}
                      {listing.paymentType && (
                        <span className="font-nunito text-xs font-semibold text-gray-500">
                          {" "}
                          / {listing.paymentType}
                        </span>
                      )}
                    </p>
                    {listing.details && (
                      <p className="flex items-center gap-2.5 text-xs font-semibold text-gray-500">
                        <span className="flex items-center gap-1">
                          <BedDouble size={13} /> {listing.details.bedrooms}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath size={13} /> {listing.details.bathrooms}
                        </span>
                      </p>
                    )}
                  </div>

                  {!listing.isPublished && (
                    <div className="mt-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((s) => (
                          <span
                            key={s}
                            className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-gray-100"}`}
                          />
                        ))}
                      </div>
                      <p className="mt-1.5 text-xs font-semibold text-gray-500">
                        {step} of 4 steps done · {DRAFT_STEP_LABEL[step] ?? "Incomplete"}
                      </p>
                    </div>
                  )}

                  <div className="mt-auto pt-4">
                    {listing.isPublished ? (
                      <button
                        onClick={() => router.push(`/agent/listings/${listing._id}/edit`)}
                        className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-200 bg-white text-sm font-semibold transition-colors hover:bg-gray-50"
                      >
                        <Pencil size={15} /> Edit listing
                      </button>
                    ) : (
                      <button
                        onClick={() => handleResume(listing)}
                        className="h-11 w-full cursor-pointer rounded-full bg-secondary text-sm font-semibold text-white transition-colors hover:bg-[#08744a]"
                      >
                        Continue listing
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:px-6"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-t-3xl bg-white px-6 pb-10 pt-6 sm:max-w-[420px] sm:rounded-3xl sm:p-8"
          >
            <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-gray-200 sm:hidden" />
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <CircleAlert size={22} className="text-red-500" />
            </span>
            <h2 className="mt-4 font-poppins text-xl font-semibold">Remove this listing?</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              <span className="font-bold text-[#1a1a1a]">{confirmDelete.title}</span>{" "}
              will no longer be visible to huttspotters.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={() => setConfirmDelete(null)}
                className="h-12 flex-1 cursor-pointer rounded-full border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50"
              >
                Keep it
              </button>
              <button
                onClick={() => {
                  handleRemoveSingle(confirmDelete._id);
                  setConfirmDelete(null);
                }}
                className="h-12 flex-1 cursor-pointer rounded-full bg-red-500 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
