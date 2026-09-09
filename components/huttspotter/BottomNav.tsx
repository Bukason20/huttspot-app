"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Bookmark, MessageCircle, LayoutGrid } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/huttspotter/dashboard" },
  { icon: Bookmark, label: "Saved", path: "/huttspotter/saved" },
  { icon: MessageCircle, label: "Chat", path: "/huttspotter/chat" },
  { icon: LayoutGrid, label: "More", path: "/huttspotter/more" },
];

export function HuttspotterBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-100 px-6 py-3 flex items-center justify-between z-40">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const isChat = item.label === "Chat";
        const Icon = item.icon;

        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center justify-center cursor-pointer relative ${
              isChat
                ? "w-14 h-14 rounded-full bg-secondary -translate-y-3 shadow-lg shadow-secondary/40"
                : "gap-1"
            }`}
          >
            <Icon
              size={isChat ? 24 : 22}
              color={isChat ? "#fff" : isActive ? "#2d6a4f" : "#9ca3af"}
              fill={isChat ? "#fff" : "none"}
            />
            {!isChat && (
              <span
                className={`text-[10px] font-medium ${isActive ? "text-secondary" : "text-gray-400"}`}
              >
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
