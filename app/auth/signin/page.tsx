"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import {
  loginUser,
  googleAuth,
  resendVerification,
  isEmailNotVerifiedError,
} from "@/lib/auth";
import { getUserProfile } from "@/lib/user";
import { OnboardingProvider, useOnboarding } from "@/context/OnboardingContext";
import { jwtDecode } from "jwt-decode";
import AuthShell, {
  authInputClass,
  authLabelClass,
} from "@/components/ui/AuthShell";
import { authImg3 } from "@/assets";
import { useScreenLoader } from "@/components/ui/ScreenLoader";
import AuthModal from "@/components/ui/AuthModal";

interface GoogleTokenPayload {
  name: string;
  email: string;
  sub: string;
  picture?: string;
}

type Result =
  | { kind: "success"; name: string; next: string }
  | { kind: "error"; message: string }
  | { kind: "unverified"; email: string }
  | null;

// How long the "Welcome back" message stays before moving on by itself
const SUCCESS_PAUSE_MS = 1600;

const homeFor = (isOnboarded: boolean, accountMode?: string) =>
  !isOnboarded
    ? "/onboarding"
    : accountMode === "AGENT"
      ? "/agent/dashboard"
      : "/huttspotter/dashboard";

function SignInContent() {
  const router = useRouter();
  const { setFormData } = useOnboarding();
  const loader = useScreenLoader();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  // Shown after the screen loader: how it went + what's next
  const [result, setResult] = useState<Result>(null);
  const [resendError, setResendError] = useState("");
  const leaving = useRef(false);

  const isValid = form.email.trim() !== "" && form.password.length >= 6;

  // ── Success: show the message, then open their home ─────────
  const goHome = (next: string) => {
    if (leaving.current) return;
    leaving.current = true;
    setResult(null);
    loader.show(
      next === "/onboarding"
        ? "Setting things up..."
        : "Opening your dashboard...",
    );
    router.push(next);
  };

  const succeed = (name: string, next: string) => {
    loader.hide();
    leaving.current = false;
    setResult({ kind: "success", name, next });
    setTimeout(() => goHome(next), SUCCESS_PAUSE_MS);
  };

  const fail = (message: string) => {
    loader.hide();
    setResult({ kind: "error", message });
  };

  // ── Email login ─────────────────────────────────────────────
  const handleSignIn = async () => {
    if (!isValid || busy) return;
    setBusy(true);
    loader.show("Signing you in...");

    try {
      const res = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      // Work out where they're going while the loader is still up
      let next = homeFor(false);
      if (res.user.isOnboarded) {
        try {
          const profile = await getUserProfile();
          next = homeFor(true, profile.accountMode);
        } catch {
          next = "/"; // profile unavailable → home page
        }
      }
      succeed(res.user.name, next);
    } catch (err: any) {
      // Account exists but email isn't verified → offer a fresh link
      if (isEmailNotVerifiedError(err)) {
        loader.hide();
        setResendError("");
        setResult({
          kind: "unverified",
          email: err?.data?.email ?? form.email.trim(),
        });
        return;
      }
      fail(err.message || "Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // ── Resend verification link, then go to "check your email" ─
  const handleResendVerification = async (email: string) => {
    setResendError("");
    loader.show("Sending verification link...");
    try {
      await resendVerification(email);
      // Same handoff the signup page uses for the check-email screen
      localStorage.setItem("pending_verify_email", email);
      setResult(null);
      router.push("/auth/check-email");
    } catch (err: any) {
      loader.hide();
      setResendError(
        err.message || "We couldn't send the email. Please try again.",
      );
    }
  };

  // ── Google login ────────────────────────────────────────────
  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    loader.show("Signing you in...");
    try {
      if (!credentialResponse.credential) {
        console.error("❌ No Google credential received");
        fail("Google sign-in failed. Please try again.");
        return;
      }

      const idToken = credentialResponse.credential;
      const decoded = jwtDecode<GoogleTokenPayload>(idToken);

      try {
        const res = await googleAuth(idToken);

        if (res.user.isOnboarded) {
          let next = homeFor(true, res.user.accountMode);
          try {
            const profile = await getUserProfile();
            next = homeFor(profile.isOnboarded, profile.accountMode);
          } catch (err) {
            console.error("Failed to fetch profile after Google login:", err);
          }
          succeed(res.user.name, next);
        } else {
          // New Google user → straight into onboarding (loader stays up)
          setFormData({
            username: decoded.name,
            email: decoded.email,
            isGoogleSignup: true,
            idToken,
          });
          router.push("/onboarding");
        }
      } catch (err: any) {
        console.error("❌ Google signin backend error:", err);
        fail("Google sign-in failed. Please try again.");
      }
    } catch (err: any) {
      console.error("❌ Google credential decode failed:", err.message);
      fail("Google sign-in failed. Please try again.");
    }
  };

  return (
    <AuthShell
      title={
        <>
          Welcome <span className="text-primary">back</span>
        </>
      }
      subtitle="Sign in to continue your search on HuttSpot."
      image={authImg3}
      tone="secondary"
      panelHeading="Your next spot is a few taps away."
      panelText="Pick up where you left off — saved listings, chats with agents and more."
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleSignIn();
        }}
        className="flex flex-col gap-5"
      >
        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className={authLabelClass}>
            E-mail Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="example@gmail.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={authInputClass}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className={authLabelClass}>
              Password
            </label>
            <button
              type="button"
              onClick={() =>
                router.push(
                  form.email.trim()
                    ? `/auth/forgot-password?email=${encodeURIComponent(form.email.trim())}`
                    : "/auth/forgot-password",
                )
              }
              className="cursor-pointer text-sm font-semibold text-secondary hover:underline"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`${authInputClass} pr-12`}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Sign in button — progress shows in the screen loader */}
        <button
          type="submit"
          disabled={!isValid || busy}
          className={`mt-2 h-12 w-full rounded-full text-[15px] font-semibold transition-colors duration-200 ${
            isValid
              ? "cursor-pointer bg-secondary text-white hover:bg-[#08744a]"
              : "cursor-not-allowed bg-gray-100 text-gray-400"
          }`}
        >
          Sign in
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-gray-200" />
          <p className="text-sm text-gray-500">Or continue with</p>
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google */}
        <div className="flex w-full justify-center [&>div]:w-full [&>div>div]:w-full [&_iframe]:mx-auto">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.error("Google login failed")}
            useOneTap={false}
            theme="outline"
            size="large"
            text="signin_with"
            shape="pill"
            width="350"
          />
        </div>

        <p className="mt-2 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/signup")}
            className="cursor-pointer font-bold text-primary hover:underline"
          >
            Create account
          </button>
        </p>
      </form>

      {/* Result — shown once the screen loader is done */}
      {result?.kind === "success" && (
        <AuthModal
          tone="success"
          title={`Welcome back, ${result.name.split(" ")[0]}!`}
          primary={{ label: "Continue", onClick: () => goHome(result.next) }}
        >
          {result.next === "/onboarding"
            ? "You're signed in. Let's finish setting up your account."
            : "You're signed in. Taking you to your dashboard."}
        </AuthModal>
      )}

      {result?.kind === "error" && (
        <AuthModal
          tone="error"
          title="Couldn't sign you in"
          primary={{ label: "Try again", onClick: () => setResult(null) }}
          secondary={{
            label: "Forgot password?",
            onClick: () =>
              router.push(
                form.email.trim()
                  ? `/auth/forgot-password?email=${encodeURIComponent(form.email.trim())}`
                  : "/auth/forgot-password",
              ),
          }}
          onClose={() => setResult(null)}
        >
          {result.message}
        </AuthModal>
      )}

      {result?.kind === "unverified" && (
        <AuthModal
          tone="warning"
          title="Verify your email first"
          primary={{
            label: "Send verification link",
            onClick: () => handleResendVerification(result.email),
          }}
          secondary={{ label: "Not now", onClick: () => setResult(null) }}
          onClose={() => setResult(null)}
        >
          <p>
            Your account hasn&apos;t been verified yet. We&apos;ll send a new
            verification link to
          </p>
          <p className="mt-1 break-all font-semibold text-secondary">
            {result.email}
          </p>
          {resendError && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-red-600">
              {resendError}
            </p>
          )}
        </AuthModal>
      )}
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    <OnboardingProvider>
      <SignInContent />
    </OnboardingProvider>
  );
}
