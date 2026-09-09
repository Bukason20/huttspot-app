import api from "./api";
import {
  Property,
  PaginatedResponse,
  ListResponse,
  FilterParams,
  Intent,
} from "./types";

/**
 * GET /api/properties
 * Get all published properties with optional pagination
 */
export async function getAllProperties(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse> {
  const response = await api.get<PaginatedResponse>("/api/properties", {
    params,
  });
  return response.data;
}

/**
 * GET /api/properties/search
 * Search properties by query string (city, title, street)
 */
export async function searchProperties(
  q: string,
  page: number = 1,
  limit: number = 12,
): Promise<PaginatedResponse> {
  const response = await api.get<PaginatedResponse>("/api/properties/search", {
    params: { q, page, limit },
  });
  return response.data;
}

/**
 * GET /api/properties/filter
 * Filter properties by specific criteria
 */
export async function filterProperties(
  params: FilterParams,
): Promise<PaginatedResponse> {
  const response = await api.get<PaginatedResponse>("/api/properties/filter", {
    params,
  });
  return response.data;
}

/**
 * GET /api/properties/:id
 * Get a single property by ID
 */
export async function getPropertyById(
  id: string,
): Promise<{ message: string; data: Property }> {
  const response = await api.get<{ message: string; data: Property }>(
    `/api/properties/${id}`,
  );
  return response.data;
}

/**
 * GET /api/properties/nearby
 * Get properties near specific coordinates
 */
export async function getNearbyProperties(params: {
  lat: number;
  lng: number;
  radius?: number;
  limit?: number;
}): Promise<ListResponse> {
  const response = await api.get<ListResponse>("/api/properties/nearby", {
    params,
  });
  return response.data;
}

/**
 * GET /api/properties/trending
 * Get trending / popular properties
 */
export async function getTrendingProperties(
  limit: number = 10,
): Promise<ListResponse> {
  const response = await api.get<ListResponse>("/api/properties/trending", {
    params: { limit },
  });
  return response.data;
}
