import api from "./api";
import {
  ListingStep1Payload,
  ListingStep2Payload,
  ListingStep3Payload,
  ListingStep4Payload,
  PropertyResponse,
} from "./types";

const CREATE_ENDPOINT = "/api/agent/property/create";

// ── Response type shared across all steps ────────────────────
interface StepResponse {
  message: string;
  propertyId: string;
  currentStep: number;
  isPublished: boolean;
  property: PropertyResponse;
}

// ── Step 1: Basic Info — creates new draft ────────────────────
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

// ── Step 3: Details & Features ────────────────────────────────
export async function createListingStep3(
  payload: ListingStep3Payload,
): Promise<StepResponse> {
  const response = await api.post(CREATE_ENDPOINT, payload);
  return response.data;
}

// ── Step 4: Media & Publish ───────────────────────────────────
export async function createListingStep4(
  payload: ListingStep4Payload,
): Promise<StepResponse & { missingFields?: string[] }> {
  const response = await api.post(CREATE_ENDPOINT, payload);
  return response.data;
}

// ── Upload property media (photos + video) ────────────────────
// Call this BEFORE step 4. Send the returned URLs in step 4 data.
export async function uploadPropertyMedia(
  photos: File[],
  video?: File,
): Promise<{ photos: string[]; video?: string }> {
  const formData = new FormData();

  // Append each photo under the "photos" field
  photos.forEach((photo) => {
    formData.append("photos", photo);
  });

  // Append video if provided
  if (video) {
    formData.append("video", video);
  }

  const response = await api.post<{
    message: string;
    photos: string[];
    video?: string;
  }>("/api/user/property/upload-media", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return {
    photos: response.data.photos,
    video: response.data.video,
  };
}

// ── Get all agent properties (dashboard) ─────────────────────
export async function getAgentProperties(): Promise<{
  properties: PropertyResponse[];
}> {
  // Updated to the correct endpoint based on your Swagger docs
  const response = await api.get("/api/agent/property/my-properties");
  return response.data;
}

// ── Get single property (resume draft) ───────────────────────
export async function getPropertyById(
  propertyId: string,
): Promise<{ property: PropertyResponse }> {
  const response = await api.get(`/api/agent/property/${propertyId}`);
  return response.data;
}
