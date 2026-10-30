"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useListing } from "@/context/ListingContext";
import { createListingStep2 } from "@/lib/agent";
import ListingWizard, {
  ADD_STEPS,
  ADD_ROUTES,
} from "@/components/agent/listing/ListingWizard";
import LocationFields from "@/components/agent/listing/LocationFields";
import { FormError } from "@/components/agent/listing/fields";

export default function AddListingLocation() {
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
      router.push(ADD_ROUTES.details);
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
      stepIndex={1}
      routeFor={(k) => ADD_ROUTES[k]}
      title="Where is it?"
      description="Huttspotters search by area, so be as accurate as you can."
      onBack={() => router.push(ADD_ROUTES.basics)}
      primary={{
        label: "Continue",
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
