import api from "./api";
import { UserProfile } from "./types";

export async function getUserProfile() {
  const response = await api.get<{ message: string; data: UserProfile }>(
    "/api/user/profile",
  );

  console.log(response.data);
  return response.data.data;
}

export async function uploadProfilePhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await api.post<{
    message: string;
    profilePhoto: string;
  }>("/api/user/profile/upload-photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.profilePhoto;
}
