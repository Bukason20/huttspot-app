"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Bath,
  Car,
  Check,
  Droplets,
  ImageIcon,
  MapPin,
  X,
} from "lucide-react";
import { useListing } from "@/context/ListingContext";

export type WizardStep = { key: string; label: string; hint: string };

export const ADD_STEPS: WizardStep[] = [
  { key: "basics", label: "Basics", hint: "Name, type and price" },
  { key: "location", label: "Location", hint: "Where the property is" },
  { key: "details", label: "Details", hint: "Rooms and amenities" },
  { key: "media", label: "Photos", hint: "Photos and video tour" },
];

export const ADD_ROUTES: Record<string, string> = {
  basics: "/agent/listings/add",
  location: "/agent/listings/add/location",
  details: "/agent/listings/add/details",
  media: "/agent/listings/add/media",
};

export const EDIT_STEPS: WizardStep[] = ADD_STEPS;

export const editRoute = (id: string, key: string) =>
  `/agent/listings/${id}/edit/${key === "basics" ? "basic-info" : key}`;

/** What the live preview card shows (falls back to saved form data) */
export type PreviewData = {
  title?: string;
  type?: string;
  purpose?: string;
  price?: string;
  paymentType?: string;
  city?: string;
  state?: string;
  bedrooms?: string;
  bathrooms?: string;
  toilets?: string;
  parkingSpaces?: string;
  amenities?: string[];
  cover?: string | null;
  photoCount?: number;
};

function ListingPreview({ data }: { data: PreviewData }) {
  const price = data.price ? Number(data.price.replace(/[^\d]/g, "")) : 0;
  const place = [data.city, data.state].filter(Boolean).join(", ");
  const facts = [
    { icon: BedDouble, v: data.bedrooms, l: "Beds" },
    { icon: Bath, v: data.bathrooms, l: "Baths" },
    { icon: Droplets, v: data.toilets, l: "Toilets" },
    { icon: Car, v: data.parkingSpaces, l: "Parking" },
  ];
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
      <div className="relative aspect-[4/3] bg-[#f3efe6]">
        {data.cover ? (
          <img src={data.cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
            <ImageIcon size={26} />
            <span className="text-xs font-semibold">Cover photo shows here</span>
          </div>
        )}
        {data.purpose && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#1a1a1a]">
            {data.purpose}
          </span>
        )}
        {!!data.photoCount && data.photoCount > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white">
            {data.photoCount} photos
          </span>
        )}
      </div>
      <div className="p-4">
        {data.type && (
          <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-[11px] font-bold text-secondary">
            {data.type}
          </span>
        )}
        <p
          className={`mt-2.5 font-poppins text-base font-semibold leading-snug ${
            data.title ? "" : "text-gray-400"
          }`}
        >
          {data.title || "Your listing title"}
        </p>
        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
          <MapPin size={13} className="flex-shrink-0" />
          <span className="truncate">{place || "Location"}</span>
        </p>
        <p className="mt-3 font-poppins text-xl font-semibold">
          {price ? `₦${price.toLocaleString("en-NG")}` : "₦ —"}
          {data.paymentType && (
            <span className="font-nunito text-xs font-semibold text-gray-500">
              {" "}
              / {data.paymentType}
            </span>
          )}
        </p>
        <div className="mt-4 grid grid-cols-4 gap-1.5 border-t border-gray-100 pt-4">
          {facts.map(({ icon: Icon, v, l }) => (
            <div key={l} className="flex flex-col items-center text-center">
              <Icon size={15} className="text-secondary" />
              <span className="mt-1 text-sm font-bold">{v || "–"}</span>
              <span className="text-[10px] font-semibold text-gray-500">{l}</span>
            </div>
          ))}
        </div>
        {!!data.amenities?.length && (
          <p className="mt-4 truncate text-xs text-gray-500">
            {data.amenities.slice(0, 3).join(" · ")}
            {data.amenities.length > 3 && ` +${data.amenities.length - 3} more`}
          </p>
        )}
      </div>
    </div>
  );
}

interface Props {
  mode: "add" | "edit";
  steps: WizardStep[];
  stepIndex: number;
  /** Where each step lives (rail links) */
  routeFor: (key: string) => string;
  /** Furthest step the user may jump to from the rail */
  reachable?: number;
  title: string;
  description: string;
  children: React.ReactNode;
  onBack?: () => void;
  primary: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    loadingLabel?: string;
  };
  preview?: PreviewData;
  /** Hide the footer / preview (e.g. success screen) */
  bare?: boolean;
}

export default function ListingWizard({
  mode,
  steps,
  stepIndex,
  routeFor,
  reachable,
  title,
  description,
  children,
  onBack,
  primary,
  preview,
  bare,
}: Props) {
  const router = useRouter();
  const { formData } = useListing();
  const maxReach = reachable ?? (mode === "edit" ? steps.length - 1 : stepIndex);

  const merged: PreviewData = {
    title: formData.propertyName,
    type: formData.propertyType,
    purpose: formData.listingFor,
    price: formData.price,
    paymentType: formData.paymentType,
    city: formData.city,
    state: formData.state,
    bedrooms: formData.bedrooms,
    bathrooms: formData.bathrooms,
    toilets: formData.toilets,
    parkingSpaces: formData.parkingSpaces,
    amenities: formData.amenities,
    cover: formData.existingPhotos?.[0] ?? null,
    photoCount: formData.existingPhotos?.length,
    ...Object.fromEntries(
      Object.entries(preview ?? {}).filter(([, v]) => v !== undefined),
    ),
  };

  const heading = mode === "edit" ? "Edit listing" : "New listing";
  const exit = () => router.push("/agent/listings");
  const savedDraft = mode === "add" && !!formData.propertyId;

  const PrimaryButton = ({ full }: { full?: boolean }) => (
    <button
      type="button"
      onClick={primary.onClick}
      disabled={primary.disabled || primary.loading}
      className={`flex h-12 items-center justify-center gap-2 rounded-full px-7 text-[15px] font-semibold transition-colors ${
        full ? "flex-1" : ""
      } ${
        primary.disabled || primary.loading
          ? "cursor-not-allowed bg-gray-100 text-gray-400"
          : "cursor-pointer bg-secondary text-white hover:bg-[#08744a]"
      }`}
    >
      {primary.loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {primary.loadingLabel ?? "Saving..."}
        </>
      ) : (
        <>
          {primary.label}
          <ArrowRight size={17} />
        </>
      )}
    </button>
  );

  const BackButton = () =>
    onBack ? (
      <button
        type="button"
        onClick={onBack}
        className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 text-[15px] font-semibold transition-colors hover:bg-gray-50"
      >
        <ArrowLeft size={17} />
        <span className="hidden sm:inline">Back</span>
      </button>
    ) : null;

  return (
    <div className="hs-canvas fixed inset-0 z-50 flex flex-col bg-[#f7f7f5] lg:static lg:z-auto lg:block lg:px-5">
      {/* ── Mobile / tablet header ─────────────────────────── */}
      <header className="border-b border-gray-100 bg-white pt-[env(safe-area-inset-top)] lg:hidden">
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={exit}
            aria-label="Close"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="font-poppins text-base font-semibold leading-tight">
              {heading}
            </p>
            <p className="text-xs font-semibold text-gray-500">
              Step {stepIndex + 1} of {steps.length} · {steps[stepIndex].label}
            </p>
          </div>
          {savedDraft && (
            <button
              onClick={exit}
              className="h-9 cursor-pointer rounded-full px-3 text-sm font-semibold text-secondary hover:bg-secondary/10"
            >
              Save & exit
            </button>
          )}
        </div>
        <div className="flex gap-1.5 px-4 pb-3 sm:px-6">
          {steps.map((s, i) => (
            <span
              key={s.key}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? "bg-secondary" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </header>

      {/* ── Desktop title row ──────────────────────────────── */}
      <div className="hidden items-end justify-between gap-4 pb-6 lg:flex">
        <div>
          <button
            onClick={exit}
            className="mb-3 flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-[#1a1a1a]"
          >
            <ArrowLeft size={16} /> My listings
          </button>
          <h1 className="font-poppins text-3xl font-semibold tracking-tight">
            {heading}
          </h1>
        </div>
        {savedDraft && (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
            <Check size={15} className="text-secondary" /> Draft saved
          </p>
        )}
      </div>

      {/* ── Desktop stepper (horizontal, so the form keeps its width) ── */}
      <nav aria-label="Steps" className="hidden pb-6 lg:block">
        <ol className="grid grid-cols-4 gap-3">
          {steps.map((s, i) => {
            const done = i < stepIndex || (!!bare && i === stepIndex);
            const current = i === stepIndex;
            const canGo = !bare && i !== stepIndex && i <= maxReach;
            return (
              <li key={s.key} className="min-w-0">
                <button
                  type="button"
                  disabled={!canGo}
                  onClick={() => canGo && router.push(routeFor(s.key))}
                  aria-current={current ? "step" : undefined}
                  className={`group flex w-full flex-col gap-3 text-left ${
                    canGo ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span
                    className={`h-1.5 w-full rounded-full transition-colors ${
                      done || current ? "bg-secondary" : "bg-gray-200"
                    }`}
                  />
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        done
                          ? "bg-secondary text-white"
                          : current
                            ? "border-2 border-secondary bg-white text-secondary"
                            : "border-2 border-gray-200 bg-white text-gray-400"
                      }`}
                    >
                      {done ? <Check size={13} strokeWidth={3} /> : i + 1}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block truncate text-sm font-bold ${
                          current || done ? "text-[#1a1a1a]" : "text-gray-400"
                        } ${canGo ? "group-hover:text-secondary" : ""}`}
                      >
                        {s.label}
                      </span>
                      <span className="block truncate text-xs text-gray-500">
                        {s.hint}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto lg:overflow-visible">
        <div
          className={`mx-auto grid grid-cols-[minmax(0,1fr)] gap-6 px-4 py-6 sm:px-6 lg:p-0 ${
            bare ? "max-w-3xl" : "xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_340px]"
          }`}
        >
          {/* Form card */}
          <div className="min-w-0 rounded-3xl border border-gray-100 bg-white">
            <div className="p-5 sm:p-7 lg:p-8">
              <div className="mb-6">
                {!bare && (
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    Step {stepIndex + 1} of {steps.length}
                  </p>
                )}
                <h2 className="mt-1 font-poppins text-2xl font-semibold tracking-tight">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              </div>
              <div className="flex flex-col gap-7">{children}</div>
            </div>

            {!bare && (
              <div className="hidden items-center justify-between gap-3 border-t border-gray-100 px-8 py-5 lg:flex">
                <div>
                  <BackButton />
                </div>
                <PrimaryButton />
              </div>
            )}
          </div>

          {/* Live preview (wide screens) */}
          {!bare && (
            <aside className="hidden xl:block">
              <div className="sticky top-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Preview
                </p>
                <ListingPreview data={merged} />
                <p className="mt-3 text-xs leading-relaxed text-gray-500">
                  This is roughly how huttspotters will see your listing.
                </p>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* ── Mobile / tablet footer ─────────────────────────── */}
      {!bare && (
        <footer className="flex items-center gap-3 border-t border-gray-100 bg-white px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 sm:px-6 lg:hidden">
          <BackButton />
          <PrimaryButton full />
        </footer>
      )}
    </div>
  );
}
