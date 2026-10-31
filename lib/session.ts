"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile } from "./user";
import { useScreenLoader } from "@/components/ui/ScreenLoader";
import { AccountMode } from "./types";

export type Session =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "user"; isOnboarded: boolean; accountMode?: AccountMode };

/**
 * Who is looking at a public page (e.g. the landing page)?
 *
 * The profile API is the source of truth: the "user" object saved in
 * localStorage at login is never updated after onboarding, so it can't be
 * trusted for isOnboarded.
 */
export function useSession(): Session {
  const [session, setSession] = useState<Session>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    resolveSession().then((s) => {
      if (!cancelled) setSession(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return session;
}

// Several components on one page (navbar, hero…) ask at the same time:
// share one profile request instead of sending one each.
let inflight: Promise<Session> | null = null;

function resolveSession(): Promise<Session> {
  const token = localStorage.getItem("token");
  if (!token) return Promise.resolve({ status: "guest" });
  if (inflight) return inflight;

  inflight = getUserProfile()
    .then(
      (profile): Session => ({
        status: "user",
        isOnboarded: !!profile.isOnboarded,
        accountMode: profile.accountMode,
      }),
    )
    .catch((err: any): Session => {
      // Expired / invalid token → treat as signed out
      if (err?.status === 401 || err?.status === 403) return { status: "guest" };
      // Network hiccup → fall back to what was saved at login
      try {
        const saved = JSON.parse(localStorage.getItem("user") ?? "null");
        return {
          status: "user",
          isOnboarded: !!saved?.isOnboarded,
          accountMode: saved?.accountMode,
        };
      } catch {
        return { status: "guest" };
      }
    })
    .finally(() => {
      // Don't cache past this page visit (e.g. after logging out)
      setTimeout(() => (inflight = null), 0);
    });
  return inflight;
}

/** Longest a click waits for the profile before deciding on the token alone */
const MAX_WAIT_MS = 4000;

/**
 * Buttons whose destination depends on the session stay clickable while the
 * session loads. A click made during loading is remembered (that button shows
 * a spinner) and carried out as soon as the session is known — or after
 * MAX_WAIT_MS, deciding on the token alone, so a slow network never leaves
 * the visitor stuck.
 *
 *   const { go, pendingKey } = useSessionNavigation(session);
 *   onClick={() => go("start", (s) => …route for s…)}
 */
export function useSessionNavigation(session: Session) {
  const router = useRouter();
  const loader = useScreenLoader();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const resolver = useRef<((s: Session) => string) | null>(null);

  // Run the remembered click once the session is known
  useEffect(() => {
    if (!resolver.current || session.status === "loading") return;
    router.push(resolver.current(session));
    resolver.current = null;
  }, [session, router]);

  // Safety net for very slow profile requests
  useEffect(() => {
    if (!pendingKey || session.status !== "loading") return;
    const t = setTimeout(() => {
      if (!resolver.current) return;
      router.push(resolver.current(session));
      resolver.current = null;
    }, MAX_WAIT_MS);
    return () => clearTimeout(t);
  }, [pendingKey, session, router]);

  const go = useCallback(
    (key: string, route: (s: Session) => string) => {
      setPendingKey(key); // keep showing progress until the page changes
      // On a slow connection the next page can take a moment to open
      loader.show();
      if (session.status === "loading") {
        resolver.current = route;
      } else {
        router.push(route(session));
      }
    },
    [session, router, loader],
  );

  return { go, pendingKey };
}

/** Where a signed-in user's "home" is: onboarding first, then their dashboard. */
export function homeRouteFor(session: Session): string {
  if (session.status === "loading") return gatedRoute(session, "/huttspotter/dashboard");
  if (session.status !== "user") return "/auth/signin";
  if (!session.isOnboarded) return "/onboarding";
  return session.accountMode === "AGENT"
    ? "/agent/dashboard"
    : "/huttspotter/dashboard";
}

/**
 * Where a signed-in-only destination should actually go for this visitor:
 * guests → sign in, not yet onboarded → onboarding, otherwise `target`.
 */
export function gatedRoute(session: Session, target: string): string {
  if (session.status === "loading") {
    // Profile still loading: decide on the token alone. If they turn out not
    // to be onboarded, the dashboard layouts send them to onboarding.
    const hasToken =
      typeof window !== "undefined" && !!localStorage.getItem("token");
    return hasToken ? target : "/auth/signin";
  }
  if (session.status === "guest") return "/auth/signin";
  if (!session.isOnboarded) return "/onboarding";
  return target;
}
