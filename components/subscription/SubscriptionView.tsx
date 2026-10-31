"use client";

import { useScreenLoader } from "@/components/ui/ScreenLoader";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  CircleAlert,
  Coins,
  CreditCard,
  Home,
  Lock,
  MessageCircle,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  X,
} from "lucide-react";
import { AccountMode } from "@/lib/types";
import {
  Payment,
  Plan,
  cancelSubscription,
  daysLeft,
  formatDate,
  formatNaira,
  getPayments,
  getPlans,
  initializePayment,
  rememberPaymentReturn,
  setSubscriptionCache,
  useSubscription,
  verifyPayment,
} from "@/lib/subscription";
import { SkeletonText } from "@/components/ui";

// ── Small pieces ───────────────────────────────────────────────

function StatusChip({ status }: { status: string }) {
  const s = status?.toUpperCase();
  const style =
    s === "SUCCESS" || s === "ACTIVE"
      ? "bg-secondary/10 text-secondary"
      : s === "PENDING"
        ? "bg-primary/10 text-primary"
        : s === "ABANDONED" || s === "CANCELLED" || s === "EXPIRED"
          ? "bg-gray-100 text-gray-500"
          : "bg-red-50 text-red-600";
  const label =
    s === "SUCCESS"
      ? "Paid"
      : s === "PENDING"
        ? "Pending"
        : s === "ACTIVE"
          ? "Active"
          : s.charAt(0) + s.slice(1).toLowerCase();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${style}`}
    >
      {label}
    </span>
  );
}

/** One dot per point: green = left, grey = used */
function PointPips({ left, total }: { left: number; total: number }) {
  const count = Math.min(Math.max(total, left), 30);
  if (count <= 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`h-2.5 w-6 rounded-full ${
            i < left ? "bg-secondary" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function PlanCardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-gray-100 bg-white p-6 sm:p-7">
      <SkeletonText className="w-24" />
      <SkeletonText className="mt-4 h-8 w-36" />
      <SkeletonText className="mt-3 w-full" />
      <SkeletonText className="mt-2 w-2/3" />
      <div className="mt-8 h-12 rounded-full bg-gray-200" />
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────

export default function SubscriptionView({ mode }: { mode: AccountMode }) {
  const router = useRouter();
  const loader = useScreenLoader();
  const params = useSearchParams();
  const returnTo = params.get("return");
  const isAgent = mode === "AGENT";

  const { subscription, loading: subLoading, refresh } = useSubscription();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState("");

  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  // References currently being re-checked with Paystack
  const [checking, setChecking] = useState<Set<string>>(new Set());

  const [buying, setBuying] = useState<string | null>(null);
  const [buyError, setBuyError] = useState("");

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const plansRef = useRef<HTMLDivElement>(null);

  const loadPlans = () => {
    setPlansLoading(true);
    setPlansError("");
    getPlans(mode)
      .then((r) => setPlans(r.plans))
      .catch((err) => setPlansError(err?.message || "Couldn't load plans"))
      .finally(() => setPlansLoading(false));
  };

  useEffect(() => {
    loadPlans();
    refresh();
    getPayments()
      .then((list) => {
        setPayments(list);
        // A payment stays PENDING if the user never got back to the callback
        // page (closed the tab, wrong callback URL…) and the webhook hasn't
        // landed. verify asks Paystack directly and adds the points once, so
        // re-check recent pending ones here.
        const recent = list
          .filter(
            (p) =>
              p.status?.toUpperCase() === "PENDING" &&
              Date.now() - new Date(p.createdAt).getTime() < 7 * 86_400_000,
          )
          .slice(0, 5)
          .map((p) => p.reference);
        recent.forEach((ref) => recheckPayment(ref));
      })
      .catch((err) => console.error("Failed to load payments:", err))
      .finally(() => setPaymentsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const recheckPayment = async (reference: string) => {
    setChecking((s) => new Set(s).add(reference));
    try {
      const res = await verifyPayment(reference);
      setPayments((list) =>
        list.map((p) =>
          p.reference === reference
            ? { ...p, status: res.status, paidAt: res.paidAt ?? p.paidAt }
            : p,
        ),
      );
      if (res.status?.toUpperCase() === "SUCCESS") {
        if (res.subscription) setSubscriptionCache(res.subscription);
        refresh();
      }
    } catch (err) {
      console.error("Failed to re-check payment:", reference, err);
    } finally {
      setChecking((s) => {
        const next = new Set(s);
        next.delete(reference);
        return next;
      });
    }
  };

  const active = !!subscription?.active;
  const currentPlan = useMemo(
    () => plans.find((p) => p.id === subscription?.plan),
    [plans, subscription?.plan],
  );
  const cheapestPerPoint = useMemo(() => {
    const withPoints = plans.filter((p) => p.points > 0);
    if (withPoints.length < 2) return null;
    return withPoints.reduce((a, b) =>
      a.priceNaira / a.points <= b.priceNaira / b.points ? a : b,
    ).id;
  }, [plans]);

  const handleBuy = async (plan: Plan) => {
    if (buying) return;
    setBuying(plan.id);
    setBuyError("");
    try {
      // Bring them back to what they were doing (e.g. the listing) afterwards
      rememberPaymentReturn(returnTo);
      loader.show("Taking you to Paystack...");
      const res = await initializePayment(plan.id);
      // Stays up while the browser leaves for Paystack
      window.location.href = res.authorization_url;
    } catch (err: any) {
      loader.hide();
      const code = err?.data?.code;
      setBuyError(
        code === "PAYMENTS_NOT_CONFIGURED"
          ? "Payments aren't available right now. Please try again later."
          : err?.message || "Couldn't start the payment. Please try again.",
      );
      setBuying(null);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError("");
    try {
      const sub = await cancelSubscription();
      setSubscriptionCache(sub ? { ...sub, active: false } : null);
      await refresh();
      setConfirmCancel(false);
    } catch (err: any) {
      setCancelError(err?.message || "Couldn't cancel. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const scrollToPlans = () =>
    plansRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const left = subscription?.points ?? 0;
  const totalPoints = Math.max(currentPlan?.points ?? 0, left);
  const days = daysLeft(subscription?.expiresAt);
  const planName =
    subscription?.planName || currentPlan?.name || subscription?.plan || "";
  const hadPlan = !!subscription?.plan;

  return (
    <div className="px-5">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        {returnTo && (
          <button
            onClick={() => router.push(returnTo)}
            className="mb-4 flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-[#1a1a1a]"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
        <h1 className="font-poppins text-2xl font-semibold tracking-tight sm:text-3xl">
          Subscription
        </h1>
        <p className="mt-1 text-gray-500">
          {isAgent
            ? "Pick a plan for your listings and see your payments."
            : "Points let you reach agents. Buy a plan, track your points and see your payments."}
        </p>
      </div>

      {/* Came here from a listing */}
      {returnTo && !active && !isAgent && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <MessageCircle size={17} className="text-primary" />
          </span>
          <div className="text-sm">
            <p className="font-bold">Subscribe to contact this agent</p>
            <p className="mt-0.5 text-gray-500">
              Choose a plan below. After payment we&apos;ll take you straight
              back to the listing.
            </p>
          </div>
        </div>
      )}

      {/* ── Current plan + how it works ───────────────────────── */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-6">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-7">
          {subLoading ? (
            <div className="animate-pulse">
              <SkeletonText className="w-28" />
              <SkeletonText className="mt-5 h-10 w-24" />
              <SkeletonText className="mt-4 w-2/3" />
              <div className="mt-6 h-11 w-40 rounded-full bg-gray-200" />
            </div>
          ) : active ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
                  Your plan
                </p>
                <StatusChip status="ACTIVE" />
              </div>
              <h2 className="mt-2 font-poppins text-2xl font-semibold">
                {planName}
              </h2>

              {isAgent ? (
                <div className="mt-6 flex items-end gap-2">
                  <span className="font-poppins text-5xl font-semibold leading-none tracking-tight">
                    {subscription?.usage?.listingsUsed ?? 0}
                  </span>
                  <span className="pb-1 text-gray-500">
                    {currentPlan?.listingLimit
                      ? `of ${currentPlan.listingLimit} listings used`
                      : "listings used"}
                  </span>
                </div>
              ) : (
                <>
                  <div className="mt-6 flex items-end gap-2">
                    <span className="font-poppins text-5xl font-semibold leading-none tracking-tight">
                      {left}
                    </span>
                    <span className="pb-1 text-gray-500">
                      {left === 1 ? "point" : "points"} left
                      {totalPoints > 0 && ` of ${totalPoints}`}
                    </span>
                  </div>
                  <div className="mt-4">
                    <PointPips left={left} total={totalPoints} />
                  </div>
                </>
              )}

              <dl className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#f7f7f5] p-4">
                  <dt className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <CalendarClock size={14} /> Expires
                  </dt>
                  <dd className="mt-1 font-bold">
                    {formatDate(subscription?.expiresAt) || "—"}
                  </dd>
                  {days > 0 && (
                    <p className="text-xs text-gray-500">
                      {days} {days === 1 ? "day" : "days"} left
                    </p>
                  )}
                </div>
                <div className="rounded-2xl bg-[#f7f7f5] p-4">
                  <dt className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <UserRoundCheck size={14} />
                    {isAgent ? "Listing limit" : "Agents contacted"}
                  </dt>
                  <dd className="mt-1 font-bold">
                    {isAgent
                      ? currentPlan?.listingLimit || "—"
                      : (subscription?.usage?.contactsUsed ?? 0)}
                  </dd>
                </div>
              </dl>

              {!isAgent && left === 0 && (
                <p className="mt-4 flex items-start gap-2 rounded-2xl bg-primary/5 p-3 text-sm text-[#1a1a1a]">
                  <CircleAlert size={16} className="mt-0.5 flex-shrink-0 text-primary" />
                  You&apos;ve used all your points. Chats you already started
                  stay free. Top up to reach new agents.
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={scrollToPlans}
                  className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-secondary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#08744a]"
                >
                  <Sparkles size={16} />
                  {isAgent ? "Renew or upgrade" : "Top up points"}
                </button>
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="h-11 cursor-pointer rounded-full px-4 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#1a1a1a]"
                >
                  Cancel plan
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Your plan
              </p>
              <div className="mt-4 flex items-start gap-4">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#f7f7f5]">
                  <Lock size={20} className="text-gray-400" />
                </span>
                <div>
                  <h2 className="font-poppins text-xl font-semibold">
                    {hadPlan ? `Your ${planName} plan has ended` : "No active plan"}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    {isAgent
                      ? "Choose a plan below to keep your listings in front of huttspotters."
                      : hadPlan
                        ? "Any points left were cleared when it ended. Subscribe again to reach new agents; chats you already started are still free."
                        : "You need a plan to contact agents. Each new agent uses 1 point, and every message after that is free."}
                  </p>
                </div>
              </div>
              <button
                onClick={scrollToPlans}
                className="mt-6 flex h-11 cursor-pointer items-center gap-2 rounded-full bg-secondary px-6 text-sm font-semibold text-white transition-colors hover:bg-[#08744a]"
              >
                See plans <ArrowRight size={16} />
              </button>
            </>
          )}
        </section>

        {/* How it works */}
        <section className="rounded-3xl bg-[#f3efe6] p-6 sm:p-7">
          <h2 className="font-poppins text-lg font-semibold">
            {isAgent ? "How plans work" : "How points work"}
          </h2>
          <ol className="mt-5 flex flex-col gap-4">
            {(isAgent
              ? [
                  {
                    icon: Home,
                    title: "List your properties",
                    text: "Each plan sets how many listings you can have live.",
                  },
                  {
                    icon: CalendarClock,
                    title: "30 days at a time",
                    text: "Renew before it ends and the new days are added on.",
                  },
                  {
                    icon: MessageCircle,
                    title: "Replies are always free",
                    text: "Answer every inquiry you receive at no cost.",
                  },
                ]
              : [
                  {
                    icon: Coins,
                    title: "1 point per new agent",
                    text: "Sending your first inquiry to an agent uses 1 point.",
                  },
                  {
                    icon: MessageCircle,
                    title: "Follow-ups are free",
                    text: "Keep chatting, or ask the same agent about other listings, at no cost.",
                  },
                  {
                    icon: CalendarClock,
                    title: "Points last 30 days",
                    text: "Buy again before they expire and the new points are added on.",
                  },
                ]
            ).map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex gap-3">
                <span className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white">
                  <Icon size={16} className="text-secondary" />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                </span>
                <div>
                  <p className="font-bold">{title}</p>
                  <p className="text-sm leading-relaxed text-gray-500">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* ── Plans ─────────────────────────────────────────────── */}
      <section ref={plansRef} className="scroll-mt-24 pt-10 lg:pt-14">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-poppins text-xl font-semibold sm:text-2xl">
              {active ? "Top up or upgrade" : "Choose a plan"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {active
                ? "Buying now adds to what you have and extends your expiry."
                : "One-time payment. No auto-renewal."}
            </p>
          </div>
        </div>

        {buyError && (
          <p className="mb-4 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <CircleAlert size={16} className="mt-0.5 flex-shrink-0" />
            {buyError}
          </p>
        )}

        {plansLoading ? (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 lg:gap-6">
            <PlanCardSkeleton />
            <PlanCardSkeleton />
          </div>
        ) : plansError ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
            <p className="font-semibold">We couldn&apos;t load the plans</p>
            <p className="mt-1 text-sm text-gray-500">{plansError}</p>
            <button
              onClick={loadPlans}
              className="mx-auto mt-5 flex h-11 cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-6 text-sm font-semibold hover:bg-gray-50"
            >
              <RefreshCw size={15} /> Try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 lg:gap-6">
            {plans.map((plan) => {
              const featured =
                cheapestPerPoint === plan.id ||
                (!cheapestPerPoint && plan === plans[plans.length - 1] && plans.length > 1);
              const isCurrent = active && subscription?.plan === plan.id;
              const perPoint =
                plan.points > 0 ? plan.priceNaira / plan.points : 0;
              const perks = isAgent
                ? [
                    plan.listingLimit
                      ? `Up to ${plan.listingLimit} live listings`
                      : "List your properties",
                    `${plan.durationDays} days of visibility`,
                    "Reply to every inquiry for free",
                  ]
                : [
                    `Contact ${plan.points} different agents`,
                    "Free follow-ups with agents you've contacted",
                    `Valid for ${plan.durationDays} days`,
                  ];

              return (
                <article
                  key={plan.id}
                  className={`relative flex flex-col rounded-3xl p-6 sm:p-7 ${
                    featured
                      ? "theme-keep bg-[#1a1a1a] text-white"
                      : "border border-gray-100 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-poppins text-lg font-semibold">
                        {plan.name}
                      </h3>
                      <p
                        className={`mt-1 text-sm ${
                          featured ? "text-white/60" : "text-gray-500"
                        }`}
                      >
                        {plan.description}
                      </p>
                    </div>
                    {featured && (
                      <span className="flex-shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                        Best value
                      </span>
                    )}
                    {isCurrent && !featured && (
                      <span className="flex-shrink-0 rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex items-end gap-1.5">
                    <span className="font-poppins text-4xl font-semibold tracking-tight">
                      {formatNaira(plan.priceNaira)}
                    </span>
                    <span
                      className={`pb-1 text-sm ${
                        featured ? "text-white/60" : "text-gray-500"
                      }`}
                    >
                      / {plan.durationDays} days
                    </span>
                  </div>

                  {!isAgent && plan.points > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                          featured
                            ? "bg-white/10 text-white"
                            : "bg-secondary/10 text-secondary"
                        }`}
                      >
                        <Coins size={13} /> {plan.points} points
                      </span>
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          featured
                            ? "bg-white/10 text-white/80"
                            : "bg-[#f7f7f5] text-gray-500"
                        }`}
                      >
                        {formatNaira(perPoint)} per agent
                      </span>
                    </div>
                  )}

                  <ul className="mt-6 flex flex-1 flex-col gap-3">
                    {perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2.5 text-sm">
                        <span
                          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                            featured ? "bg-secondary" : "bg-secondary/10"
                          }`}
                        >
                          <Check
                            size={12}
                            strokeWidth={3}
                            className={featured ? "text-white" : "text-secondary"}
                          />
                        </span>
                        <span className={featured ? "text-white/85" : ""}>
                          {perk}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleBuy(plan)}
                    disabled={!!buying}
                    className={`mt-7 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      featured
                        ? "bg-secondary text-white hover:bg-[#08744a]"
                        : "border border-gray-200 bg-white text-[#1a1a1a] hover:bg-gray-50"
                    }`}
                  >
                    {buying === plan.id ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Opening Paystack...
                      </>
                    ) : active ? (
                      isAgent ? (
                        `Renew with ${plan.name}`
                      ) : (
                        `Add ${plan.points} points`
                      )
                    ) : (
                      `Get ${plan.name}`
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        )}

        <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-gray-500">
          <ShieldCheck size={15} className="flex-shrink-0 text-secondary" />
          Secure checkout by Paystack. Pay with card, bank transfer or USSD.
        </p>
      </section>

      {/* ── Payment history ───────────────────────────────────── */}
      <section className="pt-10 lg:pt-14">
        <h2 className="mb-4 font-poppins text-xl font-semibold sm:text-2xl">
          Payment history
        </h2>
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
          {paymentsLoading ? (
            <div className="animate-pulse divide-y divide-gray-100">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 p-5">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <SkeletonText className="w-32" />
                    <SkeletonText className="mt-2 w-20" />
                  </div>
                  <SkeletonText className="w-16" />
                </div>
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f7f5]">
                <Receipt size={20} className="text-gray-400" />
              </span>
              <p className="mt-3 font-semibold">No payments yet</p>
              <p className="mt-1 text-sm text-gray-500">
                Your receipts will show up here after you buy a plan.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {payments.map((p) => {
                const name =
                  plans.find((pl) => pl.id === p.plan)?.name ??
                  p.plan.charAt(0) + p.plan.slice(1).toLowerCase().replace(/_/g, " ");
                return (
                  <li
                    key={p.reference}
                    className="flex items-center gap-3 px-5 py-4 sm:gap-4"
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#f7f7f5]">
                      <CreditCard size={17} className="text-gray-500" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">
                        {name}
                        {p.points > 0 && (
                          <span className="font-semibold text-gray-500">
                            {" "}
                            · {p.points} points
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {formatDate(p.paidAt || p.createdAt)}
                        {p.channel && ` · ${p.channel.replace(/_/g, " ")}`}
                        <span className="hidden sm:inline"> · {p.reference}</span>
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                      <p className="font-poppins font-semibold">
                        {formatNaira(p.amountNaira)}
                      </p>
                      {checking.has(p.reference) ? (
                        <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Checking
                        </span>
                      ) : p.status?.toUpperCase() === "PENDING" ? (
                        <button
                          onClick={() => recheckPayment(p.reference)}
                          className="flex cursor-pointer items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary/15"
                        >
                          <RefreshCw size={11} /> Pending · Check
                        </button>
                      ) : (
                        <StatusChip status={p.status} />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* ── Cancel confirmation ───────────────────────────────── */}
      {confirmCancel && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:px-6"
          onClick={() => !cancelling && setConfirmCancel(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-t-3xl bg-white px-6 pb-10 pt-6 sm:max-w-[420px] sm:rounded-3xl sm:p-8"
          >
            <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-gray-200 sm:hidden" />
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <CircleAlert size={22} className="text-red-500" />
              </span>
              <button
                onClick={() => setConfirmCancel(false)}
                aria-label="Close"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <h2 className="mt-4 font-poppins text-xl font-semibold">
              Cancel your {planName} plan?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              It ends right away
              {!isAgent && left > 0 && (
                <>
                  {" "}
                  and your remaining{" "}
                  <span className="font-bold text-[#1a1a1a]">
                    {left} {left === 1 ? "point is" : "points are"}
                  </span>{" "}
                  lost
                </>
              )}
              . This can&apos;t be undone and payments aren&apos;t refunded.
            </p>
            {cancelError && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {cancelError}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={() => setConfirmCancel(false)}
                disabled={cancelling}
                className="h-12 flex-1 cursor-pointer rounded-full border border-gray-200 bg-white text-sm font-semibold hover:bg-gray-50"
              >
                Keep my plan
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-red-500 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
              >
                {cancelling && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {cancelling ? "Cancelling..." : "Cancel plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
