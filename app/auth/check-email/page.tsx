"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle } from "lucide-react";
import { logo } from "@/assets";
import { resendVerification, clearSession } from "@/lib/auth";

// Seconds to wait between resend requests
const RESEND_COOLDOWN = 60;

export default function CheckEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    try {
      // Set by signup or by the sign-in "verify your email" flow. It is kept
      // (not removed) so a refresh still works, and cleared once verified.
      const storedEmail = localStorage.getItem("pending_verify_email");
      if (storedEmail) {
        setEmail(storedEmail);
        // A link was just sent — don't allow an immediate resend
        setCooldown(RESEND_COOLDOWN);
      }
    } catch {
      setEmail("");
    } finally {
      setReady(true);
    }
  }, []);

  // Countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // We only ever resend to the address this browser signed up / signed in
  // with — never to an address typed in here.
  const handleResend = async () => {
    if (!email || sending || cooldown > 0) return;
    setSending(true);
    setNotice(null);
    try {
      await resendVerification(email);
      setCooldown(RESEND_COOLDOWN);
      setNotice({
        type: "success",
        text: "A new verification link is on its way.",
      });
    } catch (err: any) {
      setNotice({
        type: "error",
        text: err.message || "We couldn't send the email. Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  const goToSignIn = () => {
    // Make sure no other account is signed in on this browser
    clearSession();
    router.push("/auth/signin");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fafaf8] font-nunito text-[#1a1a1a]">
      <header className="flex justify-center px-6 py-6 sm:justify-start sm:px-10">
        <a href="/" aria-label="HuttSpot home">
          <img src={logo} alt="HuttSpot" className="h-7 w-auto sm:h-8" />
        </a>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 pb-16">
        <div className="flex w-full max-w-[440px] flex-col items-center rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center sm:px-10 sm:py-12">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10">
            <Mail size={32} className="text-secondary" />
          </div>

          <h1 className="mb-3 font-poppins text-2xl font-semibold text-[#1a1a1a]">
            Check your email
          </h1>

          {!ready ? null : email ? (
            <>
              <p className="mb-2 text-sm leading-relaxed text-gray-500">
                We sent a verification link to
              </p>
              <p className="mb-6 break-all text-sm font-semibold text-secondary">
                {email}
              </p>
              <p className="text-sm leading-relaxed text-gray-500">
                Click the link in the email to verify your account and get
                started. Check your spam folder if you can&apos;t find it.
              </p>

              {notice && (
                <p
                  className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm ${
                    notice.type === "success"
                      ? "bg-secondary/10 font-semibold text-secondary"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {notice.type === "success" && <CheckCircle size={15} />}
                  {notice.text}
                </p>
              )}

              <div className="my-7 h-px w-full bg-gray-100" />

              <p className="mb-3 text-sm text-gray-500">
                Didn&apos;t receive the email?
              </p>
              <button
                onClick={handleResend}
                disabled={sending || cooldown > 0}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-secondary text-sm font-semibold text-white transition-colors hover:bg-[#08744a] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
              >
                {sending && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {sending
                  ? "Sending..."
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend email"}
              </button>
            </>
          ) : (
            <>
              {/* We don't know which account this is (e.g. opened on a
                  different device). Signing in proves the account is theirs,
                  and the sign-in page then offers a fresh link. */}
              <p className="mb-7 text-sm leading-relaxed text-gray-500">
                Need a new verification link? Sign in with the email and
                password you signed up with and we&apos;ll send one to you.
              </p>
              <button
                onClick={goToSignIn}
                className="h-12 w-full cursor-pointer rounded-full bg-secondary text-sm font-semibold text-white transition-colors hover:bg-[#08744a]"
              >
                Sign in to get a new link
              </button>
            </>
          )}

          <div className="mt-6 flex flex-col gap-2 text-sm text-gray-500">
            {email && (
              <p>
                Already verified?{" "}
                <button
                  onClick={goToSignIn}
                  className="cursor-pointer font-semibold text-primary hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
            <p>
              Wrong email?{" "}
              <button
                onClick={() => router.push("/auth/signup")}
                className="cursor-pointer font-semibold text-primary hover:underline"
              >
                Create a new account
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
