"use client";

import { MapPin } from "lucide-react";
import { Field, NIGERIAN_STATES, TextInput } from "./fields";

/** State / city / street + map preview (shared by add and edit) */
export default function LocationFields({
  state,
  city,
  street,
  setState,
  setCity,
  setStreet,
}: {
  state: string;
  city: string;
  street: string;
  setState: (v: string) => void;
  setCity: (v: string) => void;
  setStreet: (v: string) => void;
}) {
  const query = [street, city, state].map((v) => v.trim()).filter(Boolean);
  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-7 sm:grid-cols-2 sm:gap-5">
        <Field label="State" htmlFor="state">
          <TextInput
            id="state"
            list="ng-states"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g. Rivers"
            autoComplete="off"
          />
          <datalist id="ng-states">
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
        <Field label="City or area" htmlFor="city">
          <TextInput
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Port Harcourt"
          />
        </Field>
      </div>

      <Field
        label="Street address"
        optional
        hint="Shown on the map so people can find it. Leave out the house number if you prefer."
        htmlFor="street"
      >
        <TextInput
          id="street"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="e.g. Ada George Road"
        />
      </Field>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-[#f7f7f5]">
        {city.trim() || state.trim() ? (
          <iframe
            title="Map preview"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
              `${query.join(", ")} Nigeria`,
            )}&output=embed&z=14`}
            className="block h-64 w-full sm:h-72"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-gray-400">
            <MapPin size={24} />
            <p className="text-sm font-semibold">Enter a city to see it on the map</p>
          </div>
        )}
      </div>
    </>
  );
}
