"use client";

import { useState } from "react";
import { BottomNav, SideNav } from "@/components/agent";
import { Menu } from "lucide-react";
import { logo } from "@/assets";
import { UserProvider, useUser } from "@/context/UserContext";

// Inner layout that has access to UserContext
function AgentLayoutInner({ children }: { children: React.ReactNode }) {
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const { user, loading } = useUser();

  const sideNavUser = {
    name: user?.name ?? "...",
    role: user?.accountMode === "AGENT" ? "Agent" : "Huttspoter",
    avatar: user?.profilePhoto,
  };

  return (
    <div className="max-w-full mx-auto min-h-screen bg-[#f0f0f0] relative">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-4 py-5 bg-[#f0f0f0]">
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
      <SideNav
        isOpen={sideNavOpen}
        onClose={() => setSideNavOpen(false)}
        user={sideNavUser}
      />

      {/* Page content */}
      <main className="pb-24">{children}</main>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}

// Outer layout wraps everything with UserProvider
export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <AgentLayoutInner>{children}</AgentLayoutInner>
    </UserProvider>
  );
}
