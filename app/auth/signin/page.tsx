"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle, XCircle, X } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { loginUser, googleAuth } from "@/lib/auth";
import { getUserProfile } from "@/lib/user";
import { OnboardingProvider, useOnboarding } from "@/context/OnboardingContext";
import { jwtDecode } from "jwt-decode";
import AuthShell, {
  authInputClass,
  authLabelClass,
} from "@/components/ui/AuthShell";
import { authImg3 } from "@/assets";

interface GoogleTokenPayload {
  name: string;
  email: string;
  sub: string;
  picture?: string;
}

type ModalType = "success" | "error" | null;

function SignInContent() {
  const router = useRouter();
  const { setFormData } = useOnboarding();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [modalMessage, setModalMessage] = useState("");

  const isValid = form.email.trim() !== "" && form.password.length >= 6;

  // ── Route after successful auth ─────────────────────────────
  const routeAfterLogin = (isOnboarded: boolean, accountMode?: string) => {
    if (!isOnboarded) {
      router.push("/onboarding");
      return;
    }
    router.push(
      accountMode === "AGENT" ? "/agent/dashboard" : "/huttspotter/dashboard",
    );
  };

  // ── Email login ─────────────────────────────────────────────
  const handleSignIn = async () => {
    if (!isValid || loading) return;
    setLoading(true);

    try {
      const res = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      setModalMessage(`Welcome back, ${res.user.name}!`);
      setModal("success");

      setTimeout(async () => {
        if (!res.user.isOnboarded) {
          router.push("/onboarding");
        } else {
          // Fetch profile to get accountMode for routing
          try {
            const profile = await getUserProfile();
            routeAfterLogin(true, profile.accountMode);
          } catch {
            // Fallback if profile fetch fails
            router.push("/");
          }
        }
      }, 1500);
    } catch (err: any) {
      setModalMessage(err.message || "Login failed. Please try again.");
      setModal("error");
    } finally {
      setLoading(false);
    }
  };

  // ── Google login ────────────────────────────────────────────
  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    try {
      if (!credentialResponse.credential) {
        console.error("❌ No Google credential received");
        setModalMessage("Google sign-in failed. Please try again.");
        setModal("error");
        return;
      }

      const idToken = credentialResponse.credential;
      const decoded = jwtDecode<GoogleTokenPayload>(idToken);

      try {
        const res = await googleAuth(idToken);

        if (res.user.isOnboarded) {
          setModalMessage(`Welcome back, ${res.user.name}!`);
          setModal("success");

          setTimeout(async () => {
            try {
              const profile = await getUserProfile();

              console.log("GOOGLE LOGIN PROFILE:", profile);

              routeAfterLogin(profile.isOnboarded, profile.accountMode);
            } catch (err) {
              console.error("Failed to fetch profile after Google login:", err);

              routeAfterLogin(true, res.user.accountMode);
            }
          }, 1500);
        } else {
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
        setModalMessage("Google sign-in failed. Please try again.");
        setModal("error");
      }
    } catch (err: any) {
      console.error("❌ Google credential decode failed:", err.message);
      setModalMessage("Google sign-in failed. Please try again.");
      setModal("error");
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
      <div className="flex flex-col gap-5">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className={authLabelClass}>
            E-mail Address
          </label>
          <input
            id="email"
            type="email"
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
            <button className="cursor-pointer text-sm font-semibold text-secondary hover:underline">
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
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

        {/* Sign in button */}
        <button
          onClick={handleSignIn}
          disabled={!isValid || loading}
          className={`mt-2 h-12 w-full rounded-full text-[15px] font-semibold transition-colors duration-200 ${
            isValid && !loading
              ? "cursor-pointer bg-secondary text-white hover:bg-[#08744a]"
              : "cursor-not-allowed bg-gray-100 text-gray-400"
          }`}
        >
          {loading ? "Signing in..." : "Sign in"}
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
            onClick={() => router.push("/auth/signup")}
            className="cursor-pointer font-bold text-primary hover:underline"
          >
            Create account
          </button>
        </p>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="relative flex w-full max-w-[380px] flex-col items-center rounded-3xl bg-white p-8 text-center">
            <button
              onClick={() => setModal(null)}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
            <div
              className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full ${
                modal === "success" ? "bg-secondary/10" : "bg-red-50"
              }`}
            >
              {modal === "success" ? (
                <CheckCircle size={30} className="text-secondary" />
              ) : (
                <XCircle size={30} className="text-red-500" />
              )}
            </div>
            <h2 className="mb-2 font-poppins text-xl font-semibold text-[#1a1a1a]">
              {modal === "success" ? "Login Successful!" : "Login Failed"}
            </h2>
            <p className="mb-7 text-sm leading-relaxed text-gray-500">
              {modalMessage}
            </p>
            <button
              onClick={() => setModal(null)}
              className="h-12 w-full cursor-pointer rounded-full bg-secondary text-sm font-semibold text-white transition-colors hover:bg-[#08744a]"
            >
              {modal === "success" ? "Continue" : "Try again"}
            </button>
          </div>
        </div>
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
