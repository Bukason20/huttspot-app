"use client";

import { BedDouble, Bath, Car, Droplets } from "lucide-react";
import { AmenityPicker, Counter, Field, Section } from "./fields";

/** Rooms, amenities and notes (shared by add and edit) */
export default function DetailsFields({
  bedrooms,
  bathrooms,
  toilets,
  parkingSpaces,
  amenities,
  notes,
  setBedrooms,
  setBathrooms,
  setToilets,
  setParkingSpaces,
  setAmenities,
  setNotes,
}: {
  bedrooms: string;
  bathrooms: string;
  toilets: string;
  parkingSpaces: string;
  amenities: string[];
  notes: string;
  setBedrooms: (v: string) => void;
  setBathrooms: (v: string) => void;
  setToilets: (v: string) => void;
  setParkingSpaces: (v: string) => void;
  setAmenities: (v: string[]) => void;
  setNotes: (v: string) => void;
}) {
  return (
    <>
      <Section title="Rooms" description="Use 0 if there are none.">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <Counter label="Bedrooms" icon={BedDouble} value={bedrooms} onChange={setBedrooms} />
          <Counter label="Bathrooms" icon={Bath} value={bathrooms} onChange={setBathrooms} />
          <Counter label="Toilets" icon={Droplets} value={toilets} onChange={setToilets} />
          <Counter label="Parking spaces" icon={Car} value={parkingSpaces} onChange={setParkingSpaces} />
        </div>
      </Section>

      <Section title="Amenities" description="Pick everything the property has.">
        <AmenityPicker value={amenities} onChange={setAmenities} />
      </Section>

      <Field
        label="Description"
        optional
        hint={`${notes.length}/1000 · Mention what makes it stand out: light, water, road, neighbours.`}
        htmlFor="notes"
      >
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 1000))}
          rows={5}
          placeholder="Describe the property…"
          className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] leading-relaxed outline-none transition-colors placeholder:text-gray-400 focus:border-secondary focus:ring-4 focus:ring-secondary/10"
        />
      </Field>
    </>
  );
}
