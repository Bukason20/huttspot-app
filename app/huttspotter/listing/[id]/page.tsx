"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle,
  Check,
  X,
  Send,
  MapPin,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  Bath,
  Droplets,
  Car,
  MessageCircle,
  UserRound,
  BadgeCheck,
  Lock,
  ImageOff,
  SearchX,
} from "lucide-react";
import { getPropertyById } from "@/lib/properties";
import { useSavedListings } from "@/lib/useSavedListings";
import { sendInquiry } from "@/lib/chat";
import { getAllProperties } from "@/lib/properties";
import { Property } from "@/lib/types";
import { ListingDetailSkeleton } from "@/components/ui";

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [listing, setListing] = useState<Property | null>(null);
  const [otherListings, setOtherListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  // Saved state is loaded from the API so the bookmark is right after refresh
  const { isSaved, toggle } = useSavedListings();
  const saved = isSaved(id);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Inquiry modal state
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryError, setInquiryError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const [detailRes, othersRes] = await Promise.all([
          getPropertyById(id),
          getAllProperties({ limit: 4 }),
        ]);
        setListing(detailRes.data);
        setOtherListings(
          othersRes.data.filter((p) => p._id !== id).slice(0, 3),
        );
      } catch (err) {
        console.error("Failed to load listing:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleToggleSave = () => {
    toggle(id, listing ?? undefined);
  };

  const handleSendInquiry = async () => {
    if (!inquiryMessage.trim() || sendingInquiry) return;
    setSendingInquiry(true);
    setInquiryError("");
    try {
      const res = await sendInquiry(id, inquiryMessage.trim());
      setInquirySent(true);
      setInquiryMessage("");
      setConversationId(res.conversation._id);

      // isNewContext = true means property context switched on existing chat
      // either way we navigate to the same conversation
      if (res.isNewContext) {
        console.log(
          "Property context switched to:",
          res.conversation.propertySnapshot?.title,
        );
      }
    } catch (err: any) {
      setInquiryError(err.message || "Failed to send. Try again.");
    } finally {
      setSendingInquiry(false);
    }
  };


  if (loading) {
    return <ListingDetailSkeleton />;
  }

  if (!listing) {
    return (
      <div className="px-5">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-line bg-surface px-6 py-14 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-subtle">
            <SearchX size={26} className="text-faint" />
          </span>
          <h1 className="mt-5 font-poppins text-xl font-semibold">
            Listing not found
          </h1>
          <p className="mt-2 text-sm text-muted">
            It may have been removed or is no longer available.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-6 h-12 cursor-pointer rounded-full bg-secondary px-7 text-sm font-semibold text-white transition-colors hover:bg-[#08744a]"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const photos = listing.media?.photos ?? [];
  const hasPhotos = photos.length > 0;
  const goPhoto = (dir: 1 | -1) =>
    setActiveImage((i) => (i + dir + photos.length) % photos.length);

  const facts = listing.details
    ? [
        { icon: BedDouble, label: "Bedrooms", value: listing.details.bedrooms },
        { icon: Bath, label: "Bathrooms", value: listing.details.bathrooms },
        { icon: Droplets, label: "Toilets", value: listing.details.toilets },
        { icon: Car, label: "Parking", value: listing.details.parkingSpaces },
      ]
    : [];

  const infoRows = [
    { label: "Property type", value: listing.type },
    { label: "Listed for", value: listing.purpose },
    {
      label: "Listing type",
      value:
        listing.listingType === "shared"
          ? "Shared"
          : listing.listingType === "full"
            ? "Entire property"
            : listing.listingType,
    },
    { label: "Payment", value: listing.paymentType },
    { label: "City", value: listing.location?.city },
    { label: "State", value: listing.location?.state },
  ].filter((r) => r.value);

  const features = listing.details?.features ?? [];

  return (
    <div className="px-5">
      {/* ── Back + breadcrumb ─────────────────────────────── */}
      <div className="mb-5 flex items-center gap-3 lg:mb-6">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-surface text-ink transition-colors hover:bg-subtle"
        >
          <ArrowLeft size={18} />
        </button>
        <nav className="flex min-w-0 items-center gap-1.5 text-sm text-muted">
          <button
            onClick={() => router.push("/huttspotter/listings")}
            className="cursor-pointer hover:text-ink"
          >
            Listings
          </button>
          <ChevronRight size={14} className="flex-shrink-0" />
          <span className="truncate font-semibold text-ink">
            {listing.title}
          </span>
        </nav>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10">
        {/* ── Gallery ─────────────────────────────────────── */}
        <section>
          <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-subtle">
            {hasPhotos ? (
              <img
                src={photos[activeImage]}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-faint">
                <ImageOff size={28} />
                <span className="text-sm">No photos yet</span>
              </div>
            )}

            {listing.purpose && (
              <span className="absolute left-4 top-4 rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-ink">
                {listing.purpose}
              </span>
            )}

            {photos.length > 1 && (
              <>
                <span className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white">
                  {activeImage + 1} / {photos.length}
                </span>
                <button
                  onClick={() => goPhoto(-1)}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-surface/90 text-ink shadow-sm transition hover:bg-surface sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => goPhoto(1)}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-surface/90 text-ink shadow-sm transition hover:bg-surface sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="scrollbar-hide mt-3 flex gap-3 overflow-x-auto pb-1">
              {photos.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Photo ${i + 1}`}
                  className={`relative h-16 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl transition-all sm:h-20 sm:w-28 ${
                    activeImage === i
                      ? "ring-2 ring-secondary ring-offset-2"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Summary (sticky on desktop) ──────────────────── */}
        <section className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              {listing.type && (
                <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
                  {listing.type}
                </span>
              )}
              {listing.listingType === "shared" && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  Shared space
                </span>
              )}
            </div>

            <h1 className="mt-3 font-poppins text-2xl font-semibold leading-tight tracking-tight sm:text-[28px]">
              {listing.title}
            </h1>
            <p className="mt-2 flex items-start gap-1.5 text-muted">
              <MapPin size={16} className="mt-0.5 flex-shrink-0" />
              <span>
                {listing.location?.street ? `${listing.location.street}, ` : ""}
                {listing.location?.city}, {listing.location?.state}
              </span>
            </p>

            <div className="mt-5 flex items-end gap-1.5">
              <p className="font-poppins text-3xl font-semibold tracking-tight text-ink">
                ₦{listing.price.toLocaleString()}
              </p>
              <p className="pb-1 text-sm font-semibold text-muted">
                / {listing.paymentType}
              </p>
            </div>

            {/* Key facts */}
            {facts.length > 0 && (
              <div className="mt-6 grid grid-cols-4 gap-2">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center rounded-2xl bg-subtle px-1 py-3 text-center"
                  >
                    <Icon size={18} className="text-secondary" />
                    <p className="mt-1.5 font-poppins text-base font-semibold">
                      {value ?? 0}
                    </p>
                    <p className="text-[11px] font-semibold text-muted">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setShowInquiryModal(true)}
                className="flex h-13 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-secondary py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#08744a]"
              >
                <MessageCircle size={18} />
                Contact Agent
              </button>
              <button
                onClick={handleToggleSave}
                aria-label={saved ? "Remove from saved" : "Save listing"}
                aria-pressed={saved}
                className={`flex h-[52px] w-[52px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors disabled:opacity-60 ${
                  saved
                    ? "border-secondary bg-secondary/10"
                    : "border-line-strong bg-surface hover:bg-subtle"
                }`}
              >
                <Bookmark
                  size={20}
                  fill={saved ? "#0a8754" : "none"}
                  color={saved ? "#0a8754" : "var(--color-ink)"}
                />
              </button>
            </div>

            {/* Agent */}
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-line-strong p-4">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-subtle">
                <UserRound size={20} className="text-faint" />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-bold">
                  Verified agent
                  <BadgeCheck size={15} className="text-secondary" />
                </p>
                <p className="text-xs text-muted">
                  Send an inquiry to view agent details
                </p>
              </div>
            </div>

            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted">
              <Lock size={14} className="mt-0.5 flex-shrink-0 text-secondary" />
              Your contact details are shared with the agent only after they
              respond to your inquiry.
            </p>
          </div>
        </section>
      </div>

      {/* ── Details + amenities ─────────────────────────────── */}
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:mt-10 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
          <h2 className="font-poppins text-lg font-semibold">
            Property details
          </h2>
          <dl className="mt-4 divide-y divide-line">
            {infoRows.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between gap-4 py-3 text-sm"
              >
                <dt className="text-muted">{r.label}</dt>
                <dd className="text-right font-semibold text-ink">
                  {r.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
          <h2 className="font-poppins text-lg font-semibold">Amenities</h2>
          {features.length > 0 ? (
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {features.map((amenity) => (
                <li
                  key={amenity}
                  className="flex items-center gap-3 rounded-2xl bg-subtle px-4 py-3 text-sm font-semibold"
                >
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Check size={13} strokeWidth={3} className="text-white" />
                  </span>
                  {amenity}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">
              The agent hasn&apos;t listed any amenities yet.
            </p>
          )}
        </section>
      </div>

      {/* ── Other listings ──────────────────────────────────── */}
      {otherListings.length > 0 && (
        <section className="mt-10 lg:mt-14">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-poppins text-xl font-semibold sm:text-2xl">
              You might also like
            </h2>
            <button
              onClick={() => router.push("/huttspotter/listings")}
              className="group flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-secondary"
            >
              View all
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </div>
          {/* Mobile: one swipeable row. sm+: grid */}
          <div className="scrollbar-hide -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-3">
            {otherListings.map((l) => (
              <div
                key={l._id}
                onClick={() => router.push(`/huttspotter/listing/${l._id}`)}
                className="group w-[78%] flex-shrink-0 cursor-pointer snap-start overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:w-auto"
              >
                <div className="aspect-[4/3] overflow-hidden bg-subtle">
                  {l.media?.photos?.[0] ? (
                    <img
                      src={l.media.photos[0]}
                      alt={l.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-faint">
                      <ImageOff size={22} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="line-clamp-1 font-semibold">{l.title}</p>
                  {l.location?.city && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                      <MapPin size={13} />
                      <span className="truncate">
                        {l.location.city}, {l.location.state}
                      </span>
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
                    <p className="min-w-0 truncate font-poppins font-semibold">
                      ₦{l.price.toLocaleString()}
                      <span className="font-nunito text-xs font-semibold text-muted">
                        {" "}
                        / {l.paymentType}
                      </span>
                    </p>
                    <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-white transition-colors group-hover:bg-[#08744a]">
                      View
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Inquiry modal: bottom sheet on mobile, dialog on larger screens ── */}
      {showInquiryModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:px-6"
          onClick={() => setShowInquiryModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-t-3xl bg-surface px-6 pb-10 pt-6 sm:max-w-[460px] sm:rounded-3xl sm:p-8"
          >
            {/* Handle (mobile) */}
            <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-skeleton sm:hidden" />

            {!inquirySent ? (
              <>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-poppins text-xl font-semibold text-ink">
                      Contact Agent
                    </h2>
                    <p className="mt-0.5 truncate text-sm text-muted">
                      About: {listing.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInquiryModal(false)}
                    aria-label="Close"
                    className="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-faint hover:bg-subtle"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="mb-4 flex items-start gap-2 rounded-2xl bg-subtle p-3 text-xs leading-relaxed text-muted">
                  <Lock size={14} className="mt-0.5 flex-shrink-0 text-secondary" />
                  Your contact details will be shared with the agent only after
                  they respond to your inquiry.
                </p>

                <textarea
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Hi, I'm interested in this property. Is it still available?"
                  rows={4}
                  className="mb-3 w-full resize-none rounded-2xl border border-line-strong px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-faint focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                />

                {inquiryError && (
                  <p className="mb-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-600">
                    {inquiryError}
                  </p>
                )}

                <button
                  onClick={handleSendInquiry}
                  disabled={!inquiryMessage.trim() || sendingInquiry}
                  className={`flex h-13 w-full items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-semibold transition-colors ${
                    inquiryMessage.trim() && !sendingInquiry
                      ? "cursor-pointer bg-secondary text-white hover:bg-[#08744a]"
                      : "cursor-not-allowed bg-subtle text-faint"
                  }`}
                >
                  <Send size={16} />
                  {sendingInquiry ? "Sending..." : "Send Inquiry"}
                </button>
              </>
            ) : (
              // Success state
              <div className="flex flex-col items-center py-4 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                  <CheckCircle size={30} className="text-secondary" />
                </div>
                <h2 className="mb-2 font-poppins text-xl font-semibold text-ink">
                  Inquiry Sent!
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-muted">
                  The agent will respond to your inquiry. You&apos;ll be
                  notified when they reply.
                </p>
                <button
                  onClick={() => {
                    setShowInquiryModal(false);
                    setInquirySent(false);
                    router.push(
                      conversationId
                        ? `/huttspotter/chat/${conversationId}`
                        : "/huttspotter/chat",
                    );
                  }}
                  className="h-12 w-full cursor-pointer rounded-full bg-secondary text-sm font-semibold text-white transition-colors hover:bg-[#08744a]"
                >
                  {conversationId ? "Open Chat" : "View in Chat"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
