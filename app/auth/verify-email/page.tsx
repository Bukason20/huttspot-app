"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { verifyEmail } from "@/lib/auth"; // ← clean import
import { logo } from "@/assets";

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
    <div className="flex min-h-screen flex-col bg-[#fafaf8] font-nunito text-[#1a1a1a]">
      <header className="flex justify-center px-6 py-6 sm:justify-start sm:px-10">
        <a href="/" aria-label="HuttSpot home">
          <img src={logo} alt="HuttSpot" className="h-7 w-auto sm:h-8" />
        </a>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 pb-16">
      <div className="flex w-full max-w-[440px] flex-col items-center rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center sm:px-10 sm:py-12">
      {status === "loading" && (
        <>
          <Loader size={48} className="text-secondary animate-spin mb-6" />
          <h1 className="font-poppins text-2xl font-semibold text-[#1a1a1a] mb-2">
            Verifying your email...
          </h1>
          <p className="text-gray-400 text-sm">Please wait a moment.</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
            <CheckCircle size={36} className="text-secondary" />
          </div>
          <h1 className="font-poppins text-2xl font-semibold text-[#1a1a1a] mb-3">
            Email Verified!
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Your account has been verified. You can now sign in.
          </p>
          <button
            onClick={() => router.push("/auth/signin")}
            className="w-full bg-secondary hover:bg-[#08744a] text-white rounded-full h-12 text-[15px] font-semibold cursor-pointer transition-colors"
          >
            Go to Sign in
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <XCircle size={36} className="text-red-500" />
          </div>
          <h1 className="font-poppins text-2xl font-semibold text-[#1a1a1a] mb-3">
            Verification Failed
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            {message}
          </p>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => router.push("/auth/signup")}
              className="w-full bg-secondary hover:bg-[#08744a] text-white rounded-full h-12 text-[15px] font-semibold cursor-pointer transition-colors"
            >
              Sign up again
            </button>
            <button
              onClick={() => router.push("/auth/check-email")}
              className="w-full border border-gray-300 text-[#1a1a1a] hover:bg-gray-50 rounded-full h-12 text-[15px] font-semibold cursor-pointer transition-colors"
            >
              Resend verification email
            </button>
          </div>
        </>
      )}
      </div>
      </main>
    </div>
  );
}
