"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Check } from "lucide-react";
import { useListing } from "@/context/ListingContext";
import { updateListingStep4, uploadPropertyMedia } from "@/lib/agent";
import ListingWizard, {
  EDIT_STEPS,
  editRoute,
} from "@/components/agent/listing/ListingWizard";
import MediaFields, {
  MIN_PHOTOS,
  PhotoItem,
  UploadProgress,
  srcOf,
} from "@/components/agent/listing/MediaFields";
import { FormError } from "@/components/agent/listing/fields";

export default function EditMediaPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { formData, setFormData } = useListing();

  // Start from the photos already on the listing (first = cover)
  const [photos, setPhotos] = useState<PhotoItem[]>(
    (formData.existingPhotos ?? []).map((url, i) => ({ id: `u${i}`, kind: "url", url })),
  );
  const [video, setVideo] = useState<{ file?: File; url?: string; preview?: string } | null>(
    formData.existingVideo ? { url: formData.existingVideo } : null,
  );
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Saving...");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const canSave = photos.length >= MIN_PHOTOS;

  const handleSave = async () => {
    if (!canSave || loading) return;
    setLoading(true);
    setError("");

    try {
      // Upload only the new files, then rebuild the list in the order shown
      const newFiles = photos.flatMap((p) => (p.kind === "file" ? [p.file] : []));
      let uploaded: string[] = [];
      let videoUrl = video?.url;

      if (newFiles.length || video?.file) {
        setLoadingMessage("Uploading...");
        setProgress(0);
        const res = await uploadPropertyMedia(newFiles, video?.file, setProgress);
        uploaded = res.photos;
        if (video?.file) videoUrl = res.video;
      }

      let next = 0;
      const finalPhotos = photos.map((p) => (p.kind === "url" ? p.url : uploaded[next++]));

      setLoadingMessage("Saving changes...");
      setProgress(null);
      await updateListingStep4(propertyId, {
        step: 4,
        data: {
          photos: finalPhotos.filter(Boolean),
          ...(videoUrl && { video: videoUrl }),
        },
      });

      setFormData({ existingPhotos: finalPhotos, existingVideo: videoUrl });
      setSaved(true);
    } catch (err: any) {
      setError(err.message || "Failed to save.");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  if (saved) {
    return (
      <ListingWizard
        mode="edit"
        steps={EDIT_STEPS}
        stepIndex={3}
        routeFor={(k) => editRoute(propertyId, k)}
        title="All changes saved"
        description="Your listing is up to date."
        primary={{ label: "", onClick: () => {} }}
        bare
      >
        <div className="flex flex-col items-center py-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
              <Check size={22} strokeWidth={3} className="text-white" />
            </span>
          </span>
          <p className="mt-5 font-poppins text-lg font-semibold">{formData.propertyName}</p>
          <button
            onClick={() => router.push("/agent/listings")}
            className="mt-7 h-12 w-full max-w-xs cursor-pointer rounded-full bg-secondary text-[15px] font-semibold text-white transition-colors hover:bg-[#08744a]"
          >
            Back to my listings
          </button>
        </div>
      </ListingWizard>
    );
  }

  return (
    <ListingWizard
      mode="edit"
      steps={EDIT_STEPS}
      stepIndex={3}
      routeFor={(k) => editRoute(propertyId, k)}
      title="Photos and video"
      description="Add, remove or reorder photos. The first one is the cover."
      onBack={loading ? undefined : () => router.push(editRoute(propertyId, "details"))}
      primary={{
        label: "Save changes",
        onClick: handleSave,
        disabled: !canSave,
        loading,
        loadingLabel: loadingMessage,
      }}
      preview={{ cover: photos[0] ? srcOf(photos[0]) : null, photoCount: photos.length }}
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
