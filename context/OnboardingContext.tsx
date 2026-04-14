"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { OnboardingFormData } from "@/lib/types";

const STORAGE_KEY = "huttspot_onboarding";

interface OnboardingContextType {
  formData: Partial<OnboardingFormData>;
  setFormData: (data: Partial<OnboardingFormData>) => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [formData, setFormDataState] = useState<Partial<OnboardingFormData>>(
    () => {
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          return stored ? JSON.parse(stored) : {};
        } catch {
          return {};
        }
      }
      return {};
    },
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Don't persist idToken or capturedFaceImage to localStorage
        const { idToken, capturedFaceImage, ...rest } = formData as any;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
      } catch {
        console.error("Failed to save onboarding data to localStorage");
      }
    }
  }, [formData]);

  const setFormData = (data: Partial<OnboardingFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));
  };

  const reset = () => {
    setFormDataState({});
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <OnboardingContext.Provider value={{ formData, setFormData, reset }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context)
    throw new Error("useOnboarding must be used within OnboardingProvider");
  return context;
}
