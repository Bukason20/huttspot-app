"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const KEY = "huttspot_theme";
const listeners = new Set<() => void>();

function read(): Theme {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

/** Save the theme, apply it to <html data-theme>, and notify every toggle. */
export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* private mode etc. — still apply for this visit */
  }
  document.documentElement.dataset.theme = theme;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Dashboard light / dark theme. The choice is stored in localStorage and
 * applied before first paint by a tiny script in app/layout.tsx; the CSS
 * tokens in globals.css switch under [data-theme="dark"] .hs-themed.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);
  return { theme, setTheme };
}
