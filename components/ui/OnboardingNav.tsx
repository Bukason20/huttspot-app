"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface OnboardingNavProps {
  onNext: () => void;
  onBack?: () => void;
  disabled?: boolean;
}

export default function OnboardingNav({
  onNext,
  onBack,
  disabled = false,
}: OnboardingNavProps) {
  const router = useRouter();

  return (
    // Pinned to the bottom on mobile; sits under the form on desktop
    <div className="mt-auto flex items-center gap-3 pb-8 pt-8 md:mt-10 md:pb-0">
      {/* Back */}
      <button
        onClick={onBack ?? (() => router.back())}
        aria-label="Back"
        className="flex h-14 w-14 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-[#1a1a1a] transition-colors hover:bg-gray-50"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Next */}
      <button
        onClick={onNext}
        disabled={disabled}
        className={`group flex h-14 flex-1 items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-colors ${
          disabled
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : "cursor-pointer bg-secondary text-white hover:bg-[#08744a]"
        }`}
      >
        Continue
        <ArrowRight
          size={18}
          className={disabled ? "" : "transition-transform group-hover:translate-x-0.5"}
        />
      </button>
    </div>
  );
}
