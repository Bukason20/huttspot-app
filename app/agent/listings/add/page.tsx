"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useListing } from "@/context/ListingContext";
import { createListingStep1, updateListingStep1 } from "@/lib/agent";
import { PropertyPurpose, PaymentType } from "@/lib/types";
import ListingWizard, {
  ADD_STEPS,
  ADD_ROUTES,
} from "@/components/agent/listing/ListingWizard";
import {
  Field,
  FormError,
  LISTING_OPTIONS,
  LISTING_TYPE_OPTIONS,
  PAYMENT_OPTIONS,
  PriceInput,
  ChoiceCards,
  Segmented,
  TextInput,
  TypePicker,
} from "@/components/agent/listing/fields";

export default function AddListingStep1() {
  const router = useRouter();
  const { formData, setFormData } = useListing();

  const [propertyName, setPropertyName] = useState(formData.propertyName ?? "");
  const [propertyType, setPropertyType] = useState(formData.propertyType ?? "");
  const [listingFor, setListingFor] = useState<PropertyPurpose>(
    formData.listingFor ?? "For Rent",
  );
  const [listingType, setListingType] = useState<"full" | "shared">(
    formData.listingType ?? "full",
  );
  const [price, setPrice] = useState(formData.price ?? "");
  const [paymentType, setPaymentType] = useState<PaymentType>(
    formData.paymentType ?? "Monthly",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isResume = !!formData.propertyId; // ← true when resuming a draft
  const isValid =
    propertyName.trim() !== "" &&
    propertyType !== "" &&
    price.trim() !== "" &&
    parseFloat(price) > 0;

  const handleContinue = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError("");

    const data = {
      title: propertyName.trim(),
      type: propertyType,
      purpose: listingFor,
      listingType,
      price: parseFloat(price),
      paymentType,
    };

    try {
      if (isResume) {
        // Resuming — update existing draft, don't create new
        await updateListingStep1(formData.propertyId!, { step: 1, data });
        setFormData({
          propertyName,
          propertyType,
          listingFor,
          listingType,
          price,
          paymentType,
        });
      } else {
        // Brand new listing
        const res = await createListingStep1({ step: 1, data });
        setFormData({
          propertyName,
          propertyType,
          listingFor,
          listingType,
          price,
          paymentType,
          propertyId: res.propertyId, // ← save new ID
        });
      }

      // Same order as the backend's steps: 1 basics → 2 location → 3 details → 4 media
      router.push(ADD_ROUTES.location);
    } catch (err: any) {
      setError(err.message || "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const priceSuffix =
    paymentType === "Monthly"
      ? "per month"
      : paymentType === "Yearly"
        ? "per year"
        : "one-time";

  return (
    <ListingWizard
      mode="add"
      steps={ADD_STEPS}
      stepIndex={0}
      routeFor={(k) => ADD_ROUTES[k]}
      reachable={isResume ? 3 : 0}
      title={isResume ? "Continue your listing" : "Tell us about the property"}
      description="Start with the basics. You can change any of this later."
      primary={{
        label: "Continue",
        onClick: handleContinue,
        disabled: !isValid,
        loading,
      }}
      preview={{
        title: propertyName,
        type: propertyType,
        purpose: listingFor,
        price,
        paymentType,
      }}
    >
      <Field label="Listing title" hint="Short and specific works best." htmlFor="title">
        <TextInput
          id="title"
          value={propertyName}
          onChange={(e) => setPropertyName(e.target.value)}
          placeholder="e.g. 1 bedroom self-con at GRA Phase 2"
          maxLength={80}
        />
      </Field>

      <Field label="Property type">
        <TypePicker value={propertyType} onChange={setPropertyType} />
      </Field>

      <Field label="Listing for" hint="What huttspotters can do with this property.">
        <ChoiceCards
          options={LISTING_OPTIONS}
          value={listingFor}
          onChange={(v) => setListingFor(v as PropertyPurpose)}
          columns={3}
        />
      </Field>

      <Field label="Listing type" hint="Whether one person takes the whole place or it is split.">
        <ChoiceCards
          options={LISTING_TYPE_OPTIONS}
          value={listingType}
          onChange={setListingType}
        />
      </Field>

      <Field label="Payment">
        <Segmented
          options={PAYMENT_OPTIONS}
          value={paymentType}
          onChange={(v) => setPaymentType(v as PaymentType)}
        />
      </Field>

      <Field label="Price">
        <PriceInput value={price} onChange={setPrice} suffix={priceSuffix} />
      </Field>

      <FormError message={error} />
    </ListingWizard>
  );
}
