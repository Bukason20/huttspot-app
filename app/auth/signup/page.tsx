"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { registerUser, googleAuth } from "@/lib/auth";
import { useOnboarding } from "@/context/OnboardingContext";

interface GoogleTokenPayload {
  name: string;
  email: string;
  sub: string;
  picture?: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const { setFormData } = useOnboarding();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.password.length >= 6 &&
    form.password === form.confirmPassword;

  const handleSignUp = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError("");

    try {
      // Register — only name, email, password
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      // Store name + email in context for onboarding
      setFormData({
        username: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        isGoogleSignup: false,
      });

      // Show verify email screen
      localStorage.setItem("pending_verify_email", form.email.trim());
      router.push("/auth/check-email");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    try {
      const idToken = credentialResponse.credential!;
      const decoded = jwtDecode<GoogleTokenPayload>(idToken);

      try {
        const res = await googleAuth(idToken);

        if (res.user.isOnboarded) {
          // Fully onboarded — go to dashboard
          router.push(
            res.user.accountMode === "AGENT"
              ? "/agent/dashboard"
              : "/huttspotter/dashboard",
          );
        } else {
          // Not onboarded — store info and go to onboarding
          setFormData({
            username: decoded.name,
            email: decoded.email,
            isGoogleSignup: true,
            idToken,
          });
          router.push("/onboarding/account-mode");
        }
      } catch {
        // Backend error — treat as new, go through onboarding
        setFormData({
          username: decoded.name,
          email: decoded.email,
          isGoogleSignup: true,
          idToken,
        });
        router.push("/onboarding/account-mode");
      }
    } catch (err: any) {
      console.error("Google credential decode failed:", err.message);
    }
  };

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-white px-6 pt-12">
      <button onClick={() => router.back()} className="cursor-pointer mb-8">
        ←
      </button>

      <h1 className="text-3xl font-bold text-center mb-10">
        Sign<span className="text-primary">Up</span>
      </h1>

      <div className="flex flex-col gap-5">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1a1a1a]">
            Full Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-gray-200 rounded-full px-5 py-4 text-sm outline-none placeholder:text-gray-400"
          />
        </div>

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

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1a1a1a]">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••••"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              className="w-full bg-gray-200 rounded-full px-5 py-4 text-sm outline-none placeholder:text-gray-400 pr-12"
            />
            <button
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

        <button
          onClick={handleSignUp}
          disabled={!isValid || loading}
          className={`w-full rounded-full py-4 text-[15px] font-semibold mt-2 transition-all duration-200 ${
            isValid && !loading
              ? "bg-secondary text-white cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <div className="flex flex-col items-center gap-4 mt-2">
          <p className="text-sm text-gray-500">Or Continue with</p>
          <div className="w-full [&>div]:w-full [&>div>div]:w-full [&_iframe]:w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.error("Google login failed")}
              useOneTap={false}
              theme="outline"
              size="large"
              text="signup_with"
              shape="pill"
              width="350"
            />
          </div>
          <p className="text-sm text-gray-500">
            Already have an Account?{" "}
            <button
              onClick={() => router.push("/auth/signin")}
              className="text-primary font-bold cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
