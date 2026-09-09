"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useListing } from "@/context/ListingContext";
import { updateListingStep3 } from "@/lib/agent";
import StepHeader from "@/components/agent/StepHeader";

const amenitiesList = [
  "Furnished",
  "Security",
  "Electricity",
  "Running Water",
  "Gated House",
  "Gated Estate",
];

export default function EditDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { formData, setFormData } = useListing();

  const [bedrooms, setBedrooms] = useState(formData.bedrooms ?? "");
  const [bathrooms, setBathrooms] = useState(formData.bathrooms ?? "");
  const [toilets, setToilets] = useState(formData.toilets ?? "1");
  const [parkingSpaces, setParkingSpaces] = useState(
    formData.parkingSpaces ?? "0",
  );
  const [amenities, setAmenities] = useState<string[]>(
    formData.amenities ?? [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isValid = bedrooms.trim() !== "" && bathrooms.trim() !== "";

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  const handleSave = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError("");

    try {
      await updateListingStep3(propertyId, {
        step: 3,
        data: {
          bedrooms: parseInt(bedrooms),
          bathrooms: parseInt(bathrooms),
          toilets: parseInt(toilets) || 1,
          parkingSpaces: parseInt(parkingSpaces) || 0,
          features: amenities,
        },
      });

      setFormData({ bedrooms, bathrooms, toilets, parkingSpaces, amenities });
      setSuccess(true);
      setTimeout(() => router.push("/agent/listings"), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 pt-12 pb-10 flex flex-col">
      <StepHeader
        title="Edit Listing"
        subtitle="Property Details"
        currentStep={3}
        totalSteps={3}
      />

      <div className="flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Bedrooms
            </label>
            <input
              type="number"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full border border-gray-300 rounded-full px-5 py-4 text-sm outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Bathrooms
            </label>
            <input
              type="number"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className="w-full border border-gray-300 rounded-full px-5 py-4 text-sm outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Toilets
            </label>
            <input
              type="number"
              value={toilets}
              onChange={(e) => setToilets(e.target.value)}
              className="w-full border border-gray-300 rounded-full px-5 py-4 text-sm outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Parking
            </label>
            <input
              type="number"
              value={parkingSpaces}
              onChange={(e) => setParkingSpaces(e.target.value)}
              className="w-full border border-gray-300 rounded-full px-5 py-4 text-sm outline-none"
            />
          </div>
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
                className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-all ${
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

        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        {success && (
          <p className="text-secondary text-xs text-center font-medium">
            Saved! Redirecting...
          </p>
        )}
      </div>

      {/* Back + Save — last step */}
      <div className="flex items-center gap-3 mt-8">
        <button
          onClick={() =>
            router.push(`/agent/listings/${propertyId}/edit/location`)
          }
          className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer flex-shrink-0"
        >
          <ChevronLeft size={22} className="text-gray-500" />
        </button>
        <button
          onClick={handleSave}
          disabled={!isValid || loading}
          className={`flex-1 rounded-full py-4 text-[15px] font-semibold transition-all ${
            isValid && !loading
              ? "bg-secondary text-white cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
