"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MessageCircle,
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  Check,
  ShieldCheck,
  Store,
  Users,
  KeyRound,
  Home,
  Plus,
  BadgeCheck,
  MapPin,
} from "lucide-react";
import PropertySection from "@/components/home/PropertySection";
import { getAllProperties } from "@/lib/properties";
import { toggleSaveProperty } from "@/lib/userProperties";
import { Property } from "@/lib/types";
import HeroSection from "@/components/home/HeroSection";
import {
  communityImg2,
  logo,
  authImg1,
  heroAgent,
  heroClient,
  room,
} from "@/assets";
import Reveal from "@/components/ui/Reveal";

// Property type categories — matches your backend types
const PROPERTY_CATEGORIES = [
  "Self-Contained",
  "Flat / Apartment",
  "Shop",
  "Duplex",
  "Bungalow",
  "Office Space",
  "Land",
  "Room",
];

// Landing page content (UI only)
const HOW_STEPS = [
  {
    icon: Search,
    bg: "bg-primary/10",
    title: "Search listings",
    text: "Browse apartments, self-cons, shops and rooms posted by verified agents in PH.",
  },
  {
    icon: MessageCircle,
    bg: "bg-secondary/10",
    title: "Chat with the agent",
    text: "Ask your questions and arrange an inspection right inside HuttSpot.",
  },
  {
    icon: KeyRound,
    bg: "bg-[#f3efe6]",
    title: "Move in",
    text: "Agree on the terms with your agent, pick up your keys and settle in.",
  },
];

const FAQS = [
  {
    q: "What is HuttSpot?",
    a: "HuttSpot connects house hunters with verified agents in Port Harcourt. Browse apartments, self-cons, shops and more, then chat with the agent directly.",
  },
  {
    q: "Are the agents verified?",
    a: "Yes. Agents confirm their identity when they set up their account, before they can list a property.",
  },
  {
    q: "How much does it cost?",
    a: "Choose the Standard Plan (₦1,800) or the Premium Plan (₦3,000) to unlock full access. The plans above show what each one includes.",
  },
  {
    q: "Can I find a roommate on HuttSpot?",
    a: "Yes. The roommate finder is included in the Premium Plan.",
  },
  {
    q: "How do I list my property as an agent?",
    a: "Create an account, choose the agent account type during onboarding, then add your property in a few steps from your dashboard.",
  },
];

const SPY_SECTIONS = ["top", "listings", "how-it-works", "pricing", "faq", "community"];

export default function HomePage() {
  const router = useRouter();
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // ── Scroll UI (no business logic) ───────────────────────────
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("top");
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Navbar: compact + shadow once the top sentinel leaves the viewport
  useEffect(() => {
    const el = topSentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) =>
      setScrolled(!entry.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Scroll-spy: highlight the nav link for the section in the middle of the screen
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    SPY_SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loading]);

  // How it works: track which step card is in the middle of the screen
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            setActiveStep(Number((entry.target as HTMLElement).dataset.step));
        });
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAllProperties({ limit: 100 });
        setAllProperties(res.data);
      } catch (err) {
        console.error("Failed to load properties:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSaveToggle = useCallback(async (id: string) => {
    try {
      await toggleSaveProperty(id);
      setSavedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    } catch (err) {
      console.error("Failed to toggle save:", err);
    }
  }, []);

  // Group properties by type
  const grouped = PROPERTY_CATEGORIES.map((category) => ({
    title: category,
    properties: allProperties.filter(
      (p) => p.type?.toLowerCase() === category.toLowerCase(),
    ),
  })).filter((g) => g.properties.length > 0); // only show categories that have listings


  // Plans (content unchanged — layout only)
  const PLANS = [
    {
      name: "Standard Plan",
      price: "₦1,800",
      featured: false,
      features: [
        "Full access to verified listings",
        "Chat with up to 3 verified agents",
        "Save favourite homes & feature",
        "Renew anytime, no commitment",
      ],
    },
    {
      name: "Premium Plan",
      price: "₦3,000",
      featured: true,
      features: [
        "Unlimited access to all listings",
        "Direct chat with all verified agents",
        "Roommate finder feature",
        "Early access to new apartments",
        "Priority support from the HuttSpot team",
      ],
    },
  ];

  const NAV_LINKS = [
    { label: "Listings", href: "#listings" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Community", href: "#community" },
  ];

  return (
    <div className="relative min-h-screen bg-white font-nunito text-[#1a1a1a]">
      {/* Sentinel the navbar observer watches */}
      <div ref={topSentinelRef} aria-hidden className="absolute inset-x-0 top-0 h-2" />

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-40 border-b bg-white transition-shadow duration-300 ${
          scrolled
            ? "border-gray-100 shadow-[0_6px_24px_rgba(0,0,0,0.05)]"
            : "border-transparent"
        }`}
      >
        <nav
          className={`mx-auto flex max-w-6xl items-center justify-between px-5 transition-[height] duration-300 sm:px-8 ${
            scrolled ? "h-16" : "h-16 lg:h-20"
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              className="-ml-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[#1a1a1a] hover:bg-gray-100 md:hidden"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <a href="#" aria-label="HuttSpot home">
              <img src={logo} alt="HuttSpot" className="h-8 w-auto lg:h-9" />
            </a>
          </div>

          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className={`relative py-2 text-sm font-semibold transition-colors hover:text-[#1a1a1a] ${
                    activeSection === l.href.slice(1)
                      ? "text-[#1a1a1a]"
                      : "text-tertiary"
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left rounded-full bg-primary transition-transform duration-300 ${
                      activeSection === l.href.slice(1) ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/auth?mode=signup")}
              className="hidden h-10 cursor-pointer items-center rounded-full px-4 text-sm font-semibold text-[#1a1a1a] hover:bg-gray-100 sm:inline-flex"
            >
              Become an Agent
            </button>
            <button
              onClick={() => router.push("/auth/signin")}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#1a1a1a] pl-4 pr-1.5 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              Sign in
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
                <ArrowUpRight size={15} />
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-gray-100 bg-white px-5 pb-6 pt-2 md:hidden">
            <ul className="flex flex-col">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="block border-b border-gray-100 py-3.5 text-base font-semibold"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push("/auth?mode=signup")}
              className="mt-5 h-12 w-full cursor-pointer rounded-full border border-gray-300 text-sm font-semibold"
            >
              Become an Agent
            </button>
          </div>
        )}
      </header>

      <main>
        {/* ── Hero ──────────────────────────────────────────── */}
        <div
          id="top"
          className="mx-auto max-w-6xl px-5 pb-14 pt-10 sm:px-8 sm:pt-14 lg:pb-20 lg:pt-16"
        >
          <HeroSection />
        </div>

        {/* ── Category ticker ───────────────────────────────── */}
        <div className="marquee mb-16 overflow-hidden border-y border-gray-100 py-5 lg:mb-20">
          <div className="marquee-track flex w-max">
            {[...PROPERTY_CATEGORIES, ...PROPERTY_CATEGORIES].map((c, i) => (
              <span
                key={i}
                aria-hidden={i >= PROPERTY_CATEGORIES.length}
                className="flex items-center gap-8 pr-8 font-poppins text-lg font-semibold whitespace-nowrap text-[#1a1a1a]/70 sm:gap-10 sm:pr-10 sm:text-xl"
              >
                {c}
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
            ))}
          </div>
        </div>

        {/* ── Value strip ───────────────────────────────────── */}
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-gray-100 bg-gray-100 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "Verified agents",
                text: "Agents confirm their identity before listing.",
              },
              {
                icon: MessageCircle,
                title: "Chat directly",
                text: "Talk to agents right inside HuttSpot.",
              },
              {
                icon: Store,
                title: "Homes & shops",
                text: "Self-cons, flats, duplexes, shops and land.",
              },
              {
                icon: Users,
                title: "Roommates",
                text: "Find someone to share a space with.",
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 90} className="bg-[#fafaf8] p-5 sm:p-6">
                <Icon size={22} className="text-secondary" />
                <p className="mt-4 font-poppins text-[15px] font-semibold">
                  {title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  {text}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── Listings ──────────────────────────────────────── */}
        <section
          id="listings"
          className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-20 sm:px-8 lg:pt-28"
        >
          <Reveal className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-primary">
                Fresh on HuttSpot
              </p>
              <h2 className="mt-2 font-poppins text-3xl font-semibold tracking-tight sm:text-4xl">
                Find a space that fits you
              </h2>
            </div>
            <p className="max-w-sm text-tertiary">
              Browse what agents have posted, grouped by property type.
            </p>
          </Reveal>

          {loading ? (
            // Skeleton placeholders while loading
            <div>
              {[1, 2].map((i) => (
                <div key={i} className="mb-10 animate-pulse">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-5 w-40 rounded-full bg-gray-200" />
                    <div className="h-4 w-14 rounded-full bg-gray-200" />
                  </div>
                  <div className="scrollbar-hide -mx-5 flex gap-4 overflow-hidden px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="w-[78%] flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 sm:w-[300px] lg:w-[calc((100%-2rem)/3)]"
                      >
                        <div className="aspect-[4/3] bg-gray-200" />
                        <div className="flex flex-col gap-2 p-4">
                          <div className="h-4 w-3/4 rounded-full bg-gray-200" />
                          <div className="h-3 w-1/2 rounded-full bg-gray-200" />
                          <div className="mt-2 h-6 w-1/3 rounded-full bg-gray-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : grouped.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 px-6 py-14 text-center">
              <Home size={28} className="mx-auto text-gray-300" />
              <p className="mt-3 font-semibold">No listings yet</p>
              <p className="mt-1 text-sm text-gray-500">
                New spaces will show up here as agents post them.
              </p>
            </div>
          ) : (
            grouped.map((group) => (
              <PropertySection
                key={group.title}
                title={group.title}
                properties={group.properties}
                onSaveToggle={handleSaveToggle}
                savedIds={savedIds}
              />
            ))
          )}

          {/* View more / View agents */}
          {!loading && allProperties.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => router.push("/huttspotter/dashboard")}
                className="h-12 cursor-pointer rounded-full bg-[#1a1a1a] px-7 text-sm font-semibold text-white transition-colors hover:bg-black"
              >
                View more listings
              </button>
              <button className="h-12 cursor-pointer rounded-full border border-gray-300 px-7 text-sm font-semibold transition-colors hover:bg-gray-50">
                View agents
              </button>
            </div>
          )}
        </section>

        {/* ── How it works ──────────────────────────────────── */}
        {/* Mobile/tablet: stacked cards. Desktop: sticky step list on the left,
            cards scroll past on the right and the active step follows along. */}
        <section
          id="how-it-works"
          className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-20 sm:px-8 lg:pt-28"
        >
          <div className="lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <p className="text-center text-sm font-bold uppercase tracking-wider text-primary lg:text-left">
                  How it works
                </p>
                <h2 className="mx-auto mt-2 max-w-xl text-center font-poppins text-3xl font-semibold tracking-tight sm:text-4xl lg:mx-0 lg:text-left lg:text-[44px] lg:leading-[1.1]">
                  House hunting, without the waka up and down.
                </h2>
              </Reveal>

              {/* Step tracker (desktop) */}
              <ol className="mt-10 hidden flex-col gap-2 lg:flex">
                {HOW_STEPS.map((step, i) => (
                  <li key={step.title}>
                    <button
                      onClick={() =>
                        stepRefs.current[i]?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        })
                      }
                      className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors ${
                        activeStep === i ? "bg-[#fafaf8]" : "hover:bg-[#fafaf8]"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-poppins text-sm font-semibold transition-colors ${
                          activeStep === i
                            ? "bg-secondary text-white"
                            : activeStep > i
                              ? "bg-secondary/15 text-secondary"
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {activeStep > i ? <Check size={15} strokeWidth={3} /> : i + 1}
                      </span>
                      <span
                        className={`font-poppins text-lg font-semibold transition-colors ${
                          activeStep === i ? "text-[#1a1a1a]" : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="mt-6 hidden h-1 overflow-hidden rounded-full bg-gray-100 lg:block">
                <div
                  className="h-full rounded-full bg-secondary transition-[width] duration-500"
                  style={{ width: `${((activeStep + 1) / HOW_STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 lg:mt-0 lg:gap-8">
              {HOW_STEPS.map(({ icon: Icon, bg, title, text }, i) => (
                <div
                  key={title}
                  data-step={i}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                >
                  <Reveal
                    className={`${bg} flex flex-col overflow-hidden rounded-3xl p-6 sm:p-8 lg:min-h-[420px]`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                        <Icon size={20} className="text-[#1a1a1a]" />
                      </span>
                      <span className="font-poppins text-sm font-semibold text-[#1a1a1a]/40">
                        0{i + 1}
                      </span>
                    </div>

                    {/* Small illustration per step */}
                    <div className="my-8 flex flex-1 items-center justify-center">
                      {i === 0 && (
                        <div className="w-full max-w-[260px] overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                          <img src={room} alt="" className="aspect-[16/10] w-full object-cover" />
                          <div className="p-3">
                            <p className="text-sm font-semibold">Self-contained</p>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                              <MapPin size={12} /> Port Harcourt
                            </p>
                          </div>
                        </div>
                      )}
                      {i === 1 && (
                        <div className="flex w-full max-w-[300px] flex-col gap-3">
                          <div className="flex items-center gap-2.5 self-start rounded-2xl rounded-tl-md bg-white p-2.5 pr-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                            <img src={heroClient} alt="" className="h-8 w-8 rounded-full object-cover" />
                            <p className="text-xs font-semibold">Is the self-con still available?</p>
                          </div>
                          <div className="flex items-center gap-2.5 self-end rounded-2xl rounded-br-md bg-[#1a1a1a] p-2.5 pr-4">
                            <img src={heroAgent} alt="" className="h-8 w-8 rounded-full object-cover" />
                            <div>
                              <p className="flex items-center gap-1 text-[10px] font-bold text-secondary">
                                <BadgeCheck size={12} /> Verified agent
                              </p>
                              <p className="text-xs font-semibold text-white">Yes! When can you come see it?</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {i === 2 && (
                        <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-white">
                          <div className="absolute inset-[-14px] rounded-full border border-[#1a1a1a]/10" />
                          <KeyRound size={44} className="text-[#1a1a1a]" />
                          <span className="absolute -right-1 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white">
                            <Check size={18} strokeWidth={3} />
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="font-poppins text-xl font-semibold">{title}</p>
                    <p className="mt-2 leading-relaxed text-tertiary">{text}</p>
                  </Reveal>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── For agents ────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 pt-20 sm:px-8 lg:pt-28">
          <Reveal className="grid overflow-hidden rounded-[32px] bg-[#1a1a1a] md:grid-cols-2">
            <div className="p-8 sm:p-12 lg:p-14">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">
                For agents
              </p>
              <h2 className="mt-3 font-poppins text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
                List your properties and meet real clients.
              </h2>
              <ul className="mt-8 flex flex-col gap-4">
                {[
                  "Create a listing in a few simple steps",
                  "Chat with interested house hunters",
                  "Manage drafts and published listings in one place",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-white/80">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => router.push("/auth?mode=signup")}
                className="mt-10 inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-[#f25d27]"
              >
                Become an Agent
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="relative min-h-[320px] bg-secondary md:min-h-full">
              <div className="absolute left-1/2 top-1/2 h-[80%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
              <img
                src={authImg1}
                alt="Agent holding the keys to a new apartment"
                className="absolute bottom-0 left-1/2 h-[92%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
              />
            </div>
          </Reveal>
        </section>

        {/* ── Subscription ──────────────────────────────────── */}
        <section
          id="pricing"
          className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-20 sm:px-8 lg:pt-28"
        >
          <Reveal className="text-center">
            <h2 className="font-poppins text-3xl font-semibold tracking-tight sm:text-4xl">
              Choose Subscription
            </h2>
            <p className="mt-2 text-tertiary">Unlock full access</p>
          </Reveal>

          <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2 lg:mt-14">
            {PLANS.map((plan, i) => (
              <Reveal
                key={plan.name}
                delay={i * 120}
                className={`flex flex-col rounded-3xl p-7 sm:p-8 ${
                  plan.featured
                    ? "bg-secondary text-white"
                    : "border border-gray-200 bg-white"
                }`}
              >
                <p
                  className={`font-semibold ${plan.featured ? "text-white/80" : "text-tertiary"}`}
                >
                  {plan.name}
                </p>
                <p className="mt-2 font-poppins text-4xl font-semibold tracking-tight">
                  {plan.price}
                </p>
                <div
                  className={`my-6 h-px ${plan.featured ? "bg-white/20" : "bg-gray-100"}`}
                />
                <ul className="mb-8 flex flex-col gap-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[15px]">
                      <span
                        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                          plan.featured ? "bg-white/20" : "bg-secondary/10"
                        }`}
                      >
                        <Check
                          size={12}
                          strokeWidth={3}
                          className={plan.featured ? "text-white" : "text-secondary"}
                        />
                      </span>
                      <span
                        className={plan.featured ? "text-white/90" : "text-tertiary"}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push("/auth?mode=signup")}
                  className={`mt-auto h-12 w-full cursor-pointer rounded-full text-sm font-semibold transition-colors ${
                    plan.featured
                      ? "bg-white text-secondary hover:bg-gray-50"
                      : "bg-[#1a1a1a] text-white hover:bg-black"
                  }`}
                >
                  Subscribe Now
                </button>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────── */}
        <section
          id="faq"
          className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-20 sm:px-8 lg:pt-28"
        >
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <Reveal className="text-center lg:text-left">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">
                FAQ
              </p>
              <h2 className="mt-2 font-poppins text-3xl font-semibold tracking-tight sm:text-4xl">
                Questions people ask us
              </h2>
              <p className="mt-3 text-tertiary">
                Can&apos;t find what you need? Reach out through the chat
                button.
              </p>
            </Reveal>

            <div className="divide-y divide-gray-100 border-y border-gray-100">
              {FAQS.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <Reveal key={item.q} delay={i * 60}>
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left"
                    >
                      <span className="font-poppins text-base font-semibold sm:text-lg">
                        {item.q}
                      </span>
                      <span
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                          isOpen
                            ? "rotate-45 bg-secondary text-white"
                            : "bg-[#f7f7f5] text-[#1a1a1a]"
                        }`}
                      >
                        <Plus size={16} />
                      </span>
                    </button>
                    {/* grid-rows trick animates height without measuring */}
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-2xl pb-5 pr-12 leading-relaxed text-tertiary">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Community ─────────────────────────────────────── */}
        <section
          id="community"
          className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8 lg:py-28"
        >
          <Reveal className="grid items-center gap-10 rounded-[32px] bg-[#fafaf8] p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:p-14">
            <div className="text-center lg:text-left">
              <h2 className="font-poppins text-3xl font-semibold tracking-tight sm:text-4xl">
                <span className="text-secondary">HuttSpot</span>{" "}
                <span className="text-primary">Community</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md leading-relaxed text-tertiary lg:mx-0">
                Here, people connect. Students find roommates, agents meet real
                clients, small businesses grab shops. We&apos;re building trust
                across the city.
              </p>
              <button
                onClick={() => router.push("/auth?mode=signup")}
                className="mt-8 h-12 cursor-pointer rounded-full bg-secondary px-10 text-sm font-semibold text-white transition-colors hover:bg-[#08744a]"
              >
                Join Now
              </button>
            </div>
            <img
              src={communityImg2}
              alt="People on HuttSpot asking for apartments, shops and roommates"
              className="w-full rounded-2xl"
            />
          </Reveal>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-gray-100">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <img src={logo} alt="HuttSpot" className="h-8 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
              Connecting house hunters and agents in Port Harcourt, all in one
              spot.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold">Explore</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-gray-500">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-[#1a1a1a]">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold">Account</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-gray-500">
              <li>
                <button
                  onClick={() => router.push("/auth/signin")}
                  className="cursor-pointer hover:text-[#1a1a1a]"
                >
                  Sign in
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/auth/signup")}
                  className="cursor-pointer hover:text-[#1a1a1a]"
                >
                  Create account
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/auth?mode=signup")}
                  className="cursor-pointer hover:text-[#1a1a1a]"
                >
                  Become an Agent
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100">
          <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-gray-400 sm:px-8">
            © {new Date().getFullYear()} HuttSpot. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating chat button */}
      <button
        aria-label="Chat"
        className="fixed bottom-6 right-5 z-30 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary shadow-[0_8px_24px_rgba(255,107,53,0.35)] transition-transform hover:scale-105 sm:right-8"
      >
        <MessageCircle size={24} color="#fff" fill="#fff" />
      </button>
    </div>
  );
}
