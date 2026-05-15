"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CloudUpload, X, Star } from "lucide-react";
import { useListing } from "@/context/ListingContext";
import { createListingStep4, uploadPropertyMedia } from "@/lib/agent";
import StepHeader from "@/components/agent/StepHeader";

export default function AddListingStep4() {
  const router = useRouter();
  const { formData, setFormData, reset } = useListing();

  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [video, setVideo] = useState<File | undefined>();
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Publishing...");
  const [error, setError] = useState("");

  const canPublish = photos.length >= 3;

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newPhotos = [...photos, ...files].slice(0, 10);
    setPhotos(newPhotos);
    const newPreviews = [...photoPreviews];
    files.forEach((file) => newPreviews.push(URL.createObjectURL(file)));
    setPhotoPreviews(newPreviews.slice(0, 10));
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
    if (coverIndex === index) setCoverIndex(0);
    else if (coverIndex > index) setCoverIndex(coverIndex - 1);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

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
      setLoadingMessage("Uploading media...");
      const mediaRes = await uploadPropertyMedia(photos, video ?? undefined);

      // Step 2 — Reorder so cover photo is first
      const orderedPhotos = [...mediaRes.photos];
      if (coverIndex !== 0 && orderedPhotos[coverIndex]) {
        const cover = orderedPhotos.splice(coverIndex, 1)[0];
        orderedPhotos.unshift(cover);
      }

      // Step 3 — Submit step 4 to publish with returned URLs
      setLoadingMessage("Publishing listing...");
      const publishRes = await createListingStep4({
        step: 4,
        propertyId: formData.propertyId,
        data: {
          photos: orderedPhotos,
          ...(mediaRes.video && { video: mediaRes.video }),
        },
      });

      // Step 4 — Handle missing fields error from backend
      if (publishRes.missingFields && publishRes.missingFields.length > 0) {
        setError(
          `Missing required fields: ${publishRes.missingFields.join(", ")}. Please go back and complete all steps.`,
        );
        return;
      }

      // Step 5 — Success
      reset();
      router.push("/agent/listings");
    } catch (err: any) {
      setError(err.message || "Failed to publish. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMessage("Publishing...");
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 pt-12 pb-10 flex flex-col">
      <StepHeader
        title="Upload New Listing"
        subtitle="Upload Media"
        currentStep={4}
        totalSteps={4}
      />

      <div className="flex flex-col gap-6 flex-1">
        {/* Photos */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#1a1a1a]">
            Add Property Photos{" "}
            <span className="text-gray-400 font-normal">(Minimum 3)</span>
          </label>

          <button
            onClick={() => photoRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-secondary transition-colors"
          >
            <CloudUpload size={48} className="text-gray-300" />
            <p className="text-sm text-gray-400">
              Supported formats: JPG, PNG 10MB
            </p>
          </button>

          <input
            ref={photoRef}
            type="file"
            accept="image/jpg,image/jpeg,image/png"
            multiple
            className="hidden"
            onChange={handlePhotosChange}
          />

          {photoPreviews.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-xs text-gray-400">
                Tap ⭐ to set as cover photo
              </p>
              <div className="grid grid-cols-3 gap-2">
                {photoPreviews.map((preview, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden">
                    <img
                      src={preview}
                      alt={`photo ${i + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    {coverIndex === i && (
                      <div className="absolute top-1 left-1 bg-secondary rounded-full px-2 py-0.5 flex items-center gap-1">
                        <Star size={10} fill="white" color="white" />
                        <span className="text-white text-[9px] font-semibold">
                          Cover
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => setCoverIndex(i)}
                      className={`absolute bottom-1 left-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all ${coverIndex === i ? "bg-secondary" : "bg-black/40"}`}
                    >
                      <Star
                        size={12}
                        fill={coverIndex === i ? "white" : "none"}
                        color="white"
                      />
                    </button>
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/40 rounded-full flex items-center justify-center cursor-pointer"
                    >
                      <X size={12} color="white" />
                    </button>
                  </div>
                ))}
                {photoPreviews.length < 10 && (
                  <button
                    onClick={() => photoRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-secondary transition-colors"
                  >
                    <span className="text-2xl text-gray-300">+</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {photoPreviews.length}/10 photos added
                {photoPreviews.length < 3 && (
                  <span className="text-primary ml-1">
                    (need {3 - photoPreviews.length} more)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Video */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#1a1a1a]">
            Add Short Video Tour{" "}
            <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          {videoPreview ? (
            <div className="relative rounded-2xl overflow-hidden">
              <video
                src={videoPreview}
                controls
                className="w-full rounded-2xl"
              />
              <button
                onClick={() => {
                  setVideo(undefined);
                  setVideoPreview(null);
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center cursor-pointer"
              >
                <X size={14} color="white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => videoRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-secondary transition-colors"
            >
              <CloudUpload size={48} className="text-gray-300" />
              <p className="text-sm text-gray-400">
                Supported formats: MP4 50MB
              </p>
            </button>
          )}
          <input
            ref={videoRef}
            type="file"
            accept="video/mp4"
            className="hidden"
            onChange={handleVideoChange}
          />
        </div>

        <p className="text-sm text-primary font-medium">
          Tip: Clear, bright photos get more views.
        </p>

        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
      </div>

      <button
        onClick={handlePublish}
        disabled={!canPublish || loading}
        className={`w-full rounded-full py-4 text-[15px] font-semibold mt-8 transition-all duration-200 ${
          canPublish && !loading
            ? "bg-secondary text-white cursor-pointer"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {loading ? loadingMessage : "Publish Listing"}
      </button>
    </div>
  );
}
