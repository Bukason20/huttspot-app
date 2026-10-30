import api from "./api";
import {
  ListingStep1Payload,
  ListingStep2Payload,
  ListingStep3Payload,
  ListingStep4Payload,
  PropertyResponse,
} from "./types";

const CREATE_ENDPOINT = "/api/agent/property/create";

interface StepResponse {
  message: string;
  propertyId: string;
  currentStep: number;
  isPublished: boolean;
  property: PropertyResponse;
}

// ── Step 1: Basic Info ────────────────────────────────────────
export async function createListingStep1(
  payload: ListingStep1Payload,
): Promise<StepResponse> {
  const response = await api.post(CREATE_ENDPOINT, payload);
  return response.data;
}

// ── Step 2: Location ──────────────────────────────────────────
export async function createListingStep2(
  payload: ListingStep2Payload,
): Promise<StepResponse> {
  const response = await api.post(CREATE_ENDPOINT, payload);
  return response.data;
}

// ── Step 3: Details ───────────────────────────────────────────
export async function createListingStep3(
  payload: ListingStep3Payload,
): Promise<StepResponse> {
  const response = await api.post(CREATE_ENDPOINT, payload);
  return response.data;
}

// ── Step 4: Media + Publish ───────────────────────────────────
export async function createListingStep4(
  payload: ListingStep4Payload,
): Promise<StepResponse & { missingFields?: string[] }> {
  const response = await api.post(CREATE_ENDPOINT, payload);
  return response.data;
}

// ── Update existing property (for edit flow) ──────────────────
// Uses same endpoint but always sends propertyId so backend
// updates instead of creating new
export async function updateListingStep1(
  propertyId: string,
  payload: ListingStep1Payload,
): Promise<StepResponse> {
  const response = await api.post(CREATE_ENDPOINT, {
    ...payload,
    propertyId, // ← tells backend to update, not create
  });
  return response.data;
}

export async function updateListingStep2(
  propertyId: string,
  payload: Omit<ListingStep2Payload, "propertyId">,
): Promise<StepResponse> {
  const response = await api.post(CREATE_ENDPOINT, {
    ...payload,
    propertyId,
  });
  return response.data;
}

export async function updateListingStep3(
  propertyId: string,
  payload: Omit<ListingStep3Payload, "propertyId">,
): Promise<StepResponse> {
  const response = await api.post(CREATE_ENDPOINT, {
    ...payload,
    propertyId,
  });
  return response.data;
}

export async function updateListingStep4(
  propertyId: string,
  payload: Omit<ListingStep4Payload, "propertyId">,
): Promise<StepResponse> {
  const response = await api.post(CREATE_ENDPOINT, {
    ...payload,
    propertyId,
  });
  return response.data;
}

// ── Upload property media ─────────────────────────────────────
export async function uploadPropertyMedia(
  photos: File[],
  video?: File,
  onProgress?: (percent: number) => void,
): Promise<{ photos: string[]; video?: string }> {
  const formData = new FormData();
  photos.forEach((photo) => formData.append("photos", photo));
  if (video) formData.append("video", video);

  const response = await api.post<{
    message: string;
    photos: string[];
    video?: string;
  }>("/api/user/property/upload-media", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    // Optional upload progress for the UI
    onUploadProgress: onProgress
      ? (e) => {
          if (e.total) onProgress(Math.round((e.loaded / e.total) * 100));
        }
      : undefined,
  });

  return { photos: response.data.photos, video: response.data.video };
}

// ── Get all agent properties ──────────────────────────────────
export async function getAgentProperties(): Promise<{
  properties: PropertyResponse[];
}> {
  const response = await api.get("/api/agent/property/my-properties");
  return response.data;
}

// ── Get single property ───────────────────────────────────────
export async function getPropertyById(
  propertyId: string,
): Promise<{ property: PropertyResponse }> {
  const response = await api.get(`/api/agent/property/${propertyId}`);
  return response.data;
}
