"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  MessageCircle,
  Star,
  Building,
  MapPin,
  Settings,
  X,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { logo } from "@/assets";

const navItems = [
  { icon: LayoutGrid, label: "Dashboard", path: "/huttspotter/dashboard" },
  { icon: MessageCircle, label: "Chat", path: "/huttspotter/chat" },
  { icon: Star, label: "Subscription", path: "/huttspotter/subscription" },
  {
    icon: Building,
    label: "Listings",
    path: "/huttspotter/listings",
    // Also active on a listing's details page and the old saved page
    match: ["/huttspotter/listings", "/huttspotter/listing/", "/huttspotter/saved"],
  },
  { icon: MapPin, label: "Location", path: "/huttspotter/location" },
  { icon: Settings, label: "Settings", path: "/huttspotter/settings" },
];

interface SideNavUser {
  name: string;
  role: string;
  avatar?: string;
}

interface SideNavProps {
  isOpen: boolean;
  onClose: () => void;
  user: SideNavUser;
}

// Same session-clearing steps as before, shared by the drawer and desktop nav
function clearSession() {
  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("accountMode");
  localStorage.removeItem("huttspot_onboarding");

  // Clear cookie so middleware stops protecting routes
  document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
}

function UserCard({ user }: { user: SideNavUser }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#f7f7f5] p-3">
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="h-11 w-11 flex-shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-base font-bold text-white">
          {user.name.charAt(0)}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate font-bold leading-tight text-[#1a1a1a]">
          {user.name}
        </p>
        <p className="text-sm text-gray-500">{user.role}</p>
      </div>
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const paths = "match" in item && item.match ? item.match : [item.path];
        const isActive = paths.some((p) => pathname?.startsWith(p));
        return (
          <button
            key={item.path}
            onClick={() => {
              router.push(item.path);
              onNavigate?.();
            }}
            className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-semibold transition-colors ${
              isActive
                ? "bg-secondary/10 text-secondary"
                : "text-tertiary hover:bg-gray-50 hover:text-[#1a1a1a]"
            }`}
          >
            <Icon size={19} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  return (
    <div className="grid grid-cols-2 gap-1 rounded-full bg-[#f2f2f0] p-1">
      <button
        onClick={() => setIsDark(false)}
        className={`flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors ${
          !isDark ? "bg-white text-[#1a1a1a] shadow-sm" : "text-gray-500"
        }`}
      >
        <Sun size={15} /> Light
      </button>
      <button
        onClick={() => setIsDark(true)}
        className={`flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors ${
          isDark ? "bg-[#1a1a1a] text-white" : "text-gray-500"
        }`}
      >
        <Moon size={15} /> Dark
      </button>
    </div>
  );
}

// ── Mobile / tablet drawer ─────────────────────────────────────
export function HuttspotterSideNav({ isOpen, onClose, user }: SideNavProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogout = () => {
    clearSession();
    onClose();
    router.push("/auth/signin");
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <aside className="fixed left-0 top-0 z-50 flex h-full w-[85%] max-w-[320px] flex-col bg-white px-4 pb-6 pt-5 font-nunito">
        <div className="mb-6 flex items-center justify-between pl-2">
          <img src={logo} alt="HuttSpot" className="h-7 w-auto" />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <UserCard user={user} />

        <div className="mt-6 flex-1 overflow-y-auto">
          <NavList onNavigate={onClose} />
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut size={19} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Desktop sidebar (lg and up) ───────────────────────────────
export function HuttspotterDesktopNav({ user }: { user: SideNavUser }) {
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    router.push("/auth/signin");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-gray-100 bg-white px-4 pb-6 pt-7 lg:flex">
      <button
        onClick={() => router.push("/")}
        className="mb-8 cursor-pointer self-start pl-2"
        aria-label="HuttSpot home"
      >
        <img src={logo} alt="HuttSpot" className="h-8 w-auto" />
      </button>

      <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">
        Menu
      </p>
      <div className="flex-1 overflow-y-auto">
        <NavList />
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
        <ThemeToggle />
        <UserCard user={user} />
        <button
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}
