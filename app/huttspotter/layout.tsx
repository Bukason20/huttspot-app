"use client";

import { useState } from "react";
import { HuttspotterBottomNav } from "@/components/huttspotter/BottomNav";
import {
  HuttspotterSideNav,
  HuttspotterDesktopNav,
} from "@/components/huttspotter/SideNav";
import { Menu } from "lucide-react";
import { logo } from "@/assets";
import { UserProvider, useUser } from "@/context/UserContext";

function HuttspotterLayoutInner({ children }: { children: React.ReactNode }) {
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const { user } = useUser();

  const navUser = {
    name: user?.name ?? "...",
    role: "Hutt spoter",
    avatar: user?.profilePhoto,
  };

  return (
    <div className="relative min-h-screen bg-[#f7f7f5] font-nunito text-[#1a1a1a]">
      {/* Desktop sidebar (lg+) */}
      <HuttspotterDesktopNav user={navUser} />

      <div className="lg:pl-[264px]">
        {/* Top Navbar (mobile & tablet) */}
        <nav className="sticky top-0 z-30 flex items-center justify-between bg-[#f7f7f5] px-5 py-4 sm:px-8 lg:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSideNavOpen(true)}
              aria-label="Open menu"
              className="-ml-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-black/5"
            >
              <Menu size={22} className="text-[#1a1a1a]" />
            </button>
            <img src={logo} alt="HuttSpot" className="h-7 w-auto" />
          </div>
          {navUser.avatar ? (
            <img
              src={navUser.avatar}
              alt={navUser.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">
              {navUser.name.charAt(0)}
            </div>
          )}
        </nav>

        {/* Side Nav drawer (mobile & tablet) */}
        <HuttspotterSideNav
          isOpen={sideNavOpen}
          onClose={() => setSideNavOpen(false)}
          user={navUser}
        />

        {/* Page content */}
        <main className="mx-auto max-w-6xl pb-28 sm:px-3 lg:px-5 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Bottom Nav (mobile & tablet) */}
      <HuttspotterBottomNav />
    </div>
  );
}

export default function HuttspotterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <HuttspotterLayoutInner>{children}</HuttspotterLayoutInner>
    </UserProvider>
  );
}
