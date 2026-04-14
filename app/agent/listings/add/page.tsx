"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useListing, ListingFor, PaymentType } from "@/context/ListingContext";
import StepHeader from "@/components/agent/StepHeader";

const propertyTypes = [
  "Self-Contained",
  "Flat / Apartment",
  "Duplex",
  "Bungalow",
  "Shop",
  "Office Space",
  "Land",
  "Room",
];

const listingOptions: { value: ListingFor; label: string }[] = [
  { value: "SALE", label: "Sale" },
  { value: "ROOM_SHARE", label: "Room share" },
  { value: "RENT", label: "Rent" },
];

const paymentOptions: { value: PaymentType; label: string }[] = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
  { value: "ONE_TIME", label: "One-Time" },
];

export default function AddListingStep1() {
  const router = useRouter();
  const { formData, setFormData } = useListing();

  const [propertyName, setPropertyName] = useState(formData.propertyName ?? "");
  const [propertyType, setPropertyType] = useState(formData.propertyType ?? "");
  const [listingFor, setListingFor] = useState<ListingFor>(
    formData.listingFor ?? "SALE",
  );
  const [price, setPrice] = useState(formData.price ?? "");
  const [paymentType, setPaymentType] = useState<PaymentType>(
    formData.paymentType ?? "MONTHLY",
  );
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const isValid =
    propertyName.trim() !== "" && propertyType !== "" && price.trim() !== "";

  const handleContinue = () => {
    if (!isValid) return;
    setFormData({ propertyName, propertyType, listingFor, price, paymentType });
    router.push("/agent/listings/add/details");
  };

  return (
    <div className="min-h-screen bg-white px-6 pt-12 pb-10 flex flex-col">
      <StepHeader title="Upload New Listing" currentStep={1} totalSteps={4} />

      <div className="flex flex-col gap-6 flex-1">
        {/* Property Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1a1a1a]">
            Add Property Name
          </label>
          <input
            type="text"
            value={propertyName}
            onChange={(e) => setPropertyName(e.target.value)}
            placeholder="e.g. 1 Bedroom Self-Con at GRA"
            className="w-full border border-gray-300 rounded-full px-5 py-4 text-sm outline-none placeholder:text-gray-300"
          />
        </div>

        {/* Property Type */}
        <div className="flex flex-col gap-1.5 relative">
          <label className="text-sm font-medium text-[#1a1a1a]">
            Property Type
          </label>
          <button
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className="w-full border border-gray-300 rounded-full px-5 py-4 text-sm outline-none flex items-center justify-between cursor-pointer"
          >
            <span className={propertyType ? "text-[#1a1a1a]" : "text-gray-300"}>
              {propertyType || "Select type"}
            </span>
            <ChevronDown size={18} className="text-gray-400" />
          </button>

          {showTypeDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
              {propertyTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setPropertyType(type);
                    setShowTypeDropdown(false);
                  }}
                  className="w-full text-left px-5 py-3 text-sm hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Listing For */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#1a1a1a]">
            Listing For
          </label>
          <div className="flex items-center gap-3">
            {listingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setListingFor(option.value)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 ${
                  listingFor === option.value
                    ? "bg-secondary text-white"
                    : "bg-white text-gray-500 border border-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1a1a1a]">Pricing</label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
              ₦
            </span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              className="w-full border border-gray-300 rounded-full pl-9 pr-5 py-4 text-sm outline-none placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Payment Type */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#1a1a1a]">
            Payment Type
          </label>
          <div className="flex items-center gap-3">
            {paymentOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setPaymentType(option.value)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 ${
                  paymentType === option.value
                    ? "bg-secondary text-white"
                    : "bg-white text-gray-500 border border-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
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
