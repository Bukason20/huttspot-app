"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  CircleAlert,
  Clock,
  Mail,
  MailWarning,
} from "lucide-react";
import { forgotPassword } from "@/lib/auth";
import AuthShell, {
  authInputClass,
  authLabelClass,
} from "@/components/ui/AuthShell";
import { authImg1 } from "@/assets";

// Seconds to wait between resend requests
const RESEND_COOLDOWN = 60;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Stage = "form" | "sent" | "unverified";

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

function ForgotPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();

  // Pre-filled when coming from the sign-in page
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [touched, setTouched] = useState(false);
  const [stage, setStage] = useState<Stage>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [resent, setResent] = useState(false);

  const trimmed = email.trim();
  const emailValid = EMAIL_RE.test(trimmed);
  const showEmailError = touched && trimmed !== "" && !emailValid;

  // Countdown for "Resend"
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const send = async (isResend = false) => {
    if (!emailValid || loading) return;
    setLoading(true);
    setError("");
    setResent(false);
    try {
      await forgotPassword(trimmed);
      setStage("sent");
      setCooldown(RESEND_COOLDOWN);
      if (isResend) setResent(true);
    } catch (err: any) {
      if (err?.status === 403) {
        // Not verified: the backend has sent a verification link instead
        try {
          localStorage.setItem("pending_verify_email", trimmed);
        } catch {}
        setStage("unverified");
      } else if (err?.status === 429) {
        setError(
          "Too many attempts. Please wait about 15 minutes and try again.",
        );
      } else {
        setError(
          err?.message || "We couldn't send the email. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const changeEmail = () => {
    setStage("form");
    setError("");
    setResent(false);
  };

  const backToSignIn = () => router.push("/auth/signin");

  // ── Shell copy per stage ──────────────────────────────────
  const copy = {
    form: {
      title: (
        <>
          Forgot your <span className="text-primary">password?</span>
        </>
      ),
      subtitle:
        "No worries. Enter the email you signed up with and we'll send you a link to set a new one.",
    },
    sent: { title: <>Check your inbox</>, subtitle: undefined },
    unverified: { title: <>Verify your email first</>, subtitle: undefined },
  }[stage];

  return (
    <AuthShell
      title={copy.title}
      subtitle={copy.subtitle}
      image={authImg1}
      tone="secondary"
      panelHeading="Locked out? You'll be back in a minute."
      panelText="We'll email you a secure link to set a new password. Your saved listings and chats stay just as you left them."
    >
      {stage === "form" && (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            send();
          }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className={authLabelClass}>
              E-mail Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                inputMode="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onBlur={() => setTouched(true)}
                aria-invalid={showEmailError}
                aria-describedby={showEmailError ? "email-error" : undefined}
                className={`${authInputClass} pl-11 ${
                  showEmailError ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""
                }`}
              />
            </div>
            {showEmailError && (
              <p id="email-error" className="text-xs font-semibold text-red-500">
                Enter a valid email address.
              </p>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              <CircleAlert size={16} className="mt-0.5 flex-shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!emailValid || loading}
            className={`mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-colors duration-200 ${
              emailValid && !loading
                ? "cursor-pointer bg-secondary text-white hover:bg-[#08744a]"
                : "cursor-not-allowed bg-gray-100 text-gray-400"
            }`}
          >
            {loading && <Spinner />}
            {loading ? "Sending link..." : "Send reset link"}
          </button>

          <button
            type="button"
            onClick={backToSignIn}
            className="mx-auto flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-[#1a1a1a]"
          >
            <ArrowLeft size={16} /> Back to sign in
          </button>
        </form>
      )}

      {stage === "sent" && (
        <div className="flex flex-col">
          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-[#fafaf8] p-4">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary/10">
              <Mail size={22} className="text-secondary" />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-gray-500">
                If an account uses this email, a reset link is on its way to
              </p>
              <p className="truncate text-sm font-bold text-[#1a1a1a]">
                {trimmed}
              </p>
            </div>
          </div>

          <ol className="mt-6 flex flex-col gap-3 text-sm text-gray-600">
            {[
              "Open the email from HuttSpot.",
              "Tap the reset link. It only works for a short time.",
              "Choose a new password, then sign in.",
            ].map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>

          <p className="mt-6 text-sm leading-relaxed text-gray-500">
            Can&apos;t find it? Check your spam or promotions folder.
          </p>

          {resent && (
            <p
              role="status"
              className="mt-4 flex items-center gap-2 rounded-xl bg-secondary/10 px-4 py-3 text-sm font-semibold text-secondary"
            >
              <CheckCircle size={15} /> We sent another link.
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              <CircleAlert size={16} className="mt-0.5 flex-shrink-0" />
              {error}
            </p>
          )}

          <button
            onClick={backToSignIn}
            className="mt-7 h-12 w-full cursor-pointer rounded-full bg-secondary text-[15px] font-semibold text-white transition-colors hover:bg-[#08744a]"
          >
            Back to sign in
          </button>
          <button
            onClick={() => send(true)}
            disabled={loading || cooldown > 0}
            className="mt-3 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-200 bg-white text-[15px] font-semibold text-[#1a1a1a] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white"
          >
            {loading ? (
              <>
                <Spinner /> Sending...
              </>
            ) : cooldown > 0 ? (
              <>
                <Clock size={16} /> Resend in {cooldown}s
              </>
            ) : (
              "Resend link"
            )}
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Wrong email?{" "}
            <button
              onClick={changeEmail}
              className="cursor-pointer font-bold text-primary hover:underline"
            >
              Use a different one
            </button>
          </p>
        </div>
      )}

      {stage === "unverified" && (
        <div className="flex flex-col">
          <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <MailWarning size={22} className="text-primary" />
            </span>
            <p className="text-sm leading-relaxed text-gray-600">
              <span className="font-bold text-[#1a1a1a]">{trimmed}</span>{" "}
              hasn&apos;t been verified yet, so we sent a new verification
              link instead.
            </p>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-gray-500">
            Verify your email using that link, then sign in. If you still
            can&apos;t remember your password after that, come back here and
            request a reset link.
          </p>
          <button
            onClick={() => router.push("/auth/check-email")}
            className="mt-7 h-12 w-full cursor-pointer rounded-full bg-secondary text-[15px] font-semibold text-white transition-colors hover:bg-[#08744a]"
          >
            Got it
          </button>
          <button
            onClick={changeEmail}
            className="mt-3 h-12 w-full cursor-pointer rounded-full border border-gray-200 bg-white text-[15px] font-semibold text-[#1a1a1a] transition-colors hover:bg-gray-50"
          >
            Use a different email
          </button>
        </div>
      )}
    </AuthShell>
  );
}

// useSearchParams needs a Suspense boundary in the App Router
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
