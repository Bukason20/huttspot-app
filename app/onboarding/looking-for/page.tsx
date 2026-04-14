"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton, OnboardingNav, SelectOption } from "@/components/ui";
import { useOnboarding } from "@/context/OnboardingContext";
import { Intent } from "@/lib/types";

const options: { value: Intent; label: string }[] = [
  { value: "RENT", label: "Rent" },
  { value: "BUY", label: "Buy" },
  { value: "ROOMMATE", label: "Roommate" },
];

export default function LookingForPage() {
  const router = useRouter();
  const { formData, setFormData } = useOnboarding();
  const [selected, setSelected] = useState<Intent>(formData.intent ?? "RENT");

  const handleNext = () => {
    setFormData({ intent: selected });
    router.push("/onboarding/gender");
  };

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-white px-6 pt-12 flex flex-col">
      <BackButton />
      <h1 className="text-2xl font-bold text-center mb-16">
        What are you looking for?
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
        onBack={() => router.push("/onboarding/account-mode")}
      />
    </div>
  );
}
