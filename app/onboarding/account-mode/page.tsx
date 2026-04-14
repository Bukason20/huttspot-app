"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton, OnboardingNav, SelectOption } from "@/components/ui";
import { useOnboarding } from "@/context/OnboardingContext";
import { AccountMode } from "@/lib/types";

const options: { value: AccountMode; label: string }[] = [
  { value: "HUTTSPOTTER", label: "Huttspoter" },
  { value: "AGENT", label: "Agent" },
];

export default function AccountModePage() {
  const router = useRouter();
  const { setFormData, formData } = useOnboarding();
  const [selected, setSelected] = useState<AccountMode>(
    formData.accountMode ?? "HUTTSPOTTER",
  );

  const handleNext = () => {
    setFormData({ accountMode: selected });
    router.push(
      selected === "HUTTSPOTTER"
        ? "/onboarding/looking-for"
        : "/onboarding/gender",
    );
  };

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-white px-6 pt-12 flex flex-col">
      <BackButton />
      <h1 className="text-2xl font-bold text-center mb-16">Account Mode</h1>
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
      <OnboardingNav onNext={handleNext} />
    </div>
  );
}
