import api from "./api";
import { Property, Intent, ListResponse } from "./types";

interface RecommendedProperty {
  _id: string;
  title: string;
  purpose: string;
  listingType: string;
  price: number;
  location?: {
    state: string;
    city: string;
  };
  media?: {
    photos: string[];
  };
  createdAt: string;
}

/**
 * GET /api/user/properties/recommended
 * Get recommended properties for the authenticated user
 */
export async function getRecommendedProperties(intent?: Intent): Promise<{
  count: number;
  properties: RecommendedProperty[];
}> {
  const response = await api.get("/api/user/properties/recommended", {
    params: { intent },
  });
  return response.data;
}

/**
 * GET /api/user/properties/saved
 * Get all properties saved by the current user
 */
export async function getSavedProperties(): Promise<ListResponse> {
  const response = await api.get<ListResponse>("/api/user/properties/saved");
  return response.data;
}

/**
 * POST /api/user/properties/:id/save
 * Toggle save/unsave a property
 */
export async function toggleSaveProperty(
  propertyId: string,
): Promise<{ message: string }> {
  const response = await api.post(`/api/user/properties/${propertyId}/save`);
  return response.data;
}
