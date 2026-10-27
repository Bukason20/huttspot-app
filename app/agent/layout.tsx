"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav, SideNav, DesktopSideNav } from "@/components/agent";
import { Menu } from "lucide-react";
import { logo } from "@/assets";
import { UserProvider, useUser } from "@/context/UserContext";
import { ListingProvider } from "@/context/ListingContext";

// Inner layout that has access to UserContext
function AgentLayoutInner({ children }: { children: React.ReactNode }) {
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const { user, loading } = useUser();
  const router = useRouter();

  // Not onboarded yet → back to onboarding (it resumes where they left off)
  const needsOnboarding = !!user && !user.isOnboarded;
  useEffect(() => {
    if (needsOnboarding) router.replace("/onboarding");
  }, [needsOnboarding, router]);

  const sideNavUser = {
    name: user?.name ?? "...",
    role: user?.accountMode === "AGENT" ? "Agent" : "Huttspoter",
    avatar: user?.profilePhoto,
  };

  if (needsOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f7f7f5] font-nunito text-[#1a1a1a]">
      {/* Desktop sidebar (lg+) */}
      <DesktopSideNav user={sideNavUser} />

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
          {sideNavUser.avatar ? (
            <img
              src={sideNavUser.avatar}
              alt={sideNavUser.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">
              {sideNavUser.name.charAt(0)}
            </div>
          )}
        </nav>

        {/* Side Nav drawer (mobile & tablet) */}
        <SideNav
          isOpen={sideNavOpen}
          onClose={() => setSideNavOpen(false)}
          user={sideNavUser}
        />

        {/* Page content */}
        <main className="mx-auto max-w-6xl pb-28 sm:px-3 lg:px-5 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Bottom Nav (mobile & tablet) */}
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
      <ListingProvider>
        <AgentLayoutInner>{children}</AgentLayoutInner>
      </ListingProvider>
    </UserProvider>
  );
}
