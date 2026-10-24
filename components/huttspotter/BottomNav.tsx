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
                className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
                  isActive ? "bg-secondary/10" : ""
                }`}
              >
                <Icon
                  size={21}
                  className={isActive ? "text-secondary" : "text-gray-400"}
                />
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
