"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton, OnboardingNav } from "@/components/ui";
import { useOnboarding } from "@/context/OnboardingContext";
import { ChevronDown, Search } from "lucide-react";

interface ParsedCountry {
  name: string;
  code: string;
  flag: string;
  cca2: string;
}

const DEFAULT_COUNTRY: ParsedCountry = {
  name: "Nigeria",
  code: "+234",
  flag: "https://flagcdn.com/ng.svg",
  cca2: "NG",
};

export default function PhonePage() {
  const router = useRouter();
  const { setFormData, formData } = useOnboarding();

  const [countries, setCountries] = useState<ParsedCountry[]>([]);
  const [selected, setSelected] = useState<ParsedCountry>(DEFAULT_COUNTRY);
  const [phoneNumber, setPhoneNumber] = useState(formData.phoneNumber ?? "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const canProceed = phoneNumber.trim().length >= 7;

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,idd,flags,cca2")
      .then((r) => r.json())
      .then((data: any[]) => {
        const parsed: ParsedCountry[] = data
          .filter((c) => c.idd?.root && c.idd?.suffixes?.length)
          .map((c) => ({
            name: c.name.common,
            code: `${c.idd.root}${c.idd.suffixes?.[0] ?? ""}`,
            flag: c.flags.svg || c.flags.png,
            cca2: c.cca2,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(parsed);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleNext = () => {
    if (!canProceed) return;
    setFormData({
      phoneNumber: phoneNumber.trim(),
      countryCode: selected.code,
    });
    router.push("/onboarding/how-found");
  };

  return (
    <div className="flex flex-1 flex-col">
      <BackButton />
      <h1 className="font-poppins text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">
        Phone Number
      </h1>
      <p className="mt-2 mb-8 text-gray-500">
        We&apos;ll use this to keep your account secure.
      </p>

      <label htmlFor="phone" className="mb-2 text-sm font-semibold">
        Mobile number
      </label>

      {/* Input row */}
      <div className="relative">
      <div className="flex gap-2">
        {/* Country selector */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          aria-expanded={showDropdown}
          className={`flex h-12 flex-shrink-0 cursor-pointer items-center gap-2 rounded-xl border bg-white px-3.5 text-[15px] font-semibold transition-colors hover:border-gray-300 ${
            showDropdown ? "border-secondary ring-4 ring-secondary/10" : "border-gray-200"
          }`}
        >
          <img
            src={selected.flag}
            alt={selected.name}
            className="w-5 h-4 object-cover rounded-sm"
          />
          <span>{selected.code}</span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`}
          />
        </button>

        {/* Number */}
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          placeholder="8012345678"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
          className="h-12 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-[15px] tracking-wide outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-secondary focus:ring-4 focus:ring-secondary/10"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.10)]">
          <div className="border-b border-gray-100 p-3">
            <div className="flex h-10 items-center gap-2 rounded-xl bg-[#f7f7f5] px-3">
              <Search size={16} className="flex-shrink-0 text-gray-400" />
              <input
                type="text"
                placeholder="Search country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {loading ? (
              <p className="text-center text-sm text-gray-400 py-4">
                Loading countries...
              </p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.cca2}
                  onClick={() => {
                    setSelected(c);
                    setShowDropdown(false);
                    setSearch("");
                  }}
                  className={`flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#f7f7f5] ${
                    c.cca2 === selected.cca2 ? "bg-secondary/5 font-semibold" : ""
                  }`}
                >
                  <img
                    src={c.flag}
                    alt={c.name}
                    className="w-6 h-4 object-cover rounded-sm flex-shrink-0"
                  />
                  <span className="flex-1">{c.name}</span>
                  <span className="text-gray-400">{c.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
      </div>

      <OnboardingNav
        onNext={handleNext}
        onBack={() => router.push("/onboarding/gender")}
        disabled={!canProceed}
      />
    </div>
  );
}
