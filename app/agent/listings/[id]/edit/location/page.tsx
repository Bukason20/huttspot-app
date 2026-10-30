"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useListing } from "@/context/ListingContext";
import { updateListingStep2 } from "@/lib/agent";
import ListingWizard, {
  EDIT_STEPS,
  editRoute,
} from "@/components/agent/listing/ListingWizard";
import LocationFields from "@/components/agent/listing/LocationFields";
import { FormError } from "@/components/agent/listing/fields";

export default function EditLocationPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { formData, setFormData } = useListing();

  const [state, setState] = useState(formData.state ?? "");
  const [city, setCity] = useState(formData.city ?? "");
  const [street, setStreet] = useState(formData.street ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = state.trim() !== "" && city.trim() !== "";

  const handleContinue = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError("");

    try {
      await updateListingStep2(propertyId, {
        step: 2,
        data: {
          state: state.trim(),
          city: city.trim(),
          ...(street.trim() && { street: street.trim() }),
        },
      });

      setFormData({ state, city, street });
      router.push(editRoute(propertyId, "details"));
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
      stepIndex={1}
      routeFor={(k) => editRoute(propertyId, k)}
      title="Location"
      description="Where the property is."
      onBack={() => router.push(editRoute(propertyId, "basics"))}
      primary={{
        label: "Save & continue",
        onClick: handleContinue,
        disabled: !isValid,
        loading,
      }}
      preview={{ city, state }}
    >
      <LocationFields
        state={state}
        city={city}
        street={street}
        setState={setState}
        setCity={setCity}
        setStreet={setStreet}
      />
      <FormError message={error} />
    </ListingWizard>
  );
}
