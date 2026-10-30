"use client";

import { Home } from "lucide-react";
import { Participant, PropertySnapshot } from "@/lib/chat";

// ── Time labels ────────────────────────────────────────────────

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export function formatClock(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Conversation list: 14:05 · Yesterday · Mon · 12 Oct */
export function formatListTime(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  if (sameDay(d, now)) return formatClock(dateStr);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return "Yesterday";
  if (now.getTime() - d.getTime() < 6 * 86_400_000)
    return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

/** Separator between days in a conversation: Today · Yesterday · Monday · 12 October 2026 */
export function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  if (sameDay(d, now)) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return "Yesterday";
  if (now.getTime() - d.getTime() < 6 * 86_400_000)
    return d.toLocaleDateString([], { weekday: "long" });
  return d.toLocaleDateString([], {
    day: "numeric",
    month: "long",
    year: d.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

export function dayKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function roleLabel(p?: Participant): string {
  return p?.accountMode === "AGENT" ? "Agent" : "Huttspotter";
}

// ── Avatar ─────────────────────────────────────────────────────

export function Avatar({
  person,
  size = 44,
  className = "",
}: {
  person?: { name?: string; profilePhoto?: string };
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size };
  if (person?.profilePhoto) {
    return (
      <img
        src={person.profilePhoto}
        alt={person.name ?? ""}
        style={style}
        className={`flex-shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <span
      style={{ ...style, fontSize: Math.max(12, Math.round(size * 0.38)) }}
      className={`flex flex-shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-white ${className}`}
    >
      {person?.name?.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

// ── Property thumbnail ─────────────────────────────────────────

export function PropertyThumb({
  snapshot,
  size = 40,
  rounded = "rounded-xl",
}: {
  snapshot?: Pick<PropertySnapshot, "coverPhoto" | "title">;
  size?: number;
  rounded?: string;
}) {
  const style = { width: size, height: size };
  return snapshot?.coverPhoto ? (
    <img
      src={snapshot.coverPhoto}
      alt=""
      style={style}
      className={`flex-shrink-0 object-cover ${rounded}`}
    />
  ) : (
    <span
      style={style}
      className={`flex flex-shrink-0 items-center justify-center bg-gray-100 ${rounded}`}
    >
      <Home size={Math.round(size * 0.38)} className="text-gray-400" />
    </span>
  );
}

export function formatPrice(snapshot?: PropertySnapshot): string {
  if (!snapshot) return "";
  const price =
    typeof snapshot.price === "number"
      ? `₦${snapshot.price.toLocaleString()}`
      : "";
  return [price, snapshot.paymentType].filter(Boolean).join(" / ");
}
