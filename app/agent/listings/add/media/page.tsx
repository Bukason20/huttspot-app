"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { useListing } from "@/context/ListingContext";
import { createListingStep4, uploadPropertyMedia } from "@/lib/agent";
import ListingWizard, {
  ADD_STEPS,
  ADD_ROUTES,
} from "@/components/agent/listing/ListingWizard";
import MediaFields, {
  MIN_PHOTOS,
  PhotoItem,
  UploadProgress,
  srcOf,
} from "@/components/agent/listing/MediaFields";
import { FormError } from "@/components/agent/listing/fields";

export default function AddListingMedia() {
  const router = useRouter();
  const { formData, reset } = useListing();

  // First photo = cover
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [video, setVideo] = useState<{ file?: File; preview?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Publishing...");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [published, setPublished] = useState<{ title: string; cover: string } | null>(null);

  const canPublish = photos.length >= MIN_PHOTOS;

  const handlePublish = async () => {
    if (!canPublish || loading) return;

    if (!formData.propertyId) {
      setError("Property ID missing. Please go back to step 1.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1 — Upload ALL photos and video in one request
      // (cover is already first, so the returned URLs keep that order)
      setLoadingMessage("Uploading photos...");
      setProgress(0);
      const files = photos.flatMap((p) => (p.kind === "file" ? [p.file] : []));
      const mediaRes = await uploadPropertyMedia(files, video?.file, setProgress);

      // Step 2 — Submit step 4 to publish with returned URLs
      setLoadingMessage("Publishing listing...");
      setProgress(null);
      const publishRes = await createListingStep4({
        step: 4,
        propertyId: formData.propertyId,
        data: {
          photos: mediaRes.photos,
          ...(mediaRes.video && { video: mediaRes.video }),
        },
      });

      // Step 3 — Handle missing fields error from backend
      if (publishRes.missingFields && publishRes.missingFields.length > 0) {
        setError(
          `Missing required fields: ${publishRes.missingFields.join(", ")}. Please go back and complete all steps.`,
        );
        return;
      }

      // Step 4 — Success
      setPublished({
        title: formData.propertyName ?? "Your listing",
        cover: mediaRes.photos[0] ?? srcOf(photos[0]),
      });
      reset();
    } catch (err: any) {
      setError(err.message || "Failed to publish. Please try again.");
    } finally {
      setLoading(false);
      setProgress(null);
      setLoadingMessage("Publishing...");
    }
  };

  if (published) {
    return (
      <ListingWizard
        mode="add"
        steps={ADD_STEPS}
        stepIndex={3}
        routeFor={(k) => ADD_ROUTES[k]}
        title="Your listing is live"
        description="Huttspotters can now find it and contact you."
        primary={{ label: "", onClick: () => {} }}
        bare
      >
        <div className="flex flex-col items-center py-4 text-center">
          <div className="relative w-full max-w-sm">
            <img
              src={published.cover}
              alt=""
              className="aspect-[4/3] w-full rounded-3xl object-cover"
            />
            <span className="absolute -bottom-5 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-secondary">
              <Check size={22} strokeWidth={3} className="text-white" />
            </span>
          </div>
          <p className="mt-9 font-poppins text-lg font-semibold">{published.title}</p>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            New inquiries will show up in Chat. You can edit the listing at any time.
          </p>
          <div className="mt-7 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
            <button
              onClick={() => router.push("/agent/listings")}
              className="h-12 flex-1 cursor-pointer rounded-full bg-secondary text-[15px] font-semibold text-white transition-colors hover:bg-[#08744a]"
            >
              View my listings
            </button>
            <button
              onClick={() => router.push(ADD_ROUTES.basics)}
              className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-200 bg-white text-[15px] font-semibold transition-colors hover:bg-gray-50"
            >
              <Plus size={17} /> Add another
            </button>
          </div>
        </div>
      </ListingWizard>
    );
  }

  return (
    <ListingWizard
      mode="add"
      steps={ADD_STEPS}
      stepIndex={3}
      routeFor={(k) => ADD_ROUTES[k]}
      title="Show it off"
      description="Listings with clear photos get far more inquiries."
      onBack={loading ? undefined : () => router.push(ADD_ROUTES.details)}
      primary={{
        label: "Publish listing",
        onClick: handlePublish,
        disabled: !canPublish,
        loading,
        loadingLabel: loadingMessage,
      }}
      preview={{
        cover: photos[0] ? srcOf(photos[0]) : null,
        photoCount: photos.length,
      }}
    >
      <MediaFields
        photos={photos}
        setPhotos={setPhotos}
        video={video}
        setVideo={setVideo}
        disabled={loading}
      />
      {loading && <UploadProgress label={loadingMessage} percent={progress} />}
      <FormError message={error} />
    </ListingWizard>
  );
}
