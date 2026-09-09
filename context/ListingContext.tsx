"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ListingFormData, PropertyPurpose, PaymentType } from "@/lib/types";

const STORAGE_KEY = "huttspot_listing";

interface ListingContextType {
  formData: Partial<ListingFormData>;
  setFormData: (data: Partial<ListingFormData>) => void;
  reset: () => void;
}

const ListingContext = createContext<ListingContextType | null>(null);

export function ListingProvider({ children }: { children: ReactNode }) {
  const [formData, setFormDataState] = useState<Partial<ListingFormData>>(
    () => {
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          return stored
            ? JSON.parse(stored)
            : {
                listingFor: "For Rent",
                paymentType: "Monthly",
                amenities: [],
                coverPhotoIndex: 0,
                photos: [],
              };
        } catch {
          return {};
        }
      }
      return {};
    },
  );

  // Sync to localStorage — exclude File objects (not serializable)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const { photos, video, ...rest } = formData as any;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
      } catch {
        console.error("Failed to save listing data");
      }
    }
  }, [formData]);

  const setFormData = (data: Partial<ListingFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));
  };

  const reset = () => {
    setFormDataState({
      listingFor: "For Rent",
      paymentType: "Monthly",
      amenities: [],
      coverPhotoIndex: 0,
      photos: [],
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

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
