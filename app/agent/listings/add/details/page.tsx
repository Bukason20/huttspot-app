"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useListing } from "@/context/ListingContext";
import { createListingStep3 } from "@/lib/agent";
import ListingWizard, {
  ADD_STEPS,
  ADD_ROUTES,
} from "@/components/agent/listing/ListingWizard";
import DetailsFields from "@/components/agent/listing/DetailsFields";
import { FormError } from "@/components/agent/listing/fields";

export default function AddListingDetails() {
  const router = useRouter();
  const { formData, setFormData } = useListing();

  const [bedrooms, setBedrooms] = useState(formData.bedrooms || "1");
  const [bathrooms, setBathrooms] = useState(formData.bathrooms || "1");
  const [toilets, setToilets] = useState(formData.toilets || "1");
  const [parkingSpaces, setParkingSpaces] = useState(formData.parkingSpaces || "0");
  const [amenities, setAmenities] = useState<string[]>(formData.amenities ?? []);
  const [notes, setNotes] = useState(formData.additionalNotes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = bedrooms.trim() !== "" && bathrooms.trim() !== "";

  const handleContinue = async () => {
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
      router.push(ADD_ROUTES.media);
    } catch (err: any) {
      setError(err.message || "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ListingWizard
      mode="add"
      steps={ADD_STEPS}
      stepIndex={2}
      routeFor={(k) => ADD_ROUTES[k]}
      title="Rooms and amenities"
      description="These details help huttspotters filter and compare."
      onBack={() => router.push(ADD_ROUTES.location)}
      primary={{
        label: "Continue",
        onClick: handleContinue,
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
