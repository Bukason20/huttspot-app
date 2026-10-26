"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { logo } from "@/assets";

// Shared input styling for auth forms
export const authInputClass =
  "w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-[15px] text-[#1a1a1a] outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-secondary focus:ring-4 focus:ring-secondary/10";

export const authLabelClass = "text-sm font-semibold text-[#1a1a1a]";

interface AuthShellProps {
  title: React.ReactNode;
  subtitle?: string;
  /** Illustration shown on the side panel (tablet landscape & desktop) */
  image: string;
  /** Panel colour — keep to brand colours */
  tone?: "secondary" | "primary";
  panelHeading: string;
  panelText: string;
  children: React.ReactNode;
}

export default function AuthShell({
  title,
  subtitle,
  image,
  tone = "secondary",
  panelHeading,
  panelText,
  children,
}: AuthShellProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white font-nunito text-[#1a1a1a] lg:grid lg:grid-cols-[1fr_1.05fr]">
      {/* ── Side panel (lg+) ─────────────────────────────── */}
      <aside className="hidden p-4 lg:block">
        <div
          className={`sticky top-4 flex h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[28px] ${
            tone === "secondary" ? "bg-secondary" : "bg-primary"
          }`}
        >
          <div className="p-10 xl:p-12">
            <h2 className="max-w-md font-poppins text-[34px] font-semibold leading-tight tracking-tight text-white xl:text-[40px]">
              {panelHeading}
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-white/80">
              {panelText}
            </p>
          </div>

          <div className="relative flex-1">
            <div className="absolute bottom-[-20%] left-1/2 h-[110%] aspect-square -translate-x-1/2 rounded-full border border-white/20" />
            <div className="absolute bottom-[-20%] left-1/2 h-[80%] aspect-square -translate-x-1/2 rounded-full border border-white/20" />
            <img
              src={image}
              alt=""
              className="absolute bottom-0 left-1/2 h-full max-h-[520px] w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
            />
            <div className="absolute bottom-8 right-8 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              <BadgeCheck size={20} className="text-secondary" />
              <div>
                <p className="text-sm font-bold leading-tight">
                  Verified agents
                </p>
                <p className="text-xs text-gray-500">Port Harcourt</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Form side ────────────────────────────────────── */}
      <main className="flex min-h-screen flex-col px-6 pb-10 pt-6 sm:px-10 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="-ml-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[#1a1a1a] transition-colors hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => router.push("/")}
            className="cursor-pointer"
            aria-label="HuttSpot home"
          >
            <img src={logo} alt="HuttSpot" className="h-7 w-auto sm:h-8" />
          </button>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
          <h1 className="font-poppins text-3xl font-semibold tracking-tight sm:text-[34px]">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-gray-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
