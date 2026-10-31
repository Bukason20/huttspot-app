"use client";

import { useEffect } from "react";
import { CheckCircle, MailWarning, X, XCircle } from "lucide-react";

type Tone = "success" | "error" | "warning";

const TONES: Record<Tone, { wrap: string; icon: React.ReactNode }> = {
  success: {
    wrap: "bg-secondary/10",
    icon: <CheckCircle size={30} className="text-secondary" />,
  },
  error: {
    wrap: "bg-red-50",
    icon: <XCircle size={30} className="text-red-500" />,
  },
  warning: {
    wrap: "bg-primary/10",
    icon: <MailWarning size={30} className="text-primary" />,
  },
};

/**
 * Result dialog for the auth screens: shown once the screen loader is done,
 * to say how the action went and what to do next.
 */
export default function AuthModal({
  tone,
  title,
  children,
  primary,
  secondary,
  onClose,
}: {
  tone: Tone;
  title: string;
  children: React.ReactNode;
  primary: { label: string; onClick: () => void };
  secondary?: { label: string; onClick: () => void };
  onClose?: () => void;
}) {
  // Escape closes it
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:px-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full flex-col items-center rounded-t-3xl bg-white px-6 pb-8 pt-8 text-center sm:max-w-[400px] sm:rounded-3xl sm:p-8"
      >
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        )}
        <div
          className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full ${TONES[tone].wrap}`}
        >
          {TONES[tone].icon}
        </div>
        <h2
          id="auth-modal-title"
          className="mb-2 font-poppins text-xl font-semibold text-[#1a1a1a]"
        >
          {title}
        </h2>
        <div className="mb-7 w-full text-sm leading-relaxed text-gray-500">
          {children}
        </div>
        <button
          autoFocus
          onClick={primary.onClick}
          className="h-12 w-full cursor-pointer rounded-full bg-secondary text-sm font-semibold text-white outline-none transition-colors hover:bg-[#08744a] focus-visible:ring-4 focus-visible:ring-secondary/25"
        >
          {primary.label}
        </button>
        {secondary && (
          <button
            onClick={secondary.onClick}
            className="mt-3 h-11 w-full cursor-pointer rounded-full text-sm font-semibold text-gray-500 outline-none transition-colors hover:bg-gray-50 focus-visible:ring-4 focus-visible:ring-gray-200"
          >
            {secondary.label}
          </button>
        )}
      </div>
    </div>
  );
}
