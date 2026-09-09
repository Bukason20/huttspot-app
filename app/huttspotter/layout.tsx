"use client";

import { useState } from "react";
import { HuttspotterBottomNav } from "@/components/huttspotter/BottomNav";
import { HuttspotterSideNav } from "@/components/huttspotter/SideNav";
import { Menu } from "lucide-react";
import { logo } from "@/assets";
import { UserProvider, useUser } from "@/context/UserContext";

function HuttspotterLayoutInner({ children }: { children: React.ReactNode }) {
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const { user } = useUser();

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-[#f5f5f5] relative">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-4 py-5 bg-[#f5f5f5]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSideNavOpen(true)}
            className="cursor-pointer"
          >
            <Menu size={24} className="text-primary" />
          </button>
          <img src={logo} alt="HuttSpot" className="w-22" />
        </div>
      </nav>

      {/* Side Nav */}
      <HuttspotterSideNav
        isOpen={sideNavOpen}
        onClose={() => setSideNavOpen(false)}
        user={{
          name: user?.name ?? "...",
          role: "Hutt spoter",
          avatar: user?.profilePhoto,
        }}
      />

      {/* Page content */}
      <main className="pb-24">{children}</main>

      {/* Bottom Nav */}
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
