import api from "./api";
import { AccountMode, Gender, HowFoundUs, Intent } from "./types";

export interface UpdateProfilePayload {
  phoneNumber?: string;
  gender?: Gender;
  accountMode?: AccountMode;
  howYouFoundUs?: HowFoundUs;
  intent?: Intent;
  profilePhoto?: string;
  isOnboarded?: boolean;
  agentProfile?: {
    agencyName?: string;
    operatingAreas?: string[];
  };
  huttspotterProfile?: {
    budgetMin?: number;
    budgetMax?: number;
    preferredLocations?: string[];
  };
}

export async function updateUserProfile(payload: UpdateProfilePayload) {
  const response = await api.patch<{
    message: string;
    isOnboarded: boolean;
  }>("/api/user/profile", payload);
  return response.data;
}
