"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type ListingFor = "SALE" | "ROOM_SHARE" | "RENT";
export type PaymentType = "MONTHLY" | "YEARLY" | "ONE_TIME";

export interface ListingFormData {
  // Step 1
  propertyName: string;
  propertyType: string;
  listingFor: ListingFor;
  price: string;
  paymentType: PaymentType;
  // Step 2
  bedrooms: string;
  bathrooms: string;
  amenities: string[];
  additionalNotes: string;
  // Step 3
  city: string;
  area: string;
  // Step 4
  photos: File[];
  coverPhotoIndex: number;
  video?: File;
}

interface ListingContextType {
  formData: Partial<ListingFormData>;
  setFormData: (data: Partial<ListingFormData>) => void;
  reset: () => void;
}

const ListingContext = createContext<ListingContextType | null>(null);

export function ListingProvider({ children }: { children: ReactNode }) {
  const [formData, setFormDataState] = useState<Partial<ListingFormData>>({
    listingFor: "SALE",
    paymentType: "MONTHLY",
    amenities: [],
    coverPhotoIndex: 0,
    photos: [],
  });

  const setFormData = (data: Partial<ListingFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));
  };

  const reset = () =>
    setFormDataState({
      listingFor: "SALE",
      paymentType: "MONTHLY",
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
