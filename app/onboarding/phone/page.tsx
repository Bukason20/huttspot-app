"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton, OnboardingNav } from "@/components/ui";
import { useOnboarding } from "@/context/OnboardingContext";

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
    <div className="max-w-[390px] mx-auto min-h-screen bg-white px-6 pt-12 flex flex-col">
      <BackButton />
      <h1 className="text-2xl font-bold text-center mb-2">Phone Number</h1>
      <p className="text-center text-gray-400 text-sm mb-10">
        We'll use this to keep your account secure.
      </p>

      {/* Input row */}
      <div className="flex gap-2">
        {/* Country selector */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 bg-gray-200 rounded-full px-4 py-4 text-sm font-semibold cursor-pointer flex-shrink-0"
        >
          <img
            src={selected.flag}
            alt={selected.name}
            className="w-5 h-4 object-cover rounded-sm"
          />
          <span>{selected.code}</span>
          <span className="text-gray-400 text-xs">▼</span>
        </button>

        {/* Number */}
        <input
          type="tel"
          placeholder="8012345678"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
          className="flex-1 bg-gray-200 rounded-full px-5 py-4 text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b">
            <input
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
            />
          </div>
          <div className="overflow-y-auto max-h-52">
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
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-left"
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

      <OnboardingNav
        onNext={handleNext}
        onBack={() => router.push("/onboarding/gender")}
        disabled={!canProceed}
      />
    </div>
  );
}
