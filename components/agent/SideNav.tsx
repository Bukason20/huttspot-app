"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  MessageCircle,
  Star,
  Bookmark,
  MapPin,
  Settings,
  X,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { logo } from "@/assets";
import { useTheme } from "@/lib/theme";
import { useUnreadChats, formatBadge } from "@/lib/useUnreadChats";
import { useUser } from "@/context/UserContext";

const navItems = [
  { icon: LayoutGrid, label: "Dashboard", path: "/agent/dashboard" },
  { icon: MessageCircle, label: "Chat", path: "/agent/chat" },
  { icon: Star, label: "Subscription", path: "/agent/subscription" },
  { icon: Bookmark, label: "Saved Listings", path: "/agent/saved" },
  { icon: MapPin, label: "Location", path: "/agent/location" },
  { icon: Settings, label: "Settings", path: "/agent/settings" },
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

function NavList({ onNavigate }: { onNavigate: (path: string) => void }) {
  const pathname = usePathname();
  const { user } = useUser();
  const unread = useUnreadChats("/agent/chat", user?.id);

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname?.startsWith(item.path);
        return (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-semibold transition-colors ${
              isActive
                ? "bg-secondary/10 text-secondary"
                : "text-tertiary hover:bg-gray-50 hover:text-[#1a1a1a]"
            }`}
          >
            <Icon size={19} />
            {item.label}
            {item.label === "Chat" && unread > 0 && (
              <span
                aria-label={`${unread} unread messages`}
                className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white"
              >
                {formatBadge(unread)}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

function ThemeToggle() {
  // Shared, saved theme (lib/theme.ts) — every toggle stays in sync
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const setIsDark = (dark: boolean) => setTheme(dark ? "dark" : "light");
  return (
    <div className="grid grid-cols-2 gap-1 rounded-full bg-[#f2f2f0] p-1">
      <button
        onClick={() => setIsDark(false)}
        aria-pressed={!isDark}
        className={`flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors ${
          !isDark ? "bg-white text-[#1a1a1a] shadow-sm" : "text-gray-500"
        }`}
      >
        <Sun size={15} /> Light
      </button>
      <button
        onClick={() => setIsDark(true)}
        aria-pressed={isDark}
        className={`flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors ${
          isDark ? "bg-secondary text-white shadow-sm" : "text-gray-500"
        }`}
      >
        <Moon size={15} /> Dark
      </button>
    </div>
  );
}

// Clears the session — same steps as before, shared by drawer + desktop nav
function clearSession() {
  // Clear all auth data
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("accountMode");
  localStorage.removeItem("huttspot_onboarding");

  // Clear cookie
  document.cookie = "token=; path=/; max-age=0; SameSite=Lax";

  // Disconnect socket
  // disconnectSocket();
}

function LogoutButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold text-red-500 transition-colors hover:bg-red-50"
    >
      <LogOut size={19} />
      Log out
    </button>
  );
}

// ── Mobile / tablet drawer ─────────────────────────────────────
export default function SideNav({ isOpen, onClose, user }: SideNavProps) {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleLogout = () => {
    clearSession();
    onClose();
    router.push("/auth/signin");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Drawer */}
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
          <NavList onNavigate={handleNavigate} />
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
          <ThemeToggle />
          <LogoutButton onClick={handleLogout} />
        </div>
      </aside>
    </>
  );
}

// ── Desktop sidebar (lg and up) ───────────────────────────────
export function DesktopSideNav({ user }: { user: SideNavUser }) {
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
        <NavList onNavigate={(path) => router.push(path)} />
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
        <ThemeToggle />
        <UserCard user={user} />
        <LogoutButton onClick={handleLogout} />
      </div>
    </aside>
  );
}
