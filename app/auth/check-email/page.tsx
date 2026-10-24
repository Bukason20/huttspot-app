"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { logo } from "@/assets";

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
    <div className="flex min-h-screen flex-col bg-[#fafaf8] font-nunito text-[#1a1a1a]">
      <header className="flex justify-center px-6 py-6 sm:justify-start sm:px-10">
        <a href="/" aria-label="HuttSpot home">
          <img src={logo} alt="HuttSpot" className="h-7 w-auto sm:h-8" />
        </a>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 pb-16">
      <div className="flex w-full max-w-[440px] flex-col items-center rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center sm:px-10 sm:py-12">
      <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
        <Mail size={32} className="text-secondary" />
      </div>

      <h1 className="font-poppins text-2xl font-semibold text-[#1a1a1a] mb-3">
        Check your email
      </h1>
      <p className="text-gray-500 text-sm leading-relaxed mb-2">
        We sent a verification link to
      </p>
      <p className="text-secondary font-semibold text-sm mb-6">
        {email || "your email address"}
      </p>
      <p className="text-gray-500 text-sm leading-relaxed">
        Click the link in the email to verify your account and get started.
      </p>

      <div className="w-full h-px bg-gray-100 my-7" />

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
      </main>
    </div>
  );
}
