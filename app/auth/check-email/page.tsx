"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";

export default function CheckEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    try {
      const storedEmail = localStorage.getItem("pending_verify_email");
      if (storedEmail) {
        setEmail(storedEmail);
        localStorage.removeItem("pending_verify_email");
      }
    } catch {
      setEmail("");
    }
  }, []);

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-white px-6 flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
        <Mail size={40} className="text-secondary" />
      </div>

      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-3">
        Check your email
      </h1>
      <p className="text-gray-400 text-sm leading-relaxed mb-2">
        We sent a verification link to
      </p>
      <p className="text-secondary font-semibold text-sm mb-6">
        {email || "your email address"}
      </p>
      <p className="text-gray-400 text-sm leading-relaxed">
        Click the link in the email to verify your account and get started.
      </p>

      <div className="w-full h-px bg-gray-100 my-8" />

      <p className="text-sm text-gray-400">
        Didn't receive the email?{" "}
        <button
          onClick={() => router.push("/auth/signup")}
          className="text-primary font-semibold cursor-pointer"
        >
          Try again
        </button>
      </p>
    </div>
  );
}
