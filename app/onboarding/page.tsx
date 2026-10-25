"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/context/OnboardingContext";
import { Loader } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { formData } = useOnboarding();

  useEffect(() => {
    // Resume from wherever they left off based on what's already in context
    if (!formData.accountMode) {
      router.replace("/onboarding/account-mode");
    } else if (formData.accountMode === "HUTTSPOTTER" && !formData.intent) {
      router.replace("/onboarding/looking-for");
    } else if (!formData.gender) {
      router.replace("/onboarding/gender");
    } else if (!formData.phoneNumber) {
      router.replace("/onboarding/phone");
    } else if (!formData.howYouFoundUs) {
      router.replace("/onboarding/how-found");
    } else if (!formData.capturedFaceImage) {
      router.replace("/onboarding/verify-identity");
    } else {
      router.replace("/onboarding/terms");
    }
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-500">
      <Loader size={28} className="animate-spin text-secondary" />
      <p className="text-sm font-semibold">Getting things ready…</p>
    </div>
  );
}
