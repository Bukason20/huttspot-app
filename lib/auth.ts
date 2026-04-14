import api from "./api";
import { RegisterPayload } from "./types";

export async function registerUser(payload: RegisterPayload) {
  try {
    const response = await api.post<{
      message: string;
      userId: string;
      isOnboarded: boolean;
    }>("/api/auth/register", payload);
    return response.data;
  } catch (error: any) {
    console.error("❌ Register error:", error?.response?.data);
    throw error;
  }
}

export async function loginUser(payload: { email: string; password: string }) {
  const response = await api.post<{
    message: string;
    token: string;
    isFirstLogin: boolean;
    user: {
      id: string;
      name: string;
      email: string;
      isOnboarded: boolean;
    };
  }>("/api/auth/login", payload);

  const { token, user } = response.data;

  // Save token — required for all subsequent authenticated requests
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  return response.data;
}

export async function googleAuth(idToken: string) {
  const response = await api.post<{
    message: string;
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      isOnboarded: boolean;
      accountMode?: string;
    };
  }>("/api/auth/login/google", { idToken });

  const { token, user } = response.data;

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  return response.data;
}

export async function verifyEmail(token: string) {
  const response = await api.get<{ message: string }>(
    "/api/auth/verify-email",
    { params: { token } },
  );
  return response.data;
}
