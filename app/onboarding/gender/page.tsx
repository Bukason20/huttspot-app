"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton, OnboardingNav, SelectOption } from "@/components/ui";
import { useOnboarding } from "@/context/OnboardingContext";
import { Mars, Venus, type LucideIcon } from "lucide-react";
import { Gender } from "@/lib/types";

const options: {
  value: Gender;
  label: string;
  description?: string;
  icon: LucideIcon;
}[] = [
  { value: "male", label: "Male", icon: Mars },
  { value: "female", label: "Female", icon: Venus },
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
    <div className="flex flex-1 flex-col">
      <BackButton />
      <h1 className="font-poppins text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">
        Your Gender
      </h1>
      <p className="mt-2 mb-8 text-gray-500">This helps us personalise your experience.</p>
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
        onBack={() => router.push(backRoute)}
      />
    </div>
  );
}
