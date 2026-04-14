"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton, OnboardingNav, SelectOption } from "@/components/ui";
import { useOnboarding } from "@/context/OnboardingContext";
import { HowFoundUs } from "@/lib/types";

const options: { value: HowFoundUs; label: string }[] = [
  { value: "Instagram", label: "Instagram" },
  { value: "Twitter", label: "X (Twitter)" },
  { value: "Facebook", label: "Facebook" },
  { value: "Referral", label: "Referral" },
];

export default function HowFoundPage() {
  const router = useRouter();
  const { setFormData, formData } = useOnboarding();
  const [selected, setSelected] = useState<HowFoundUs>(
    formData.howYouFoundUs ?? "Instagram",
  );

  const handleNext = () => {
    setFormData({ howYouFoundUs: selected });
    // Both roles now go to verify-identity
    router.push("/onboarding/verify-identity");
  };

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-white px-6 pt-12 flex flex-col">
      <BackButton />
      <h1 className="text-2xl font-bold text-center mb-16">
        How Did You Find Us?
      </h1>
      <div className="flex flex-col gap-4">
        {options.map((option) => (
          <SelectOption
            key={option.value}
            label={option.label}
            selected={selected === option.value}
            onSelect={() => setSelected(option.value)}
          />
        ))}
      </div>
      <OnboardingNav
        onNext={handleNext}
        onBack={() => router.push("/onboarding/phone")}
      />
    </div>
  );
}
