"use client";

import { useCallback, useEffect, useState } from "react";
import api from "./api";
import { AccountMode } from "./types";

// ── Types (match the API docs) ─────────────────────────────────

export interface Plan {
  id: string; // "STANDARD" | "PRO" | "STANDARD_10" | "PRO_30"
  role: AccountMode;
  name: string;
  priceNaira: number;
  durationDays: number;
  points: number;
  listingLimit: number;
  description: string;
}

export interface PlansResponse {
  pointsPerNewAgent: number;
  plans: Plan[];
}

export interface Subscription {
  plan: string | null;
  planName?: string | null;
  status?: string; // "ACTIVE" | "EXPIRED" | "CANCELLED" | ...
  active: boolean;
  expiresAt?: string | null;
  points: number;
  pointsPerNewAgent?: number;
  usage?: { listingsUsed: number; contactsUsed: number };
}

export interface InquiryCost {
  alreadyContacted: boolean;
  cost: number;
  canContact: boolean;
  active: boolean;
  plan: string | null;
  pointsBalance: number;
  expiresAt?: string | null;
}

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "ABANDONED" | string;

export interface Payment {
  reference: string;
  plan: string;
  amountNaira: number;
  points: number;
  status: PaymentStatus;
  channel?: string;
  paidAt?: string | null;
  createdAt: string;
}

export interface VerifyResponse {
  reference: string;
  status: PaymentStatus;
  plan: string;
  amountNaira: number;
  points: number;
  paidAt?: string | null;
  subscription?: Subscription;
}

export interface InitializeResponse {
  message: string;
  authorization_url: string;
  access_code: string;
  reference: string;
  plan: string;
  amountNaira: number;
  points: number;
}

// ── Endpoints ──────────────────────────────────────────────────

/** GET /api/user/subscription/plans?role=… (public) */
export async function getPlans(role?: AccountMode): Promise<PlansResponse> {
  const res = await api.get<PlansResponse>("/api/user/subscription/plans", {
    params: role ? { role } : undefined,
  });
  return {
    pointsPerNewAgent: res.data?.pointsPerNewAgent ?? 1,
    plans: (res.data?.plans ?? []).filter((p) => !role || p.role === role),
  };
}

/** GET /api/user/subscription/me */
export async function getMySubscription(): Promise<Subscription | null> {
  const res = await api.get<{ subscription: Subscription | null }>(
    "/api/user/subscription/me",
  );
  return res.data?.subscription ?? null;
}

/** DELETE /api/user/subscription/cancel (remaining points are lost) */
export async function cancelSubscription(): Promise<Subscription | null> {
  const res = await api.delete<{ subscription: Subscription | null }>(
    "/api/user/subscription/cancel",
  );
  return res.data?.subscription ?? null;
}

/** GET /api/chat/inquiry-cost?propertyId=… | ?receiverId=… */
export async function getInquiryCost(params: {
  propertyId?: string;
  receiverId?: string;
}): Promise<InquiryCost> {
  const res = await api.get<InquiryCost>("/api/chat/inquiry-cost", { params });
  return res.data;
}

/** POST /api/subscription/paystack/initialize */
export async function initializePayment(
  plan: string,
): Promise<InitializeResponse> {
  const res = await api.post<InitializeResponse>(
    "/api/subscription/paystack/initialize",
    { plan },
  );
  return res.data;
}

/** GET /api/subscription/paystack/verify/{reference} (safe to poll) */
export async function verifyPayment(reference: string): Promise<VerifyResponse> {
  const res = await api.get<VerifyResponse>(
    `/api/subscription/paystack/verify/${encodeURIComponent(reference)}`,
  );
  return res.data;
}

/** GET /api/subscription/paystack/payments (latest 50, newest first) */
export async function getPayments(): Promise<Payment[]> {
  const res = await api.get<{ payments: Payment[] }>(
    "/api/subscription/paystack/payments",
  );
  return res.data?.payments ?? [];
}

// ── Helpers ────────────────────────────────────────────────────

/** 402 SUBSCRIPTION_REQUIRED / INSUFFICIENT_POINTS from inquire / sendMessage */
export function subscriptionErrorCode(
  err: any,
): "SUBSCRIPTION_REQUIRED" | "INSUFFICIENT_POINTS" | null {
  const code = err?.data?.code ?? err?.code;
  if (code === "SUBSCRIPTION_REQUIRED" || code === "INSUFFICIENT_POINTS") {
    return code;
  }
  if (err?.status === 402) {
    return /point/i.test(err?.message ?? "")
      ? "INSUFFICIENT_POINTS"
      : "SUBSCRIPTION_REQUIRED";
  }
  return null;
}

export function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}

export function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Whole days left until `iso` (0 if past) */
export function daysLeft(iso?: string | null): number {
  if (!iso) return 0;
  const ms = new Date(iso).getTime() - Date.now();
  return ms > 0 ? Math.ceil(ms / 86_400_000) : 0;
}

/** Subscription page for the account type, optionally with a page to come back to */
export function subscriptionPath(
  mode: AccountMode | undefined,
  returnTo?: string,
): string {
  const base =
    mode === "AGENT" ? "/agent/subscription" : "/huttspotter/subscription";
  return returnTo ? `${base}?return=${encodeURIComponent(returnTo)}` : base;
}

// Where to send people after Paystack (read by /payment/callback)
const RETURN_KEY = "huttspot_payment_return";

export function rememberPaymentReturn(path: string | null) {
  try {
    if (path && path.startsWith("/")) localStorage.setItem(RETURN_KEY, path);
    else localStorage.removeItem(RETURN_KEY);
  } catch {}
}

export function readPaymentReturn(): string | null {
  try {
    const p = localStorage.getItem(RETURN_KEY);
    return p && p.startsWith("/") ? p : null;
  } catch {
    return null;
  }
}

// ── Shared hook: one request, every subscriber kept in sync ─────

type SubState = {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
};

let cache: SubState = { subscription: null, loading: true, error: null };
let inflight: Promise<void> | null = null;
let loadedOnce = false;
const listeners = new Set<(s: SubState) => void>();

function emit(next: Partial<SubState>) {
  cache = { ...cache, ...next };
  listeners.forEach((l) => l(cache));
}

export function refreshSubscription(): Promise<void> {
  if (inflight) return inflight;
  inflight = getMySubscription()
    .then((subscription) => emit({ subscription, loading: false, error: null }))
    .catch((err: any) =>
      emit({ loading: false, error: err?.message ?? "Couldn't load plan" }),
    )
    .finally(() => {
      inflight = null;
      loadedOnce = true;
    });
  return inflight;
}

/** Put a subscription returned by another endpoint (verify, cancel) in the cache */
export function setSubscriptionCache(subscription: Subscription | null) {
  loadedOnce = true;
  emit({ subscription, loading: false, error: null });
}

export function useSubscription() {
  const [state, setState] = useState<SubState>(cache);

  useEffect(() => {
    listeners.add(setState);
    setState(cache);
    if (!loadedOnce && typeof window !== "undefined" && localStorage.getItem("token")) {
      refreshSubscription();
    } else if (!localStorage.getItem("token")) {
      emit({ loading: false });
    }
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const refresh = useCallback(() => refreshSubscription(), []);
  return { ...state, refresh };
}
