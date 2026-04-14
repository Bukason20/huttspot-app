"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { verifyEmail } from "@/lib/auth"; // ← clean import

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("verify_token="))
          ?.split("=")[1];

        if (!token) {
          setStatus("error");
          setMessage("Verification link is invalid or has expired.");
          return;
        }

        // Clear cookie immediately after reading
        document.cookie = "verify_token=; Max-Age=0; path=/";

        await verifyEmail(token); // ← clean call from lib/auth.ts

        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err.message || "Verification failed. The link may have expired.",
        );
      }
    };

    verify();
  }, []);

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-white px-6 flex flex-col items-center justify-center text-center">
      {status === "loading" && (
        <>
          <Loader size={48} className="text-secondary animate-spin mb-6" />
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">
            Verifying your email...
          </h1>
          <p className="text-gray-400 text-sm">Please wait a moment.</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
            <CheckCircle size={48} className="text-secondary" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-3">
            Email Verified!
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Your account has been verified. You can now sign in.
          </p>
          <button
            onClick={() => router.push("/auth/signin")}
            className="w-full bg-secondary text-white rounded-full py-4 text-[15px] font-semibold cursor-pointer"
          >
            Go to Sign in
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <XCircle size={48} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-3">
            Verification Failed
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            {message}
          </p>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => router.push("/auth/signup")}
              className="w-full bg-secondary text-white rounded-full py-4 text-[15px] font-semibold cursor-pointer"
            >
              Sign up again
            </button>
            <button
              onClick={() => router.push("/auth/check-email")}
              className="w-full border border-gray-200 text-gray-500 rounded-full py-4 text-[15px] font-semibold cursor-pointer"
            >
              Resend verification email
            </button>
          </div>
        </>
      )}
    </div>
  );
}
