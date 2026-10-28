// Property type categories — shared by the landing page and Listings page

export const PROPERTY_CATEGORIES = [
  "Self-Contained",
  "Flat / Apartment",
  "Shop",
  "Duplex",
  "Bungalow",
  "Office Space",
  "Land",
  "Room",
];

// Backend type values that belong to one of the categories above
const TYPE_ALIASES: Record<string, string> = {
  apartment: "Flat / Apartment",
  flat: "Flat / Apartment",
  "self contained": "Self-Contained",
  "self-con": "Self-Contained",
  office: "Office Space",
};

/** Normalise a backend `type` value to a display category. */
export function categoryFor(type?: string): string {
  const raw = (type ?? "").trim();
  if (!raw) return "Other";
  const known = PROPERTY_CATEGORIES.find(
    (c) => c.toLowerCase() === raw.toLowerCase(),
  );
  return known ?? TYPE_ALIASES[raw.toLowerCase()] ?? raw;
}

/** Sort key: known categories in their usual order, others after. */
export function categoryRank(category: string): number {
  const i = PROPERTY_CATEGORIES.indexOf(category);
  return i === -1 ? PROPERTY_CATEGORIES.length : i;
}
