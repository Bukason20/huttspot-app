"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useListing } from "@/context/ListingContext";
import { updateListingStep3 } from "@/lib/agent";
import ListingWizard, {
  EDIT_STEPS,
  editRoute,
} from "@/components/agent/listing/ListingWizard";
import DetailsFields from "@/components/agent/listing/DetailsFields";
import { FormError } from "@/components/agent/listing/fields";

export default function EditDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { formData, setFormData } = useListing();

  const [bedrooms, setBedrooms] = useState(formData.bedrooms || "0");
  const [bathrooms, setBathrooms] = useState(formData.bathrooms || "0");
  const [toilets, setToilets] = useState(formData.toilets || "1");
  const [parkingSpaces, setParkingSpaces] = useState(formData.parkingSpaces || "0");
  const [amenities, setAmenities] = useState<string[]>(formData.amenities ?? []);
  const [notes, setNotes] = useState(formData.additionalNotes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = bedrooms.trim() !== "" && bathrooms.trim() !== "";

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
          additionalNotes: notes.trim() || undefined,
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
      router.push(editRoute(propertyId, "media"));
    } catch (err: any) {
      setError(err.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ListingWizard
      mode="edit"
      steps={EDIT_STEPS}
      stepIndex={2}
      routeFor={(k) => editRoute(propertyId, k)}
      title="Rooms and amenities"
      description="Keep these accurate so the right people reach out."
      onBack={() => router.push(editRoute(propertyId, "location"))}
      primary={{
        label: "Save & continue",
        onClick: handleSave,
        disabled: !isValid,
        loading,
      }}
      preview={{ bedrooms, bathrooms, toilets, parkingSpaces, amenities }}
    >
      <DetailsFields
        bedrooms={bedrooms}
        bathrooms={bathrooms}
        toilets={toilets}
        parkingSpaces={parkingSpaces}
        amenities={amenities}
        notes={notes}
        setBedrooms={setBedrooms}
        setBathrooms={setBathrooms}
        setToilets={setToilets}
        setParkingSpaces={setParkingSpaces}
        setAmenities={setAmenities}
        setNotes={setNotes}
      />
      <FormError message={error} />
    </ListingWizard>
  );
}
