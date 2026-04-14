"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton, OnboardingNav, SelectOption } from "@/components/ui";
import { useOnboarding } from "@/context/OnboardingContext";
import { Gender } from "@/lib/types";

const options: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export default function GenderPage() {
  const router = useRouter();
  const { formData, setFormData } = useOnboarding();
  const [selected, setSelected] = useState<Gender>(formData.gender ?? "male");

  // Back destination depends on account mode
  const backRoute =
    formData.accountMode === "HUTTSPOTTER"
      ? "/onboarding/looking-for"
      : "/onboarding/account-mode";

  const handleNext = () => {
    setFormData({ gender: selected });
    router.push("/onboarding/phone");
  };

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-white px-6 pt-12 flex flex-col">
      <BackButton />
      <h1 className="text-2xl font-bold text-center mb-16">Your Gender</h1>
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
        onBack={() => router.push(backRoute)}
      />
    </div>
  );
}
