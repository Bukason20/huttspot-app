"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ListingFormData, PropertyPurpose, PaymentType } from "@/lib/types";

interface ListingContextType {
  formData: Partial<ListingFormData>;
  setFormData: (data: Partial<ListingFormData>) => void;
  reset: () => void;
}

const ListingContext = createContext<ListingContextType | null>(null);

export function ListingProvider({ children }: { children: ReactNode }) {
  const [formData, setFormDataState] = useState<Partial<ListingFormData>>({
    listingFor: "For Rent",
    paymentType: "Monthly",
    amenities: [],
    coverPhotoIndex: 0,
    photos: [],
  });

  const setFormData = (data: Partial<ListingFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));
  };

  const reset = () =>
    setFormDataState({
      listingFor: "For Rent",
      paymentType: "Monthly",
      amenities: [],
      coverPhotoIndex: 0,
      photos: [],
    });

  return (
    <ListingContext.Provider value={{ formData, setFormData, reset }}>
      {children}
    </ListingContext.Provider>
  );
}

export function useListing() {
  const context = useContext(ListingContext);
  if (!context)
    throw new Error("useListing must be used within ListingProvider");
  return context;
}
