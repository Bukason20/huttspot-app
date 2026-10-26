"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton, OnboardingNav, SelectOption } from "@/components/ui";
import { useOnboarding } from "@/context/OnboardingContext";
import { Search, Building, type LucideIcon } from "lucide-react";
import { AccountMode } from "@/lib/types";

const options: {
  value: AccountMode;
  label: string;
  description?: string;
  icon: LucideIcon;
}[] = [
  { value: "HUTTSPOTTER", label: "Huttspoter", description: "I'm looking for a home, shop or roommate", icon: Search },
  { value: "AGENT", label: "Agent", description: "I list properties and connect with clients", icon: Building },
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
    <div className="flex flex-1 flex-col">
      <BackButton />
      <h1 className="font-poppins text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">
        Account Mode
      </h1>
      <p className="mt-2 mb-8 text-gray-500">How will you be using HuttSpot?</p>
      <div role="radiogroup" className="flex flex-col gap-3">
        {options.map((option) => (
          <SelectOption
            key={option.value}
            label={option.label}
            description={option.description}
            icon={option.icon}
            selected={selected === option.value}
            onSelect={() => setSelected(option.value)}
          />
        ))}
      </div>
      <OnboardingNav onNext={handleNext} />
    </div>
  );
}
