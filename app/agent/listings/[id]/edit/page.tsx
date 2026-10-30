"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
          additionalNotes:
            (p.details as any)?.additionalNotes ?? (p as any).additionalNotes ?? "",
          listingType: p.listingType === "shared" ? "shared" : "full",
          existingPhotos: p.media?.photos ?? [],
          existingVideo: p.media?.video,
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-secondary/20 border-t-secondary" />
      <p className="text-sm font-semibold text-gray-500">Loading your listing…</p>
    </div>
  );
}
