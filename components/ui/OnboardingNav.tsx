"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className="mt-auto pb-12 flex items-center justify-between">
      {/* Back */}
      <button
        onClick={onBack ?? (() => router.back())}
        className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer"
      >
        <ChevronLeft size={24} color="#fff" />
      </button>

      {/* Next with SVG dashed ring */}
      <div className={`relative w-20 h-20 ${disabled ? "opacity-40" : ""}`}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#2d6a4f"
            strokeWidth="5"
            fill="transparent"
            strokeDasharray="28 20"
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <button
          onClick={onNext}
          disabled={disabled}
          className={`w-14 h-14 rounded-full bg-secondary flex items-center justify-center absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <ChevronRight size={22} color="#fff" />
        </button>
      </div>
    </div>
  );
}
