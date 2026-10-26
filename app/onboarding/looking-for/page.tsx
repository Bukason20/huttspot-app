"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton, OnboardingNav, SelectOption } from "@/components/ui";
import { useOnboarding } from "@/context/OnboardingContext";
import { KeyRound, House, UsersRound, type LucideIcon } from "lucide-react";
import { Intent } from "@/lib/types";

const options: {
  value: Intent;
  label: string;
  description?: string;
  icon: LucideIcon;
}[] = [
  { value: "RENT", label: "Rent", description: "A place to rent monthly or yearly", icon: KeyRound },
  { value: "BUY", label: "Buy", description: "A property to own", icon: House },
  { value: "ROOMMATE", label: "Roommate", description: "Someone to share a space with", icon: UsersRound },
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
    <div className="flex flex-1 flex-col">
      <BackButton />
      <h1 className="font-poppins text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">
        What are you looking for?
      </h1>
      <p className="mt-2 mb-8 text-gray-500">We&apos;ll use this to show you the right listings.</p>
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
      <OnboardingNav
        onNext={handleNext}
        onBack={() => router.push("/onboarding/account-mode")}
      />
    </div>
  );
}
