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
        ...(formData.accountMode === "HUTTSPOTTER" && {
          intent: formData.intent,
        }),
        ...(profilePhotoUrl && { profilePhoto: profilePhotoUrl }),
      });

      // Step 3 — Fetch full profile to get accountMode for routing
      setLoadingMessage("Setting up your account...");
      const profile = await getUserProfile();

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
    <div className="max-w-[390px] mx-auto min-h-screen bg-[#F2F2F2] flex flex-col">
      {/* Header */}
      <div className="bg-secondary flex flex-col items-center justify-center h-[20vh] z-50">
        <h1 className="text-2xl font-bold text-center text-white">
          Terms of Service
        </h1>
      </div>

      {/* Terms card */}
      <div className="mx-5 -translate-y-7 bg-white rounded-2xl border-2 border-primary px-5 pt-15 pb-5 overflow-y-auto min-h-[420px]">
        <ol className="flex flex-col gap-5">
          {termsList.map((term) => (
            <li key={term.number}>
              <p className="text-sm font-bold text-[#1a1a1a]">
                {term.number}. {term.title}
              </p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {term.description}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* Checkboxes */}
      <div className="mx-5 mt-2 flex flex-col gap-4">
        {checkboxes.map(({ state, set, label }) => (
          <button
            key={label}
            onClick={() => set(!state)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div
              className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                state
                  ? "bg-secondary border-secondary"
                  : "bg-white border-gray-400"
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
            <span className="text-sm font-semibold text-[#1a1a1a] text-left">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Accept button */}
      <div className="mt-auto px-5 pb-12 pt-5">
        <button
          onClick={handleAccept}
          disabled={!canProceed || loading}
          className={`w-full rounded-full py-4 text-[15px] font-semibold transition-all duration-200 ${
            canProceed && !loading
              ? "bg-secondary text-white cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? loadingMessage : "Accept and continue"}
        </button>
      </div>

      {/* Error Modal */}
      {errorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-[340px] flex flex-col items-center text-center">
            <button
              onClick={() => setErrorModal(null)}
              className="absolute top-4 right-4 cursor-pointer text-gray-400"
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {errorModal}
            </p>
            <button
              onClick={() => setErrorModal(null)}
              className="w-full bg-secondary text-white rounded-full py-3 text-sm font-semibold cursor-pointer"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
