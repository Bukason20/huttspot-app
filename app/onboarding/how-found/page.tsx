"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton, OnboardingNav, SelectOption } from "@/components/ui";
import { useOnboarding } from "@/context/OnboardingContext";
import { Camera, AtSign, ThumbsUp, UserPlus, type LucideIcon } from "lucide-react";
import { HowFoundUs } from "@/lib/types";

const options: {
  value: HowFoundUs;
  label: string;
  description?: string;
  icon: LucideIcon;
}[] = [
  { value: "Instagram", label: "Instagram", icon: Camera },
  { value: "Twitter", label: "X (Twitter)", icon: AtSign },
  { value: "Facebook", label: "Facebook", icon: ThumbsUp },
  { value: "Referral", label: "Referral", description: "A friend or someone you know", icon: UserPlus },
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
    <div className="flex flex-1 flex-col">
      <BackButton />
      <h1 className="font-poppins text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">
        How Did You Find Us?
      </h1>
      <p className="mt-2 mb-8 text-gray-500">Just so we know what is working.</p>
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
        onBack={() => router.push("/onboarding/phone")}
      />
    </div>
  );
}
