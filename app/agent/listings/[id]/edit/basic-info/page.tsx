"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useListing } from "@/context/ListingContext";
import { updateListingStep1 } from "@/lib/agent";
import { PropertyPurpose, PaymentType } from "@/lib/types";
import ListingWizard, {
  EDIT_STEPS,
  editRoute,
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

export default function EditBasicInfoPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { formData, setFormData } = useListing();

  const [propertyName, setPropertyName] = useState(formData.propertyName ?? "");
  const [propertyType, setPropertyType] = useState(formData.propertyType ?? "");
  const [listingFor, setListingFor] = useState<PropertyPurpose>(
    formData.listingFor ?? "For Rent",
  );
  // Keep the listing's own type (was always sent as "full" before)
  const [listingType, setListingType] = useState<"full" | "shared">(
    formData.listingType ?? "full",
  );
  const [price, setPrice] = useState(formData.price ?? "");
  const [paymentType, setPaymentType] = useState<PaymentType>(
    formData.paymentType ?? "Monthly",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid =
    propertyName.trim() !== "" &&
    propertyType !== "" &&
    price.trim() !== "" &&
    parseFloat(price) > 0;

  const handleContinue = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError("");

    try {
      await updateListingStep1(propertyId, {
        step: 1,
        data: {
          title: propertyName.trim(),
          type: propertyType,
          purpose: listingFor,
          listingType,
          price: parseFloat(price),
          paymentType,
        },
      });

      setFormData({
        propertyName,
        propertyType,
        listingFor,
        listingType,
        price,
        paymentType,
      });
      router.push(editRoute(propertyId, "location"));
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
      stepIndex={0}
      routeFor={(k) => editRoute(propertyId, k)}
      title="Basics"
      description="Update the title, type and price."
      primary={{
        label: "Save & continue",
        onClick: handleContinue,
        disabled: !isValid,
        loading,
      }}
      preview={{ title: propertyName, type: propertyType, purpose: listingFor, price, paymentType }}
    >
      <Field label="Listing title" htmlFor="title">
        <TextInput
          id="title"
          value={propertyName}
          onChange={(e) => setPropertyName(e.target.value)}
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
        <PriceInput
          value={price}
          onChange={setPrice}
          suffix={paymentType === "Monthly" ? "per month" : paymentType === "Yearly" ? "per year" : "one-time"}
        />
      </Field>

      <FormError message={error} />
    </ListingWizard>
  );
}
