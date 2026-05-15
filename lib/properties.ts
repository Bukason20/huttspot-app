import api from "./api";
import { Intent } from "./types";

// ── Types ──────────────────────────────────────────────────────

export interface PublicProperty {
  _id: string;
  title: string;
  type: string;
  purpose: string;
  price: number;
  paymentType: string;
  location?: {
    state: string;
    city: string;
    street?: string;
  };
  details?: {
    bedrooms: number;
    bathrooms: number;
    toilets: number;
    parkingSpaces: number;
  };
  media?: {
    photos: string[];
  };
  agent?: {
    _id: string;
    name: string;
    phoneNumber?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RecommendedProperty {
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

export interface PaginatedPropertiesResponse {
  message: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: PublicProperty[];
}

export interface ListPropertiesResponse {
  message: string;
  count: number;
  data: PublicProperty[];
}

export interface FilterParams {
  city?: string;
  type?: string;
  purpose?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// ── Endpoints ──────────────────────────────────────────────────

/**
 * Search properties by a query string (e.g. city, street, title)
 */
export async function searchProperties(
  q: string,
  page: number = 1,
  limit: number = 12,
): Promise<PaginatedPropertiesResponse> {
  const response = await api.get<PaginatedPropertiesResponse>(
    "/api/properties/search",
    { params: { q, page, limit } },
  );
  return response.data;
}

/**
 * Filter properties by specific criteria
 */
export async function filterProperties(
  params: FilterParams,
): Promise<PaginatedPropertiesResponse> {
  const response = await api.get<PaginatedPropertiesResponse>(
    "/api/properties/filter",
    { params },
  );
  return response.data;
}

/**
 * Get a single property by ID
 */
export async function getPropertyById(
  id: string,
): Promise<{ message: string; data: PublicProperty }> {
  const response = await api.get<{ message: string; data: PublicProperty }>(
    `/api/properties/${id}`,
  );
  return response.data;
}

/**
 * Get properties near specific coordinates
 */
export async function getNearbyProperties(
  lat: number,
  lng: number,
  radius?: number,
  limit?: number,
): Promise<ListPropertiesResponse> {
  const response = await api.get<ListPropertiesResponse>(
    "/api/properties/nearby",
    { params: { lat, lng, radius, limit } },
  );
  return response.data;
}

/**
 * Get trending/popular properties
 */
export async function getTrendingProperties(
  limit: number = 10,
): Promise<ListPropertiesResponse> {
  const response = await api.get<ListPropertiesResponse>(
    "/api/properties/trending",
    { params: { limit } },
  );
  return response.data;
}

/**
 * Get recommended properties for the authenticated user
 */
export async function getRecommendedProperties(
  intent?: Intent,
): Promise<{ count: number; properties: RecommendedProperty[] }> {
  const response = await api.get<{
    count: number;
    properties: RecommendedProperty[];
  }>("/api/user/properties/recommended", {
    params: { intent },
  });
  return response.data;
}
