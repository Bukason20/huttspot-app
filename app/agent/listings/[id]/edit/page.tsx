"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader } from "lucide-react";
import { getPropertyById } from "@/lib/agent";
import { useListing } from "@/context/ListingContext";

export default function EditListingEntry() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { setFormData } = useListing();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getPropertyById(propertyId);
        const p = res.property;

        // Pre-fill context with ALL existing data
        setFormData({
          propertyId: p._id, // ← critical
          propertyName: p.title ?? "",
          propertyType: p.type ?? "",
          listingFor: (p.purpose as any) ?? "For Rent",
          price: p.price?.toString() ?? "",
          paymentType: (p.paymentType as any) ?? "Monthly",
          state: p.location?.state ?? "",
          city: p.location?.city ?? "",
          street: p.location?.street ?? "",
          bedrooms: p.details?.bedrooms?.toString() ?? "",
          bathrooms: p.details?.bathrooms?.toString() ?? "",
          toilets: p.details?.toilets?.toString() ?? "",
          parkingSpaces: p.details?.parkingSpaces?.toString() ?? "",
          amenities: p.details?.features ?? [],
        });

        // Go straight to step 1 of edit flow
        router.replace(`/agent/listings/${propertyId}/edit/basic-info`);
      } catch (err) {
        console.error("Failed to load property for edit:", err);
        router.push("/agent/listings");
      }
    };

    load();
  }, [propertyId]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader size={32} className="text-secondary animate-spin" />
    </div>
  );
}
