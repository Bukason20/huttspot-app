import api from "./api";
import { AccountMode, RegisterPayload } from "./types";

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

  // Save to localStorage
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  // Also save to cookie so middleware can read it
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

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

  // Also save to cookie
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

  return response.data;
}
export async function verifyEmail(token: string) {
  const response = await api.get<{ message: string }>(
    "/api/auth/verify-email",
    { params: { token } },
  );
  return response.data;
}

// Clears any signed-in session on this browser (same steps as logout)
export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("accountMode");
  localStorage.removeItem("huttspot_onboarding");
  document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
}

// Sends a fresh verification link to an unverified account
export async function resendVerification(email: string) {
  const response = await api.post<{ message: string; email: string }>(
    "/api/auth/resend-verification",
    { email },
  );
  return response.data;
}

/**
 * True when a login error means "account exists but email isn't verified".
 * Prefers a machine-readable code if the backend adds one; falls back to the
 * current response shape ({ message: "Please verify your email…", email }).
 */
export function isEmailNotVerifiedError(err: any): boolean {
  if (err?.data?.code === "EMAIL_NOT_VERIFIED") return true;
  const message: string = err?.data?.message ?? err?.message ?? "";
  return /verify your email/i.test(message);
}

// ── Password reset ─────────────────────────────────────────────

/**
 * Emails a password reset link. The backend answers 200 even when no
 * account uses this email, so the UI must not say "account not found".
 * Errors (err.status): 400 email missing · 403 email not verified (a new
 * verification link is sent instead) · 429 too many attempts.
 */
export async function forgotPassword(email: string) {
  const response = await api.post<{ message: string; email: string }>(
    "/api/auth/forgot-password",
    { email },
  );
  return response.data;
}

/**
 * Sets a new password using the token from the reset email.
 * Errors (err.status): 400 missing / invalid / expired token or password
 * shorter than 6 characters · 404 user not found.
 */
export async function resetPassword(token: string, newPassword: string) {
  const response = await api.post<{ message: string }>(
    "/api/auth/reset-password",
    { token, newPassword },
  );
  return response.data;
}

/** Backend minimum for passwords */
export const MIN_PASSWORD_LENGTH = 6;
