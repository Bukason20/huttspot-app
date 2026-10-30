"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  CircleAlert,
  Copy,
  Clock3,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { logo } from "@/assets";
import {
  VerifyResponse,
  formatDate,
  formatNaira,
  readPaymentReturn,
  rememberPaymentReturn,
  setSubscriptionCache,
  verifyPayment,
} from "@/lib/subscription";

type View =
  | { kind: "checking" }
  | { kind: "pending"; data?: VerifyResponse; timedOut?: boolean }
  | { kind: "success"; data: VerifyResponse }
  | { kind: "failed"; data?: VerifyResponse }
  | { kind: "error"; message: string; signIn?: boolean }
  | { kind: "missing" };

const POLL_MS = 3000;
const MAX_POLLS = 40; // ~2 minutes; bank transfers can take a while

/** Agent plans are STANDARD_10 / PRO_30; huttspotter plans are STANDARD / PRO */
function isAgentAccount(): boolean | null {
  try {
    const saved = localStorage.getItem("accountMode");
    if (saved) return saved.replace(/"/g, "") === "AGENT";
    const user = JSON.parse(localStorage.getItem("user") ?? "null");
    if (user?.accountMode) return user.accountMode === "AGENT";
  } catch {}
  return null;
}

function PaymentCallback() {
  const router = useRouter();
  const params = useSearchParams();
  // Paystack sends both; they carry the same value
  const reference = params.get("reference") || params.get("trxref");

  const [view, setView] = useState<View>(
    reference ? { kind: "checking" } : { kind: "missing" },
  );
  const [copied, setCopied] = useState(false);
  const polls = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const check = useCallback(async () => {
    if (!reference) return;
    if (timer.current) clearTimeout(timer.current);
    try {
      const data = await verifyPayment(reference);
      const status = data.status?.toUpperCase();
      if (status === "SUCCESS") {
        if (data.subscription) setSubscriptionCache(data.subscription);
        setView({ kind: "success", data });
      } else if (status === "PENDING") {
        polls.current += 1;
        if (polls.current >= MAX_POLLS) {
          setView({ kind: "pending", data, timedOut: true });
        } else {
          setView({ kind: "pending", data });
          timer.current = setTimeout(check, POLL_MS);
        }
      } else {
        setView({ kind: "failed", data });
      }
    } catch (err: any) {
      if (err?.status === 401) {
        setView({
          kind: "error",
          signIn: true,
          message:
            "Your session has ended. Sign in again; if the payment went through, your plan will already be on your account.",
        });
      } else if (err?.status === 404 || err?.status === 400) {
        setView({
          kind: "error",
          message:
            "We couldn't find this payment on your account. If you were charged, contact support with the reference below.",
        });
      } else {
        setView({
          kind: "error",
          message: "We couldn't reach the server to confirm your payment.",
        });
      }
    }
  }, [reference]);

  useEffect(() => {
    check();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [check]);

  const retry = () => {
    polls.current = 0;
    setView({ kind: "checking" });
    check();
  };

  // Read browser-only values after mount (avoids a hydration mismatch)
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const [savedAgent, setSavedAgent] = useState<boolean | null>(null);
  useEffect(() => {
    setReturnTo(readPaymentReturn());
    setSavedAgent(isAgentAccount());
  }, []);
  const plan = "data" in view && view.data ? view.data.plan : undefined;
  const agent = savedAgent ?? (!!plan && /_\d+$/.test(plan));
  const subscriptionHref = agent ? "/agent/subscription" : "/huttspotter/subscription";
  const dashboardHref = agent ? "/agent/dashboard" : "/huttspotter/dashboard";

  const go = (href: string) => {
    rememberPaymentReturn(null);
    router.push(href);
  };

  const copyRef = async () => {
    if (!reference) return;
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const ReferenceRow = reference ? (
    <div className="flex items-center justify-between gap-3 py-3 text-sm">
      <dt className="text-gray-500">Reference</dt>
      <dd className="flex min-w-0 items-center gap-2">
        <span className="truncate font-mono text-xs font-semibold">
          {reference}
        </span>
        <button
          onClick={copyRef}
          aria-label="Copy reference"
          className="flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#1a1a1a]"
        >
          {copied ? <Check size={14} className="text-secondary" /> : <Copy size={14} />}
        </button>
      </dd>
    </div>
  ) : null;

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f5] font-nunito text-[#1a1a1a]">
      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <img src={logo} alt="HuttSpot" className="h-7 w-auto sm:h-8" />
        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          <ShieldCheck size={15} className="text-secondary" />
          Secured by Paystack
        </span>
      </header>

      <main className="flex flex-1 items-start justify-center px-5 pb-16 pt-6 sm:items-center sm:pt-0">
        <div className="w-full max-w-[460px] rounded-3xl border border-gray-100 bg-white p-6 sm:p-9">
          {/* Checking / pending */}
          {(view.kind === "checking" || view.kind === "pending") && (
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-20 w-20 items-center justify-center">
                {!(view.kind === "pending" && view.timedOut) && (
                  <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-secondary/15 border-t-secondary" />
                )}
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
                  <Clock3 size={24} className="text-secondary" />
                </span>
              </div>
              <h1 className="mt-6 font-poppins text-2xl font-semibold">
                {view.kind === "pending" && view.timedOut
                  ? "Still processing"
                  : "Confirming your payment"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {view.kind === "pending" && view.timedOut
                  ? "Paystack hasn't confirmed it yet. Bank transfers can take a few minutes. Your plan is added automatically once it clears, so it's safe to leave this page."
                  : view.kind === "pending"
                    ? "Waiting for Paystack. Bank transfers can take up to a minute, so please keep this page open."
                    : "Checking with Paystack. This only takes a moment."}
              </p>

              <ol className="mt-7 w-full space-y-3 text-left text-sm">
                {[
                  { label: "Payment started", done: true },
                  { label: "Confirming with Paystack", done: false, current: true },
                  { label: "Plan added to your account", done: false },
                ].map((s) => (
                  <li key={s.label} className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                        s.done
                          ? "bg-secondary text-white"
                          : s.current
                            ? "border-2 border-secondary"
                            : "border-2 border-gray-200"
                      }`}
                    >
                      {s.done && <Check size={13} strokeWidth={3} />}
                      {s.current && (
                        <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
                      )}
                    </span>
                    <span className={s.done || s.current ? "font-semibold" : "text-gray-400"}>
                      {s.label}
                    </span>
                  </li>
                ))}
              </ol>

              {view.kind === "pending" && view.timedOut && (
                <div className="mt-7 flex w-full flex-col gap-3">
                  <button
                    onClick={retry}
                    className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-secondary text-[15px] font-semibold text-white transition-colors hover:bg-[#08744a]"
                  >
                    <RefreshCw size={16} /> Check again
                  </button>
                  <button
                    onClick={() => go(subscriptionHref)}
                    className="h-12 w-full cursor-pointer rounded-full border border-gray-200 bg-white text-[15px] font-semibold hover:bg-gray-50"
                  >
                    Go to my subscription
                  </button>
                </div>
              )}
              {reference && <dl className="mt-6 w-full border-t border-gray-100">{ReferenceRow}</dl>}
            </div>
          )}

          {/* Success */}
          {view.kind === "success" && (
            <div className="flex flex-col items-center text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                  <Check size={28} strokeWidth={3} className="text-white" />
                </span>
              </span>
              <h1 className="mt-6 font-poppins text-2xl font-semibold">
                Payment successful
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {view.data.points > 0 ? (
                  <>
                    <span className="font-bold text-secondary">
                      +{view.data.points} points
                    </span>{" "}
                    added. You can contact agents right away.
                  </>
                ) : (
                  <>Your {view.data.subscription?.planName ?? "new"} plan is now active.</>
                )}
              </p>

              <dl className="mt-7 w-full divide-y divide-gray-100 border-y border-gray-100 text-left">
                <div className="flex items-center justify-between gap-3 py-3 text-sm">
                  <dt className="text-gray-500">Plan</dt>
                  <dd className="font-bold">
                    {view.data.subscription?.planName || view.data.plan}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-3 text-sm">
                  <dt className="text-gray-500">Amount paid</dt>
                  <dd className="font-bold">{formatNaira(view.data.amountNaira)}</dd>
                </div>
                {view.data.subscription && view.data.points > 0 && (
                  <div className="flex items-center justify-between gap-3 py-3 text-sm">
                    <dt className="text-gray-500">Points balance</dt>
                    <dd className="font-bold">{view.data.subscription.points}</dd>
                  </div>
                )}
                {view.data.subscription?.expiresAt && (
                  <div className="flex items-center justify-between gap-3 py-3 text-sm">
                    <dt className="text-gray-500">Valid until</dt>
                    <dd className="font-bold">
                      {formatDate(view.data.subscription.expiresAt)}
                    </dd>
                  </div>
                )}
                {ReferenceRow}
              </dl>

              <div className="mt-7 flex w-full flex-col gap-3">
                <button
                  onClick={() => go(returnTo ?? dashboardHref)}
                  className="group flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-secondary text-[15px] font-semibold text-white transition-colors hover:bg-[#08744a]"
                >
                  {returnTo ? "Continue where you left off" : "Go to dashboard"}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={() => go(subscriptionHref)}
                  className="h-12 w-full cursor-pointer rounded-full border border-gray-200 bg-white text-[15px] font-semibold hover:bg-gray-50"
                >
                  View my subscription
                </button>
              </div>
            </div>
          )}

          {/* Failed */}
          {view.kind === "failed" && (
            <div className="flex flex-col items-center text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500">
                  <X size={28} strokeWidth={3} className="text-white" />
                </span>
              </span>
              <h1 className="mt-6 font-poppins text-2xl font-semibold">
                Payment not completed
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {view.data?.status?.toUpperCase() === "ABANDONED"
                  ? "The checkout was closed before paying. You haven't been charged."
                  : "Paystack declined this payment, so nothing was added to your account. You can try again with another card or bank transfer."}
              </p>
              {reference && (
                <dl className="mt-6 w-full border-y border-gray-100 text-left">
                  {ReferenceRow}
                </dl>
              )}
              <div className="mt-7 flex w-full flex-col gap-3">
                <button
                  onClick={() => router.push(subscriptionHref)}
                  className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-secondary text-[15px] font-semibold text-white transition-colors hover:bg-[#08744a]"
                >
                  <RefreshCw size={16} /> Try again
                </button>
                <button
                  onClick={() => go(returnTo ?? dashboardHref)}
                  className="h-12 w-full cursor-pointer rounded-full border border-gray-200 bg-white text-[15px] font-semibold hover:bg-gray-50"
                >
                  {returnTo ? "Back to where I was" : "Back to dashboard"}
                </button>
              </div>
            </div>
          )}

          {/* Error / missing */}
          {(view.kind === "error" || view.kind === "missing") && (
            <div className="flex flex-col items-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CircleAlert size={28} className="text-primary" />
              </span>
              <h1 className="mt-6 font-poppins text-2xl font-semibold">
                {view.kind === "missing"
                  ? "No payment to check"
                  : view.signIn
                    ? "Please sign in again"
                    : "We couldn't confirm it yet"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {view.kind === "missing"
                  ? "This page opens after a Paystack checkout. Head to your subscription to buy or check a plan."
                  : view.message}
              </p>
              {reference && (
                <dl className="mt-6 w-full border-y border-gray-100 text-left">
                  {ReferenceRow}
                </dl>
              )}
              <div className="mt-7 flex w-full flex-col gap-3">
                {view.kind === "error" && !view.signIn && (
                  <button
                    onClick={retry}
                    className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-secondary text-[15px] font-semibold text-white transition-colors hover:bg-[#08744a]"
                  >
                    <RefreshCw size={16} /> Try again
                  </button>
                )}
                <button
                  onClick={() =>
                    router.push(
                      view.kind === "error" && view.signIn
                        ? "/auth/signin"
                        : subscriptionHref,
                    )
                  }
                  className={`h-12 w-full cursor-pointer rounded-full text-[15px] font-semibold ${
                    view.kind === "error" && !view.signIn
                      ? "border border-gray-200 bg-white hover:bg-gray-50"
                      : "bg-secondary text-white hover:bg-[#08744a]"
                  }`}
                >
                  {view.kind === "error" && view.signIn
                    ? "Sign in"
                    : "Go to my subscription"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// useSearchParams needs a Suspense boundary in the App Router
export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[#f7f7f5]" />}
    >
      <PaymentCallback />
    </Suspense>
  );
}
