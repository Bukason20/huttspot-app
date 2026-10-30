"use client";

import { useRef, useState } from "react";
import { Film, ImagePlus, Star, Trash2, UploadCloud, X } from "lucide-react";
import { Section } from "./fields";

export type PhotoItem =
  | { id: string; kind: "url"; url: string }
  | { id: string; kind: "file"; file: File; preview: string };

export const MIN_PHOTOS = 3;
export const MAX_PHOTOS = 10;
const PHOTO_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const PHOTO_MAX = 10 * 1024 * 1024;
const VIDEO_MAX = 50 * 1024 * 1024;

const uid = () => Math.random().toString(36).slice(2);
export const srcOf = (p: PhotoItem) => (p.kind === "url" ? p.url : p.preview);

/**
 * Photo grid with cover selection + optional video tour.
 * The first photo in `photos` is the cover.
 */
export default function MediaFields({
  photos,
  setPhotos,
  video,
  setVideo,
  disabled,
}: {
  photos: PhotoItem[];
  setPhotos: (p: PhotoItem[]) => void;
  video: { file?: File; url?: string; preview?: string } | null;
  setVideo: (v: { file?: File; url?: string; preview?: string } | null) => void;
  disabled?: boolean;
}) {
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState("");
  const [dragging, setDragging] = useState(false);

  const addFiles = (files: File[]) => {
    const problems: string[] = [];
    const ok = files.filter((f) => {
      if (!PHOTO_TYPES.includes(f.type)) {
        problems.push(`${f.name} isn't a JPG or PNG`);
        return false;
      }
      if (f.size > PHOTO_MAX) {
        problems.push(`${f.name} is over 10MB`);
        return false;
      }
      return true;
    });
    const room = MAX_PHOTOS - photos.length;
    if (ok.length > room) problems.push(`Only ${MAX_PHOTOS} photos allowed`);
    const added: PhotoItem[] = ok.slice(0, Math.max(0, room)).map((file) => ({
      id: uid(),
      kind: "file",
      file,
      preview: URL.createObjectURL(file),
    }));
    if (added.length) setPhotos([...photos, ...added]);
    setNotice(problems.join(" · "));
  };

  const remove = (id: string) => setPhotos(photos.filter((p) => p.id !== id));
  const makeCover = (id: string) => {
    const p = photos.find((x) => x.id === id);
    if (!p) return;
    setPhotos([p, ...photos.filter((x) => x.id !== id)]);
  };

  const onVideo = (file?: File) => {
    if (!file) return;
    if (file.type !== "video/mp4") return setNotice("Video must be an MP4");
    if (file.size > VIDEO_MAX) return setNotice("Video must be 50MB or less");
    setNotice("");
    setVideo({ file, preview: URL.createObjectURL(file) });
  };

  const need = Math.max(0, MIN_PHOTOS - photos.length);

  return (
    <>
      <Section
        title="Photos"
        description={`At least ${MIN_PHOTOS}, up to ${MAX_PHOTOS}. JPG or PNG, 10MB each. The first photo is the cover.`}
      >
        {/* Drop zone */}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => photoRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(Array.from(e.dataTransfer.files));
            }}
            className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed px-6 py-8 text-center transition-colors disabled:cursor-not-allowed ${
              dragging
                ? "border-secondary bg-secondary/5"
                : "border-gray-200 bg-[#f7f7f5] hover:border-secondary"
            }`}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
              <UploadCloud size={22} className="text-secondary" />
            </span>
            <p className="font-bold">
              <span className="text-secondary">Choose photos</span>
              <span className="hidden sm:inline"> or drag them here</span>
            </p>
            <p className="text-xs text-gray-500">
              Bright, wide shots of each room work best
            </p>
          </button>
        )}
        <input
          ref={photoRef}
          type="file"
          accept="image/jpg,image/jpeg,image/png"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />

        {notice && (
          <p className="rounded-2xl bg-primary/5 px-4 py-2.5 text-sm text-[#1a1a1a]">
            {notice}
          </p>
        )}

        {photos.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((p, i) => (
                <div
                  key={p.id}
                  className={`group relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 ${
                    i === 0 ? "outline-2 outline-offset-2 outline-secondary" : ""
                  }`}
                >
                  <img src={srcOf(p)} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 0 ? (
                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[11px] font-bold text-white">
                      <Star size={11} fill="white" /> Cover
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => makeCover(p.id)}
                      className="absolute left-2 top-2 flex cursor-pointer items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-bold text-white transition-colors hover:bg-black/75"
                    >
                      <Star size={11} /> Make cover
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => remove(p.id)}
                    aria-label="Remove photo"
                    className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => photoRef.current?.click()}
                  className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 transition-colors hover:border-secondary hover:text-secondary"
                >
                  <ImagePlus size={20} />
                  <span className="text-xs font-bold">Add more</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all ${need ? "bg-primary" : "bg-secondary"}`}
                  style={{ width: `${(photos.length / MAX_PHOTOS) * 100}%` }}
                />
              </div>
              <p className={`text-xs font-bold ${need ? "text-primary" : "text-secondary"}`}>
                {photos.length}/{MAX_PHOTOS}
                {need > 0 && ` · ${need} more needed`}
              </p>
            </div>
          </>
        )}
      </Section>

      <Section
        title="Video tour"
        description="Optional. A short walk-through (MP4, up to 50MB) builds trust."
      >
        {video ? (
          <div className="relative overflow-hidden rounded-2xl bg-black">
            <video src={video.preview ?? video.url} controls className="max-h-80 w-full" />
            <button
              type="button"
              disabled={disabled}
              onClick={() => setVideo(null)}
              className="absolute right-3 top-3 flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-black/60 px-3 text-xs font-bold text-white hover:bg-black/80"
            >
              <Trash2 size={13} /> Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => videoRef.current?.click()}
            className="flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-secondary"
          >
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#f7f7f5]">
              <Film size={20} className="text-secondary" />
            </span>
            <span>
              <span className="block font-bold">Add a video tour</span>
              <span className="block text-xs text-gray-500">MP4, up to 50MB</span>
            </span>
          </button>
        )}
        <input
          ref={videoRef}
          type="file"
          accept="video/mp4"
          className="hidden"
          onChange={(e) => {
            onVideo(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </Section>
    </>
  );
}

/** Upload progress shown while publishing */
export function UploadProgress({ label, percent }: { label: string; percent: number | null }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-[#f7f7f5] p-4">
      <div className="flex items-center justify-between text-sm font-bold">
        <span>{label}</span>
        {percent !== null && <span className="text-secondary">{percent}%</span>}
      </div>
      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full bg-secondary transition-all ${percent === null ? "w-1/3 animate-pulse" : ""}`}
          style={percent !== null ? { width: `${percent}%` } : undefined}
        />
      </div>
    </div>
  );
}
