import api from "./api";

export interface Property {
  _id: string;
  title: string;
  type: string;
  purpose: string;
  price: number;
  paymentType: string;
  location: {
    state: string;
    city: string;
    street?: string;
  };
  details: {
    bedrooms: number;
    bathrooms: number;
    toilets: number;
    parkingSpaces: number;
    features?: string[];
  };
  media: {
    photos: string[];
    video?: string;
  };
  agent: {
    _id: string;
    name: string;
    phoneNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface GetPropertiesResponse {
  message: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: Property[];
}

interface GetSavedResponse {
  message: string;
  count: number;
  data: Property[];
}

// ── Get all published properties ──────────────────────────────
export async function getProperties(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<GetPropertiesResponse> {
  const response = await api.get("/api/properties", { params });
  return response.data;
}

// ── Get single property by ID ─────────────────────────────────
export async function getPropertyDetail(
  id: string,
): Promise<{ data: Property }> {
  const response = await api.get(`/api/properties/${id}`);
  return response.data;
}

// ── Get all saved properties for current user ─────────────────
export async function getSavedProperties(): Promise<GetSavedResponse> {
  const response = await api.get("/api/user/properties/saved");
  return response.data;
}

// ── Toggle save/unsave a property ─────────────────────────────
export async function toggleSaveProperty(
  propertyId: string,
): Promise<{ message: string }> {
  const response = await api.post(`/api/user/properties/${propertyId}/save`);
  return response.data;
}
