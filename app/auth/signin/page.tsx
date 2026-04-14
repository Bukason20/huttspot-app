"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle, XCircle, X } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { loginUser, googleAuth } from "@/lib/auth";
import { OnboardingProvider, useOnboarding } from "@/context/OnboardingContext";
import { jwtDecode } from "jwt-decode";

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

      setTimeout(() => {
        routeAfterLogin(res.user.isOnboarded);
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
      const idToken = credentialResponse.credential!;
      const decoded = jwtDecode<GoogleTokenPayload>(idToken);

      try {
        const res = await googleAuth(idToken);

        if (res.user.isOnboarded) {
          setModalMessage(`Welcome back, ${res.user.name}!`);
          setModal("success");
          setTimeout(() => {
            routeAfterLogin(true, res.user.accountMode);
          }, 1500);
        } else {
          // Has account but not onboarded — go through onboarding
          setFormData({
            username: decoded.name,
            email: decoded.email,
            isGoogleSignup: true,
            idToken,
          });
          router.push("/onboarding");
        }
      } catch {
        // No account — go through signup
        setFormData({
          username: decoded.name,
          email: decoded.email,
          isGoogleSignup: true,
          idToken,
        });
        router.push("/auth/signup");
      }
    } catch (err: any) {
      console.error("Google credential decode failed:", err.message);
      setModalMessage("Google sign-in failed. Please try again.");
      setModal("error");
    }
  };

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-white px-6 pt-12">
      <button onClick={() => router.back()} className="cursor-pointer mb-8">
        ←
      </button>

      <h1 className="text-3xl font-bold text-center mb-10">
        Sign<span className="text-primary">In</span>
      </h1>

      <div className="flex flex-col gap-5">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1a1a1a]">
            E-mail Address
          </label>
          <input
            type="email"
            placeholder="example@gmail.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-gray-200 rounded-full px-5 py-4 text-sm outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1a1a1a]">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-gray-200 rounded-full px-5 py-4 text-sm outline-none placeholder:text-gray-400 pr-12"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <button className="text-sm text-[#1a1a1a] cursor-pointer">
            Forgot Password?
          </button>
        </div>

        {/* Sign in button */}
        <button
          onClick={handleSignIn}
          disabled={!isValid || loading}
          className={`w-full rounded-full py-4 text-[15px] font-semibold mt-2 transition-all duration-200 ${
            isValid && !loading
              ? "bg-secondary text-white cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {/* Google */}
        <div className="flex flex-col items-center gap-4 mt-2">
          <p className="text-sm text-gray-500">Or Continue with</p>
          <div className="w-full [&>div]:w-full [&>div>div]:w-full [&_iframe]:w-full">
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
          <p className="text-sm text-gray-500">
            Don't have an Account?{" "}
            <button
              onClick={() => router.push("/auth/signup")}
              className="text-primary font-bold cursor-pointer"
            >
              Create account
            </button>
          </p>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-[340px] flex flex-col items-center text-center">
            <button
              onClick={() => setModal(null)}
              className="absolute top-4 right-4 cursor-pointer text-gray-400"
            >
              <X size={20} />
            </button>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${modal === "success" ? "bg-secondary/10" : "bg-red-100"}`}
            >
              {modal === "success" ? (
                <CheckCircle size={32} className="text-secondary" />
              ) : (
                <XCircle size={32} className="text-red-500" />
              )}
            </div>
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">
              {modal === "success" ? "Login Successful!" : "Login Failed"}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {modalMessage}
            </p>
            <button
              onClick={() => setModal(null)}
              className="w-full bg-secondary text-white rounded-full py-3 text-sm font-semibold cursor-pointer"
            >
              {modal === "success" ? "Continue" : "Try again"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignInPage() {
  return (
    <OnboardingProvider>
      <SignInContent />
    </OnboardingProvider>
  );
}
