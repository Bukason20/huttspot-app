"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Bookmark,
  CheckCircle,
  Loader,
  X,
  Send,
} from "lucide-react";
import { getPropertyById } from "@/lib/properties";
import { toggleSaveProperty } from "@/lib/userProperties";
import { sendInquiry } from "@/lib/chat";
import { getAllProperties } from "@/lib/properties";
import { Property } from "@/lib/types";

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [listing, setListing] = useState<Property | null>(null);
  const [otherListings, setOtherListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const handleToggleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await toggleSaveProperty(id);
      setSaved(!saved);
    } catch (err) {
      console.error("Failed to toggle save:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendInquiry = async () => {
    if (!inquiryMessage.trim() || sendingInquiry) return;
    setSendingInquiry(true);
    setInquiryError("");
    try {
      const res = await sendInquiry(id, inquiryMessage.trim());
      setInquirySent(true);
      setInquiryMessage("");
      // Store conversationId so we can navigate straight to it
      setConversationId(res.conversation._id);
    } catch (err: any) {
      setInquiryError(err.message || "Failed to send. Try again.");
    } finally {
      setSendingInquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[390px] mx-auto min-h-screen bg-white flex items-center justify-center">
        <Loader size={32} className="text-secondary animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-[390px] mx-auto min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <p className="text-gray-400 text-sm mb-4">Listing not found.</p>
        <button
          onClick={() => router.back()}
          className="bg-secondary text-white rounded-full px-6 py-3 text-sm font-semibold cursor-pointer"
        >
          Go back
        </button>
      </div>
    );
  }

  const photos = listing.media?.photos ?? [];

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-white pb-10">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="fixed top-5 left-5 z-10 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm cursor-pointer"
      >
        <ArrowLeft size={18} />
      </button>

      {/* Main image */}
      <div className="relative h-56 bg-gray-200">
        {photos.length > 0 ? (
          <img
            src={photos[activeImage]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-sm text-gray-400">No photos</span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
          {photos.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                activeImage === i ? "border-secondary" : "border-transparent"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="px-5 pt-3">
        <h1 className="text-xl font-bold text-[#1a1a1a] mb-1">
          {listing.title}
        </h1>
        <p className="text-sm text-gray-500 mb-1">
          {listing.location?.street ? `${listing.location.street}, ` : ""}
          {listing.location?.city}, {listing.location?.state}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Price :{" "}
          <span className="text-[#1a1a1a] font-bold text-base">
            ₦{listing.price.toLocaleString()} / {listing.paymentType}
          </span>
        </p>

        {/* CTA buttons */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setShowInquiryModal(true)}
            className="flex-1 bg-secondary text-white rounded-full py-3 flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer"
          >
            <User size={16} />
            Contact Agent
          </button>
          <button
            onClick={handleToggleSave}
            disabled={saving}
            className="flex-1 rounded-full py-3 flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer border-2 border-secondary text-secondary"
          >
            <Bookmark
              size={16}
              fill={saved ? "#2d6a4f" : "none"}
              color="#2d6a4f"
            />
            {saving ? "..." : saved ? "Saved" : "Save"}
          </button>
        </div>

        {/* Agent info — HIDDEN until inquiry is sent */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-[#1a1a1a]">Agent</p>
            <p className="text-xs text-gray-400">
              Send an inquiry to view agent details
            </p>
          </div>
        </div>

        {/* Property details chips */}
        {listing.details && (
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            {[
              { label: "Beds", value: listing.details.bedrooms },
              { label: "Baths", value: listing.details.bathrooms },
              { label: "Toilets", value: listing.details.toilets },
              { label: "Parking", value: listing.details.parkingSpaces },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-secondary/10 rounded-xl px-4 py-2 flex flex-col items-center"
              >
                <p className="text-base font-bold text-secondary">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Amenities */}
        {listing.details?.features && listing.details.features.length > 0 && (
          <>
            <h2 className="text-base font-bold text-[#1a1a1a] mb-3">
              Amenities
            </h2>
            <div className="flex flex-wrap gap-x-8 gap-y-3 mb-6">
              {listing.details.features.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={12} color="#fff" fill="#fff" />
                  </div>
                  <span className="text-sm text-[#1a1a1a]">{amenity}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Other Listings */}
        {otherListings.length > 0 && (
          <>
            <h2 className="text-base font-bold text-[#1a1a1a] mb-3">
              Other Listings
            </h2>
            <div className="flex flex-col gap-3">
              {otherListings.map((l) => (
                <div
                  key={l._id}
                  onClick={() => router.push(`/huttspotter/listing/${l._id}`)}
                  className="bg-gray-200 rounded-2xl overflow-hidden flex items-center gap-3 p-3 cursor-pointer"
                >
                  {l.media?.photos?.[0] ? (
                    <img
                      src={l.media.photos[0]}
                      alt={l.title}
                      className="w-24 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-20 rounded-xl bg-gray-300 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1a1a1a] leading-snug mb-1 line-clamp-2">
                      {l.title}
                    </p>
                    <p className="text-sm font-bold text-[#1a1a1a] mb-3">
                      ₦{l.price.toLocaleString()} / {l.paymentType}
                    </p>
                    <button className="bg-secondary text-white rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl px-6 pt-6 pb-10">
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

            {!inquirySent ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#1a1a1a]">
                      Contact Agent
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      About: {listing.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInquiryModal(false)}
                    className="cursor-pointer text-gray-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3 mb-4">
                  Your contact details will be shared with the agent only after
                  they respond to your inquiry.
                </p>

                <textarea
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Hi, I'm interested in this property. Is it still available?"
                  rows={4}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-gray-300 resize-none mb-3"
                />

                {inquiryError && (
                  <p className="text-red-500 text-xs mb-3">{inquiryError}</p>
                )}

                <button
                  onClick={handleSendInquiry}
                  disabled={!inquiryMessage.trim() || sendingInquiry}
                  className={`w-full rounded-full py-4 text-[15px] font-semibold flex items-center justify-center gap-2 transition-all ${
                    inquiryMessage.trim() && !sendingInquiry
                      ? "bg-secondary text-white cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Send size={16} />
                  {sendingInquiry ? "Sending..." : "Send Inquiry"}
                </button>
              </>
            ) : (
              // Success state
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-secondary" />
                </div>
                <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">
                  Inquiry Sent!
                </h2>
                <p className="text-sm text-gray-400 mb-6">
                  The agent will respond to your inquiry. You'll be notified
                  when they reply.
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
                  className="w-full bg-secondary text-white rounded-full py-3 text-sm font-semibold cursor-pointer"
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
