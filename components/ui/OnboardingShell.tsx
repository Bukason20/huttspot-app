"use client";

import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { logo, authImg3 } from "@/assets";
import { useOnboarding } from "@/context/OnboardingContext";

// Display-only list of onboarding steps (routing lives in each page)
const ALL_STEPS = [
  { path: "/onboarding/account-mode", label: "Account type" },
  {
    path: "/onboarding/looking-for",
    label: "What you're looking for",
    huttspotterOnly: true,
  },
  { path: "/onboarding/gender", label: "Gender" },
  { path: "/onboarding/phone", label: "Phone number" },
  { path: "/onboarding/how-found", label: "How you found us" },
  { path: "/onboarding/verify-identity", label: "Verify your identity" },
  { path: "/onboarding/terms", label: "Terms of service" },
];

/**
 * Shared frame for every onboarding screen.
 * Mobile/tablet: logo + step counter + progress bar on top.
 * Desktop: brand panel with a step list on the left, form on the right.
 */
export default function OnboardingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const { formData } = useOnboarding();

  const steps = ALL_STEPS.filter(
    (s) => !(s.huttspotterOnly && formData.accountMode === "AGENT"),
  );
  const current = steps.findIndex((s) => pathname.startsWith(s.path));
  const hasStep = current >= 0;
  const progress = hasStep ? ((current + 1) / steps.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-white font-nunito text-[#1a1a1a] lg:grid lg:grid-cols-[1fr_1.05fr]">
      {/* ── Brand panel (lg+) ─────────────────────────────── */}
      <aside className="hidden p-4 lg:block">
        <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[28px] bg-secondary">
          <div className="relative z-10 p-10 xl:p-12">
            <h2 className="max-w-md font-poppins text-[32px] font-semibold leading-tight tracking-tight text-white xl:text-[36px]">
              Let&apos;s set up your HuttSpot account.
            </h2>
            <p className="mt-3 max-w-sm text-white/75">
              A few quick steps and you&apos;re in.
            </p>

            {hasStep && (
              <ol className="mt-10 flex flex-col gap-1">
                {steps.map((s, i) => {
                  const done = i < current;
                  const active = i === current;
                  return (
                    <li key={s.path} className="flex items-center gap-3 py-1.5">
                      <span
                        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                          done
                            ? "bg-white text-secondary"
                            : active
                              ? "bg-primary text-white"
                              : "border border-white/30 text-white/60"
                        }`}
                      >
                        {done ? <Check size={14} strokeWidth={3} /> : i + 1}
                      </span>
                      <span
                        className={`text-[15px] font-semibold transition-colors ${
                          active
                            ? "text-white"
                            : done
                              ? "text-white/85"
                              : "text-white/55"
                        }`}
                      >
                        {s.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* Illustration: absolutely positioned against the panel itself
              (not the space left under the step list), so it keeps the same
              size on short laptop screens. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -bottom-[18%] -right-[14%] aspect-square h-[78%] rounded-full border border-white/15" />
            <div className="absolute -bottom-[18%] -right-[14%] aspect-square h-[56%] rounded-full border border-white/15" />
            <img
              src={authImg3}
              alt=""
              className="absolute bottom-0 right-4 h-[min(72%,560px)] w-auto max-w-none object-contain object-bottom xl:right-8"
            />
          </div>
        </div>
      </aside>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="flex min-h-screen flex-col px-6 pt-5 sm:px-10 lg:px-12 xl:px-20">
        <header className="flex items-center justify-between gap-4">
          <img src={logo} alt="HuttSpot" className="h-7 w-auto sm:h-8" />
          {hasStep && (
            <span className="rounded-full bg-[#f7f7f5] px-3 py-1.5 text-xs font-bold text-tertiary">
              Step {current + 1} of {steps.length}
            </span>
          )}
        </header>

        {hasStep && (
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-gray-100 lg:hidden">
            <div
              className="h-full rounded-full bg-secondary transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <main className="mx-auto flex w-full max-w-[460px] flex-1 flex-col pt-6 md:justify-center md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
