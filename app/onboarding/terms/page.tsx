"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/context/OnboardingContext";
import { updateUserProfile } from "@/lib/onboarding";
import { getUserProfile } from "@/lib/user";
import { uploadProfilePhoto } from "@/lib/user";
import { X, AlertCircle } from "lucide-react";

const termsList = [
  {
    number: 1,
    title: "Accurate Listings",
    description:
      "Agents must provide truthful and accurate property information. False or misleading listings are strictly prohibited. Accounts found guilty of this will be taken down.",
  },
  {
    number: 2,
    title: "Professional Conduct",
    description:
      "All users must communicate respectfully. Harassment, abuse, or discrimination will not be tolerated.",
  },
  {
    number: 3,
    title: "Good Faith Use",
    description:
      "Users must act honestly when interacting, scheduling viewings, or discussing property deals.",
  },
  {
    number: 4,
    title: "Enforcement",
    description:
      "HuttSpot reserves the right to suspend or permanently remove any account that violates these rules to maintain a safe and trusted platform.",
  },
];

export default function OnboardingTermsPage() {
  const router = useRouter();
  const { formData, reset } = useOnboarding();

  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(
    "Saving your details...",
  );
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const canProceed = agreedTerms && agreedPrivacy;

  const handleAccept = async () => {
    if (!canProceed || loading) return;
    setLoading(true);

    try {
      // Step 1 — Upload face photo if captured
      let profilePhotoUrl: string | undefined;
      if (formData.capturedFaceImage) {
        setLoadingMessage("Uploading your photo...");
        profilePhotoUrl = await uploadProfilePhoto(formData.capturedFaceImage);
      }

      console.log(formData);
      // Step 2 — Update user profile with all onboarding data
      setLoadingMessage("Saving your details...");
      await updateUserProfile({
        gender: formData.gender!,
        phoneNumber: `${formData.countryCode}${formData.phoneNumber}`,
        accountMode: formData.accountMode!,
        howYouFoundUs: formData.howYouFoundUs!,
        isOnboarded: true,

        // 🔥 TEMP TEST: force agent profile
        ...(formData.accountMode === "AGENT" && {
          agentProfile: {
            agencyName: "Test Agency",
            operatingAreas: ["Lagos"],
          },
        }),

        ...(formData.accountMode === "HUTTSPOTTER" && {
          intent: formData.intent,
        }),

        ...(profilePhotoUrl && { profilePhoto: profilePhotoUrl }),
      });

      // Step 3 — Fetch full profile to get accountMode for routing
      setLoadingMessage("Setting up your account...");
      const profile = await getUserProfile();

      console.log("AFTER UPDATE:", profile);

      // Step 4 — Clear onboarding data
      reset();

      // Step 5 — Route based on accountMode from profile
      router.push(
        profile.accountMode === "AGENT"
          ? "/agent/dashboard"
          : "/huttspotter/dashboard",
      );
    } catch (err: any) {
      console.log(formData.capturedFaceImage);
      console.log(formData);
      setErrorModal(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMessage("Saving your details...");
    }
  };

  const checkboxes = [
    {
      state: agreedTerms,
      set: setAgreedTerms,
      label: "I have read and agree to the Terms of Service",
    },
    {
      state: agreedPrivacy,
      set: setAgreedPrivacy,
      label: "I agree to the Privacy Policy",
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="font-poppins text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">
        Terms of Service
      </h1>
      <p className="mt-2 mb-6 text-gray-500">
        Please read and accept these to finish setting up your account.
      </p>

      {/* Terms card */}
      <div className="rounded-3xl border border-gray-100 bg-[#fafaf8] p-5 sm:p-6">
        <ol className="flex flex-col gap-5">
          {termsList.map((term) => (
            <li key={term.number} className="flex gap-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white font-poppins text-sm font-semibold text-secondary shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                {term.number}
              </span>
              <div>
                <p className="font-bold text-[#1a1a1a]">{term.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  {term.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Checkboxes */}
      <div className="mt-5 flex flex-col gap-3">
        {checkboxes.map(({ state, set, label }) => (
          <button
            key={label}
            onClick={() => set(!state)}
            role="checkbox"
            aria-checked={state}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 ${
              state
                ? "border-secondary bg-secondary/5"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                state
                  ? "border-secondary bg-secondary"
                  : "border-gray-300 bg-white"
              }`}
            >
              {state && (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm font-semibold text-[#1a1a1a]">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Accept button */}
      <div className="mt-auto pb-8 pt-8 md:mt-8 md:pb-0">
        <button
          onClick={handleAccept}
          disabled={!canProceed || loading}
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-colors duration-200 ${
            canProceed && !loading
              ? "cursor-pointer bg-secondary text-white hover:bg-[#08744a]"
              : "cursor-not-allowed bg-gray-100 text-gray-400"
          }`}
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {loading ? loadingMessage : "Accept and continue"}
        </button>
      </div>

      {/* Error Modal */}
      {errorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="relative flex w-full max-w-[380px] flex-col items-center rounded-3xl bg-white p-8 text-center">
            <button
              onClick={() => setErrorModal(null)}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertCircle size={30} className="text-red-500" />
            </div>
            <h2 className="mb-2 font-poppins text-xl font-semibold text-[#1a1a1a]">
              Something went wrong
            </h2>
            <p className="mb-7 text-sm leading-relaxed text-gray-500">
              {errorModal}
            </p>
            <button
              onClick={() => setErrorModal(null)}
              className="h-12 w-full cursor-pointer rounded-full bg-secondary text-sm font-semibold text-white transition-colors hover:bg-[#08744a]"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
