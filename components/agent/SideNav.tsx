"use client";

import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: LayoutGrid, label: "Dashboard", path: "/agent/dashboard" },
  { icon: MessageCircle, label: "Chat", path: "/agent/chat" },
  { icon: Star, label: "Subscription", path: "/agent/subscription" },
  { icon: Bookmark, label: "Saved Listings", path: "/agent/saved" },
  { icon: MapPin, label: "Location", path: "/agent/location" },
  { icon: Settings, label: "Settings", path: "/agent/settings" },
];

interface SideNavProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
}

export default function SideNav({ isOpen, onClose, user }: SideNavProps) {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 left-0 h-full w-[75%] max-w-[300px] bg-[#9e9e9e]/90 backdrop-blur-sm z-50 flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-white"
        >
          <X size={22} />
        </button>

        {/* User info */}
        <div className="px-6 pt-14 pb-6">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-lg">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-white font-bold text-lg leading-tight">
                {user.name}
              </p>
              <p className="text-white/70 text-sm">{user.role}</p>
            </div>
          </div>
          <div className="h-px bg-white/20 mt-6" />
        </div>

        {/* Nav items */}
        <div className="flex flex-col flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className="flex items-center gap-4 px-6 py-4 text-white hover:bg-white/10 cursor-pointer transition-colors border-b border-white/10"
              >
                <Icon size={20} color="#fff" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom — avatar icon + dark/light toggle */}
        <div className="px-6 pb-10 flex flex-col gap-4">
          {/* Profile icon */}
          <button className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center cursor-pointer">
            <LayoutGrid size={20} color="#fff" />
          </button>

          {/* Dark/light toggle */}
          <div className="w-12 bg-white rounded-full flex flex-col items-center py-1 gap-1">
            <button
              onClick={() => setIsDark(true)}
              className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                isDark ? "bg-secondary" : "bg-transparent"
              }`}
            >
              <Moon size={18} color={isDark ? "#fff" : "#9ca3af"} />
            </button>
            <button
              onClick={() => setIsDark(false)}
              className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                !isDark ? "bg-gray-100" : "bg-transparent"
              }`}
            >
              <Sun size={18} color={!isDark ? "#374151" : "#9ca3af"} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
