"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useListing } from "@/context/ListingContext";
import StepHeader from "@/components/agent/StepHeader";

export default function AddListingStep3() {
  const router = useRouter();
  const { formData, setFormData } = useListing();

  const [city, setCity] = useState(formData.city ?? "");
  const [area, setArea] = useState(formData.area ?? "");

  const isValid = city.trim() !== "" && area.trim() !== "";

  const handleContinue = () => {
    if (!isValid) return;
    setFormData({ city, area });
    router.push("/agent/listings/add/media");
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

        {/* Area */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1a1a1a]">Area</label>
          <input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. GRA Phase 2"
            className="w-full border border-gray-300 rounded-full px-5 py-4 text-sm outline-none placeholder:text-gray-300"
          />
        </div>

        {/* Map placeholder */}
        <div className="flex-1 min-h-[300px] rounded-2xl overflow-hidden bg-gray-200">
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
              `${area} ${city} Nigeria`,
            )}&output=embed&z=13`}
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: 300 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* Continue */}
      <button
        onClick={handleContinue}
        disabled={!isValid}
        className={`w-full rounded-full py-4 text-[15px] font-semibold mt-8 transition-all duration-200 ${
          isValid
            ? "bg-secondary text-white cursor-pointer"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        Continue
      </button>
    </div>
  );
}
