"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Bookmark, List, MessageCircle, LayoutGrid } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/agent/dashboard" },
  { icon: List, label: "Listings", path: "/agent/listings" },
  { icon: MessageCircle, label: "Chat", path: "/agent/chat" },
  { icon: LayoutGrid, label: "More", path: "/agent/more" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-100 px-6 py-3 flex items-center justify-between z-40">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;

        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center justify-center cursor-pointer relative gap-1`}
          >
            <Icon
              size={22}
              color={isActive ? "#2d6a4f" : "#9ca3af"}
              fill={"none"}
            />
          </button>
        );
      })}
    </div>
  );
}
