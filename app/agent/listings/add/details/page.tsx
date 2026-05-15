"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useListing } from "@/context/ListingContext";
import { createListingStep3 } from "@/lib/agent";
import StepHeader from "@/components/agent/StepHeader";

const amenitiesList = [
  "Furnished",
  "Security",
  "Electricity",
  "Running Water",
  "Gated House",
  "Gated Estate",
];

export default function AddListingStep2() {
  const router = useRouter();
  const { formData, setFormData } = useListing();

  const [bedrooms, setBedrooms] = useState(formData.bedrooms ?? "");
  const [bathrooms, setBathrooms] = useState(formData.bathrooms ?? "");
  const [toilets, setToilets] = useState("1");
  const [parkingSpaces, setParkingSpaces] = useState("0");
  const [amenities, setAmenities] = useState<string[]>(
    formData.amenities ?? [],
  );
  const [notes, setNotes] = useState(formData.additionalNotes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  const isValid = bedrooms.trim() !== "" && bathrooms.trim() !== "";

  const handleContinue = async () => {
    console.log("hello");
    if (!isValid || loading) return;

    if (!formData.propertyId) {
      setError("Property ID missing. Please go back to step 1.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createListingStep3({
        step: 3,
        propertyId: formData.propertyId,
        data: {
          bedrooms: parseInt(bedrooms),
          bathrooms: parseInt(bathrooms),
          toilets: parseInt(toilets),
          parkingSpaces: parseInt(parkingSpaces),
          features: amenities,
          additionalNotes: notes || undefined,
        },
      });

      setFormData({
        bedrooms,
        bathrooms,
        toilets,
        parkingSpaces,
        amenities,
        additionalNotes: notes,
      });
      router.push("/agent/listings/add/location");
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
        subtitle="Property Details"
        currentStep={2}
        totalSteps={4}
      />

      <div className="flex flex-col gap-6 flex-1">
        {/* Bedrooms */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1a1a1a]">
            Number of bedrooms
          </label>
          <input
            type="number"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            placeholder="Enter amount"
            className="w-full border border-gray-300 rounded-full px-5 py-4 text-sm outline-none placeholder:text-gray-300"
          />
        </div>

        {/* Bathrooms */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1a1a1a]">
            Number of bathrooms
          </label>
          <input
            type="number"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            placeholder="Enter amount"
            className="w-full border border-gray-300 rounded-full px-5 py-4 text-sm outline-none placeholder:text-gray-300"
          />
        </div>

        {/* Toilets */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1a1a1a]">
            Number of toilets
          </label>
          <input
            type="number"
            value={toilets}
            onChange={(e) => setToilets(e.target.value)}
            placeholder="Enter amount"
            className="w-full border border-gray-300 rounded-full px-5 py-4 text-sm outline-none placeholder:text-gray-300"
          />
        </div>

        {/* Parking spaces */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1a1a1a]">
            Parking spaces
          </label>
          <input
            type="number"
            value={parkingSpaces}
            onChange={(e) => setParkingSpaces(e.target.value)}
            placeholder="Enter amount"
            className="w-full border border-gray-300 rounded-full px-5 py-4 text-sm outline-none placeholder:text-gray-300"
          />
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {amenitiesList.map((amenity) => (
            <button
              key={amenity}
              onClick={() => toggleAmenity(amenity)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  amenities.includes(amenity)
                    ? "bg-secondary border-secondary"
                    : "bg-white border-gray-400"
                }`}
              >
                {amenities.includes(amenity) && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm text-[#1a1a1a]">{amenity}</span>
            </button>
          ))}
        </div>

        {/* Additional Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1a1a1a]">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Describe the property..."
            className="w-full bg-gray-200 rounded-2xl px-5 py-4 text-sm outline-none placeholder:text-gray-400 resize-none"
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
