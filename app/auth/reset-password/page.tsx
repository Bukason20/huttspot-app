"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  CheckCircle,
  CircleAlert,
  Eye,
  EyeOff,
  Link2Off,
  LockKeyhole,
} from "lucide-react";
import { clearSession, MIN_PASSWORD_LENGTH, resetPassword } from "@/lib/auth";
import AuthShell, {
  authInputClass,
  authLabelClass,
} from "@/components/ui/AuthShell";
import { authImg1 } from "@/assets";

// Keeps the token across a refresh without leaving it in the address bar
const TOKEN_KEY = "huttspot_reset_token";

type Stage = "checking" | "form" | "success" | "invalid";

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

/** 0–4, only used for the strength bar (the backend just needs 6+) */
function strength(pw: string) {
  if (pw.length < MIN_PASSWORD_LENGTH) return pw ? 1 : 0;
  let score = 1;
  if (pw.length >= 10) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  else if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score += 0.5;
  return Math.min(4, Math.floor(score));
}

const STRENGTH = [
  { label: "", bar: "bg-gray-200", text: "text-gray-400" },
  { label: "Too short", bar: "bg-red-500", text: "text-red-500" },
  { label: "Okay", bar: "bg-primary", text: "text-primary" },
  { label: "Good", bar: "bg-secondary", text: "text-secondary" },
  { label: "Strong", bar: "bg-secondary", text: "text-secondary" },
];

function PasswordInput({
  id,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  invalid,
  describedBy,
  autoFocus,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
  invalid?: boolean;
  describedBy?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="relative">
      <LockKeyhole
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        id={id}
        type={show ? "text" : "password"}
        autoComplete="new-password"
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={`${authInputClass} pl-11 pr-12 ${
          invalid ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""
        }`}
      />
      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        onClick={onToggle}
        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [token, setToken] = useState("");
  const [stage, setStage] = useState<Stage>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Read the token once, then take it out of the URL
  useEffect(() => {
    const fromUrl = params.get("token");
    let found = fromUrl ?? "";
    try {
      if (fromUrl) sessionStorage.setItem(TOKEN_KEY, fromUrl);
      else found = sessionStorage.getItem(TOKEN_KEY) ?? "";
    } catch {}
    if (fromUrl) router.replace("/auth/reset-password");
    setToken(found);
    setStage(found ? "form" : "invalid");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const score = useMemo(() => strength(password), [password]);
  const longEnough = password.length >= MIN_PASSWORD_LENGTH;
  const matches = confirm.length > 0 && confirm === password;
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = longEnough && matches && !loading;

  const checks = [
    { ok: longEnough, label: `At least ${MIN_PASSWORD_LENGTH} characters` },
    { ok: /\d/.test(password), label: "A number (recommended)" },
    {
      ok: /[a-z]/.test(password) && /[A-Z]/.test(password),
      label: "Upper and lower case (recommended)",
    },
  ];

  const forgetToken = () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {}
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      await resetPassword(token, password);
      forgetToken();
      setStage("success");
    } catch (err: any) {
      const message: string = err?.message ?? "";
      // Bad / expired token or no matching user → the link is dead
      if (err?.status === 404 || (err?.status === 400 && /token/i.test(message))) {
        forgetToken();
        setStage("invalid");
      } else {
        setError(message || "We couldn't update your password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const goToSignIn = () => {
    // Any session on this browser used the old password
    clearSession();
    router.push("/auth/signin");
  };

  const copy = {
    checking: { title: <>Set a new password</>, subtitle: undefined },
    form: {
      title: (
        <>
          Set a new <span className="text-primary">password</span>
        </>
      ),
      subtitle: "Choose something you haven't used before on HuttSpot.",
    },
    success: { title: <>Password updated</>, subtitle: undefined },
    invalid: { title: <>This link has expired</>, subtitle: undefined },
  }[stage];

  return (
    <AuthShell
      title={copy.title}
      subtitle={copy.subtitle}
      image={authImg1}
      tone="secondary"
      panelHeading="A fresh password, a fresh start."
      panelText="Once it's set, sign in and carry on finding your next spot."
    >
      {stage === "checking" && (
        <div className="flex justify-center py-10 text-secondary">
          <Spinner />
        </div>
      )}

      {stage === "form" && (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col gap-5"
        >
          {/* New password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className={authLabelClass}>
              New password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(v) => {
                setPassword(v);
                setError("");
              }}
              show={showPassword}
              onToggle={() => setShowPassword((s) => !s)}
              placeholder="••••••••••"
              describedBy="password-rules"
              autoFocus
            />

            {/* Strength */}
            <div className="mt-1 flex items-center gap-3" aria-live="polite">
              <div className="flex flex-1 gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      score >= i ? STRENGTH[score].bar : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span
                className={`w-16 text-right text-xs font-bold ${STRENGTH[score].text}`}
              >
                {STRENGTH[score].label}
              </span>
            </div>

            <ul id="password-rules" className="mt-1 flex flex-col gap-1.5">
              {checks.map(({ ok, label }) => (
                <li
                  key={label}
                  className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
                    ok ? "text-secondary" : "text-gray-400"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full ${
                      ok ? "bg-secondary text-white" : "border border-gray-300"
                    }`}
                  >
                    {ok && <Check size={10} strokeWidth={3.5} />}
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Confirm */}
          <div className="flex flex-col gap-2">
            <label htmlFor="confirm" className={authLabelClass}>
              Confirm new password
            </label>
            <PasswordInput
              id="confirm"
              value={confirm}
              onChange={(v) => {
                setConfirm(v);
                setError("");
              }}
              show={showConfirm}
              onToggle={() => setShowConfirm((s) => !s)}
              placeholder="Type it again"
              invalid={mismatch}
              describedBy="confirm-status"
            />
            <p id="confirm-status" aria-live="polite" className="min-h-4 text-xs font-semibold">
              {mismatch && <span className="text-red-500">Passwords don&apos;t match yet.</span>}
              {matches && longEnough && (
                <span className="flex items-center gap-1 text-secondary">
                  <Check size={13} strokeWidth={3} /> Passwords match
                </span>
              )}
            </p>
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
            disabled={!canSubmit}
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-colors duration-200 ${
              canSubmit
                ? "cursor-pointer bg-secondary text-white hover:bg-[#08744a]"
                : "cursor-not-allowed bg-gray-100 text-gray-400"
            }`}
          >
            {loading && <Spinner />}
            {loading ? "Updating password..." : "Update password"}
          </button>
        </form>
      )}

      {stage === "success" && (
        <div className="flex flex-col">
          <div className="flex items-center gap-4 rounded-2xl border border-secondary/20 bg-secondary/5 p-4">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
              <CheckCircle size={22} className="text-white" />
            </span>
            <p className="text-sm leading-relaxed text-gray-600">
              Your password has been changed. Use your new password the next
              time you sign in.
            </p>
          </div>
          <button
            onClick={goToSignIn}
            className="mt-7 h-12 w-full cursor-pointer rounded-full bg-secondary text-[15px] font-semibold text-white transition-colors hover:bg-[#08744a]"
          >
            Sign in
          </button>
        </div>
      )}

      {stage === "invalid" && (
        <div className="flex flex-col">
          <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Link2Off size={22} className="text-primary" />
            </span>
            <p className="text-sm leading-relaxed text-gray-600">
              Reset links only work for a short time and only once. This one
              has expired, been used already, or is incomplete.
            </p>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-gray-500">
            Request a new link and use the most recent email we send you.
          </p>
          <button
            onClick={() => router.push("/auth/forgot-password")}
            className="mt-7 h-12 w-full cursor-pointer rounded-full bg-secondary text-[15px] font-semibold text-white transition-colors hover:bg-[#08744a]"
          >
            Request a new link
          </button>
          <button
            onClick={goToSignIn}
            className="mt-3 h-12 w-full cursor-pointer rounded-full border border-gray-200 bg-white text-[15px] font-semibold text-[#1a1a1a] transition-colors hover:bg-gray-50"
          >
            Back to sign in
          </button>
        </div>
      )}
    </AuthShell>
  );
}

// useSearchParams needs a Suspense boundary in the App Router
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
