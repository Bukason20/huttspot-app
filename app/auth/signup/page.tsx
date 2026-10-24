"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { registerUser, googleAuth } from "@/lib/auth";
import { useOnboarding } from "@/context/OnboardingContext";
import AuthShell, {
  authInputClass,
  authLabelClass,
} from "@/components/ui/AuthShell";
import { authImg2 } from "@/assets";

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
      if (!credentialResponse.credential) {
        console.error("❌ No Google credential received");
        setError("Google sign-up failed. Please try again.");
        return;
      }

      const idToken = credentialResponse.credential;
      const decoded = jwtDecode<GoogleTokenPayload>(idToken);

      try {
        const res = await googleAuth(idToken);

        if (res.user.isOnboarded) {
          router.push(
            res.user.accountMode === "AGENT"
              ? "/agent/dashboard"
              : "/huttspotter/dashboard",
          );
        } else {
          setFormData({
            username: decoded.name,
            email: decoded.email,
            isGoogleSignup: true,
            idToken,
          });
          router.push("/onboarding/account-mode");
        }
      } catch (err: any) {
        console.error("❌ Google signup backend error:", err);

        // TEMP: show error instead of silently redirecting
        setError("Google sign-up failed. Please try again.");
      }
    } catch (err: any) {
      console.error("❌ Google credential decode failed:", err.message);
      setError("Google sign-up failed. Please try again.");
    }
  };

  return (
    <AuthShell
      title={
        <>
          Create your <span className="text-primary">account</span>
        </>
      }
      subtitle="Join HuttSpot to find homes, shops and roommates in PH."
      image={authImg2}
      tone="primary"
      panelHeading="Moving to PH? Start your search here."
      panelText="Corpers, students, families and small businesses — connect with trusted agents and real people."
    >
      <div className="flex flex-col gap-5">
        {/* Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className={authLabelClass}>
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={authInputClass}
          />
        </div>

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

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
          {/* Password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className={authLabelClass}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
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

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className={authLabelClass}>
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className={`${authInputClass} pr-12`}
              />
              <button
                type="button"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
        <p className="-mt-2 text-xs text-gray-500">
          Use at least 6 characters.
        </p>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          onClick={handleSignUp}
          disabled={!isValid || loading}
          className={`h-12 w-full rounded-full text-[15px] font-semibold transition-colors duration-200 ${
            isValid && !loading
              ? "cursor-pointer bg-secondary text-white hover:bg-[#08744a]"
              : "cursor-not-allowed bg-gray-100 text-gray-400"
          }`}
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-gray-200" />
          <p className="text-sm text-gray-500">Or continue with</p>
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="flex w-full justify-center [&>div]:w-full [&>div>div]:w-full [&_iframe]:mx-auto">
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

        <p className="mt-2 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/auth/signin")}
            className="cursor-pointer font-bold text-primary hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </AuthShell>
  );
}
