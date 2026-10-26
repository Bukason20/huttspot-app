"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Check } from "lucide-react";
import { heroAgent, heroClient, heroPortrait } from "@/assets";

const HIGHLIGHTS = [
  "Verified agents",
  "Apartments & shops",
  "Roommate matching",
];

const HeroSection = () => {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountMode, setAccountMode] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const mode = localStorage.getItem("accountMode");
    setIsLoggedIn(!!token);
    setAccountMode(mode);
    setChecking(false);
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      // Already logged in — go to their dashboard
      router.push(
        accountMode === "AGENT" ? "/agent/dashboard" : "/huttspotter/dashboard",
      );
    } else {
      router.push("/auth/signup");
    }
  };

  const handleBecomeAgent = () => {
    if (isLoggedIn) {
      router.push(
        accountMode === "AGENT" ? "/agent/dashboard" : "/huttspotter/dashboard",
      );
    } else {
      router.push("/auth/signup");
    }
  };

  return (
    <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
      {/* ── Copy ─────────────────────────────────────────── */}
      <div className="text-center lg:text-left">
        <div className="hero-text inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-tertiary">
          <span className="h-2 w-2 rounded-full bg-secondary" />
          Now live in Port Harcourt
        </div>

        <h1 className="hero-text mt-5 font-poppins text-[34px] font-semibold leading-[1.1] tracking-tight text-[#1a1a1a] sm:text-5xl lg:text-[56px]">
          Connecting house hunters and agents, all in{" "}
          <span className="text-primary">one spot.</span>
        </h1>

        <p className="hero-sub mx-auto mt-5 max-w-[460px] text-base leading-relaxed text-tertiary sm:text-lg lg:mx-0">
          No more waka up and down. From apartments to shops, even roommates —
          connect with trusted agents and real people in PH.
        </p>

        <div className="hero-btns mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
          <button
            onClick={handleGetStarted}
            disabled={checking}
            className="group inline-flex h-12 cursor-pointer disabled:opacity-70 items-center justify-center gap-3 rounded-full bg-secondary pl-6 pr-2 text-[15px] font-semibold text-white transition-colors hover:bg-[#08744a]"
          >
            Get started
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-secondary transition-transform group-hover:translate-x-0.5">
              <ArrowRight size={16} />
            </span>
          </button>
          <button
            onClick={handleBecomeAgent}
            disabled={checking}
            className="inline-flex h-12 cursor-pointer disabled:opacity-70 items-center justify-center rounded-full border border-gray-300 px-6 text-[15px] font-semibold text-[#1a1a1a] transition-colors hover:bg-gray-50"
          >
            Become an Agent
          </button>
        </div>

        <ul className="hero-btns mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 lg:justify-start">
          {HIGHLIGHTS.map((h) => (
            <li
              key={h}
              className="flex items-center gap-1.5 text-sm font-semibold text-tertiary"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-secondary/15">
                <Check size={11} className="text-secondary" strokeWidth={3} />
              </span>
              {h}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Visual ───────────────────────────────────────── */}
      <div className="relative mx-auto w-full max-w-[520px]">
        <div className="relative aspect-[4/4.2] overflow-hidden rounded-[32px] bg-primary">
          {/* Concentric rings */}
          <div className="absolute left-1/2 top-[58%] h-[85%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
          <div className="absolute left-1/2 top-[58%] h-[62%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />

          <img
            src={heroPortrait}
            alt="A HuttSpot user browsing listings on her phone"
            className="absolute bottom-0 left-1/2 h-[88%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
          />
        </div>

        {/* Client bubble */}
        <div className="bubble-left absolute left-3 top-6 flex max-w-[230px] items-center gap-2.5 rounded-2xl rounded-tl-md bg-white p-2.5 pr-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:-left-6 sm:top-10">
          <img
            src={heroClient}
            alt="House hunter"
            className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
          />
          <p className="text-xs font-semibold leading-snug text-[#1a1a1a]">
            Looking for a self con in Port Harcourt
          </p>
        </div>

        {/* Agent bubble */}
        <div className="bubble-right absolute bottom-6 right-3 flex max-w-[240px] items-center gap-2.5 rounded-2xl rounded-br-md bg-[#1a1a1a] p-2.5 pr-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] sm:-right-6 sm:bottom-10">
          <img
            src={heroAgent}
            alt="Verified agent"
            className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
          />
          <div>
            <p className="flex items-center gap-1 text-[11px] font-bold text-secondary">
              <BadgeCheck size={13} className="text-secondary" />
              Verified agent
            </p>
            <p className="text-xs font-semibold leading-snug text-white">
              Yes, I can help. Let&apos;s connect!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
