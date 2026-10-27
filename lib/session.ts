"use client";

import { useEffect, useState } from "react";
import { getUserProfile } from "./user";
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

    const token = localStorage.getItem("token");
    if (!token) {
      setSession({ status: "guest" });
      return;
    }

    getUserProfile()
      .then((profile) => {
        if (cancelled) return;
        setSession({
          status: "user",
          isOnboarded: !!profile.isOnboarded,
          accountMode: profile.accountMode,
        });
      })
      .catch((err: any) => {
        if (cancelled) return;
        // Expired / invalid token → treat as signed out
        if (err?.status === 401 || err?.status === 403) {
          setSession({ status: "guest" });
          return;
        }
        // Network hiccup → fall back to what was saved at login
        try {
          const saved = JSON.parse(localStorage.getItem("user") ?? "null");
          setSession({
            status: "user",
            isOnboarded: !!saved?.isOnboarded,
            accountMode: saved?.accountMode,
          });
        } catch {
          setSession({ status: "guest" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return session;
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
