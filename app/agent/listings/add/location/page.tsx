"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useListing } from "@/context/ListingContext";
import { createListingStep2 } from "@/lib/agent";
import StepHeader from "@/components/agent/StepHeader";

export default function AddListingStep3() {
  const router = useRouter();
  const { formData, setFormData } = useListing();

  const [state, setState] = useState(formData.state ?? "");
  const [city, setCity] = useState(formData.city ?? "");
  const [street, setStreet] = useState(formData.street ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = state.trim() !== "" && city.trim() !== "";

  const handleContinue = async () => {
    if (!isValid || loading) return;

    if (!formData.propertyId) {
      setError("Property ID missing. Please go back to step 1.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createListingStep2({
        step: 2,
        propertyId: formData.propertyId,
        data: {
          state: state.trim(),
          city: city.trim(),
          ...(street.trim() && { street: street.trim() }),
        },
      });

      setFormData({ state, city, street });
      router.push("/agent/listings/add/media");
    } catch (err: any) {
      setError(err.message || "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 pt-12 pb-10 flex flex-col">
      <StepHeader
        title="Upload New Listing"
        subtitle="Location details"
        currentStep={3}
        totalSteps={4}
      />

      <div className="flex flex-col gap-6 flex-1">
        {/* State */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1a1a1a]">State</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g. Rivers"
            className="w-full border border-gray-300 rounded-full px-5 py-4 text-sm outline-none placeholder:text-gray-300"
          />
        </div>

        {/* City */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1a1a1a]">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Port Harcourt"
            className="w-full border border-gray-300 rounded-full px-5 py-4 text-sm outline-none placeholder:text-gray-300"
          />
        </div>

        {/* Street (optional) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1a1a1a]">
            Street <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="e.g. 12 GRA Phase 2"
            className="w-full border border-gray-300 rounded-full px-5 py-4 text-sm outline-none placeholder:text-gray-300"
          />
        </div>

        {/* Map preview */}
        <div className="flex-1 min-h-[250px] rounded-2xl overflow-hidden bg-gray-200">
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
              `${street} ${city} ${state} Nigeria`,
            )}&output=embed&z=13`}
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: 250 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
      </div>

      <button
        onClick={handleContinue}
        disabled={!isValid || loading}
        className={`w-full rounded-full py-4 text-[15px] font-semibold mt-8 transition-all duration-200 ${
          isValid && !loading
            ? "bg-secondary text-white cursor-pointer"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}
