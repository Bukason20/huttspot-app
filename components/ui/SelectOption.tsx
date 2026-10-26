"use client";

import type { ComponentType } from "react";

interface SelectOptionProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  /** Optional supporting line under the label */
  description?: string;
  /** Optional lucide icon */
  icon?: ComponentType<{ size?: number; className?: string }>;
}

export default function SelectOption({
  label,
  selected,
  onSelect,
  description,
  icon: Icon,
}: SelectOptionProps) {
  return (
    <button
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all duration-200 sm:px-5 ${
        selected
          ? "border-secondary bg-secondary/5 ring-4 ring-secondary/10"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-[#fafaf8]"
      }`}
    >
      {Icon && (
        <span
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
            selected ? "bg-secondary text-white" : "bg-[#f7f7f5] text-[#1a1a1a]"
          }`}
        >
          <Icon size={19} />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold text-[#1a1a1a]">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-sm leading-snug text-gray-500">
            {description}
          </span>
        )}
      </span>

      {/* Radio indicator */}
      <span
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
          selected ? "border-secondary bg-secondary" : "border-gray-300 bg-white"
        }`}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full bg-white transition-transform duration-200 ${
            selected ? "scale-100" : "scale-0"
          }`}
        />
      </span>
    </button>
  );
}
