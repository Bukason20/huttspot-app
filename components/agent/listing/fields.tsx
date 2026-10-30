"use client";

import { useState } from "react";
import {
  BedDouble,
  Briefcase,
  Building,
  Building2,
  Check,
  DoorOpen,
  Home,
  Minus,
  Plus,
  Store,
  Trees,
  X,
} from "lucide-react";

// ── Options shared by the add and edit flows ───────────────────

export const PROPERTY_TYPES = [
  { value: "Self-Contained", icon: DoorOpen },
  { value: "Flat / Apartment", icon: Building2 },
  { value: "Duplex", icon: Building },
  { value: "Bungalow", icon: Home },
  { value: "Room", icon: BedDouble },
  { value: "Shop", icon: Store },
  { value: "Office Space", icon: Briefcase },
  { value: "Land", icon: Trees },
];

export const LISTING_OPTIONS = [
  { value: "For Rent", label: "Rent" },
  { value: "For Sale", label: "Sale" },
  { value: "Room Share", label: "Room share" },
] as const;

export const PAYMENT_OPTIONS = [
  { value: "Monthly", label: "Monthly" },
  { value: "Yearly", label: "Yearly" },
  { value: "One-time", label: "One-time" },
] as const;

export const LISTING_TYPE_OPTIONS = [
  { value: "full", label: "Whole property" },
  { value: "shared", label: "Shared" },
] as const;

export const AMENITIES = [
  "Furnished",
  "Security",
  "Electricity",
  "Prepaid meter",
  "Running Water",
  "Borehole",
  "Gated House",
  "Gated Estate",
  "Parking",
  "Tiled floors",
  "POP ceiling",
  "Wardrobe",
  "Kitchen cabinets",
  "Air conditioning",
  "Generator",
  "Balcony",
];

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

// ── Building blocks ────────────────────────────────────────────

export function Field({
  label,
  hint,
  optional,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-bold text-[#1a1a1a]">
        {label}
        {optional && (
          <span className="ml-1.5 font-semibold text-gray-400">Optional</span>
        )}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export const inputClass =
  "h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-[15px] text-[#1a1a1a] outline-none transition-colors placeholder:text-gray-400 focus:border-secondary focus:ring-4 focus:ring-secondary/10";

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

/** Pill options, one selected */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`h-10 cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors ${
              on
                ? "border-secondary bg-secondary text-white"
                : "border-gray-200 bg-white text-tertiary hover:border-gray-300"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Property type tiles */
export function TypePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  // Keep a type that isn't in the list (older listings) selectable
  const options =
    value && !PROPERTY_TYPES.some((t) => t.value === value)
      ? [...PROPERTY_TYPES, { value, icon: Home }]
      : PROPERTY_TYPES;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup">
      {options.map(({ value: v, icon: Icon }) => {
        const on = v === value;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(v)}
            className={`relative flex cursor-pointer flex-col items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
              on
                ? "border-secondary bg-secondary/5"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                on ? "bg-secondary text-white" : "bg-[#f7f7f5] text-[#1a1a1a]"
              }`}
            >
              <Icon size={18} />
            </span>
            <span className="text-sm font-bold leading-tight">{v}</span>
            {on && (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-secondary">
                <Check size={12} strokeWidth={3} className="text-white" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** ₦ amount with thousands separators; value/onChange use plain digits */
export function PriceInput({
  value,
  onChange,
  suffix,
}: {
  value: string;
  onChange: (digits: string) => void;
  suffix?: string;
}) {
  const digits = value.replace(/[^\d]/g, "");
  const shown = digits ? Number(digits).toLocaleString("en-NG") : "";
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-poppins text-lg font-semibold text-gray-400">
        ₦
      </span>
      <input
        inputMode="numeric"
        value={shown}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, "").slice(0, 13))}
        placeholder="0"
        className={`${inputClass} h-14 pl-10 font-poppins text-xl font-semibold ${suffix ? "pr-28" : ""}`}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
          {suffix}
        </span>
      )}
    </div>
  );
}

/** − n + counter; value is a numeric string like the form state */
export function Counter({
  label,
  icon: Icon,
  value,
  onChange,
  min = 0,
  max = 50,
}: {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
}) {
  const n = Number.isFinite(parseInt(value)) ? parseInt(value) : min;
  const set = (v: number) => onChange(String(Math.min(max, Math.max(min, v))));
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3 pl-4">
      <span className="flex items-center gap-2.5 text-sm font-bold">
        {Icon && <Icon size={17} className="text-secondary" />}
        {label}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => set(n - 1)}
          disabled={n <= min}
          aria-label={`Fewer ${label.toLowerCase()}`}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-[#1a1a1a] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus size={15} />
        </button>
        <span className="w-9 text-center font-poppins text-lg font-semibold tabular-nums">
          {n}
        </span>
        <button
          type="button"
          onClick={() => set(n + 1)}
          disabled={n >= max}
          aria-label={`More ${label.toLowerCase()}`}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-[#1a1a1a] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

/** Toggle chips + "add your own" */
export function AmenityPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [custom, setCustom] = useState("");
  const all = [...AMENITIES, ...value.filter((a) => !AMENITIES.includes(a))];
  const toggle = (a: string) =>
    onChange(value.includes(a) ? value.filter((x) => x !== a) : [...value, a]);
  const addCustom = () => {
    const a = custom.trim();
    if (!a) return;
    if (!value.some((x) => x.toLowerCase() === a.toLowerCase())) onChange([...value, a]);
    setCustom("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {all.map((a) => {
          const on = value.includes(a);
          const isCustom = !AMENITIES.includes(a);
          return (
            <button
              key={a}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(a)}
              className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors ${
                on
                  ? "border-secondary bg-secondary/10 text-secondary"
                  : "border-gray-200 bg-white text-tertiary hover:border-gray-300"
              }`}
            >
              {on && (isCustom ? <X size={13} /> : <Check size={13} strokeWidth={3} />)}
              {a}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Add another amenity"
          className={`${inputClass} h-11 flex-1`}
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!custom.trim()}
          className="h-11 cursor-pointer rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
      {message}
    </p>
  );
}

/** A titled block inside a step */
export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h3 className="font-poppins text-base font-semibold">{title}</h3>
        {description && (
          <p className="mt-0.5 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
