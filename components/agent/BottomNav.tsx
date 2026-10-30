"use client";

import { usePathname, useRouter } from "next/navigation";
import { useUnreadChats, formatBadge } from "@/lib/useUnreadChats";
import { useUser } from "@/context/UserContext";
import { Home, List, MessageCircle, LayoutGrid } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/agent/dashboard" },
  { icon: List, label: "Listings", path: "/agent/listings" },
  { icon: MessageCircle, label: "Chat", path: "/agent/chat" },
  { icon: LayoutGrid, label: "More", path: "/agent/more" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const unread = useUnreadChats("/agent/chat", user?.id);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex min-w-16 cursor-pointer flex-col items-center justify-center gap-1 py-1"
            >
              <span
                className={`relative flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
                  isActive ? "bg-secondary/10" : ""
                }`}
              >
                <Icon
                  size={21}
                  className={isActive ? "text-secondary" : "text-gray-400"}
                />
                {item.label === "Chat" && unread > 0 && (
                  <span
                    aria-label={`${unread} unread messages`}
                    className="absolute -top-1 right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-primary px-1 text-[10px] font-bold leading-none text-white"
                  >
                    {formatBadge(unread)}
                  </span>
                )}
              </span>
              <span
                className={`text-[11px] font-semibold ${isActive ? "text-secondary" : "text-gray-500"}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
