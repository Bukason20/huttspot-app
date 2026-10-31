"use client";

import { useScreenLoader } from "@/components/ui/ScreenLoader";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  ArrowLeft,
  User,
  Bookmark,
  MapPin,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function HuttspotterSettingsPage() {
  const router = useRouter();
  const loader = useScreenLoader();
  const { user } = useUser();
  const [notificationsOn, setNotificationsOn] = useState(true);

  const menuItems = [
    {
      icon: User,
      label: "Personal info",
      path: "/huttspotter/settings/personal-info",
    },
    { icon: Bookmark, label: "Saved Listings", path: "/huttspotter/listings?tab=saved" },
    {
      icon: MapPin,
      label: "Addresses",
      path: "/huttspotter/settings/addresses",
    },
    {
      icon: HelpCircle,
      label: "Help & support",
      path: "/huttspotter/settings/help",
    },
  ];

  const handleLogout = () => {
    loader.show("Signing you out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("accountMode");
    router.push("/auth/signin");
  };

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-white px-5 pt-4">
      {/* Back */}
      <button onClick={() => router.back()} className="cursor-pointer mb-6">
        <ArrowLeft size={22} />
      </button>

      {/* Avatar + name */}
      <div className="flex flex-col items-center mb-8">
        {user?.profilePhoto ? (
          <img
            src={user.profilePhoto}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover mb-3"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#a0a8e0] flex items-center justify-center mb-3">
            <span className="text-white text-3xl font-bold">
              {user?.name?.charAt(0) ?? "?"}
            </span>
          </div>
        )}
        <h2 className="text-xl font-bold text-[#1a1a1a]">
          {user?.name?.split(" ")[0] ?? "..."}
        </h2>
        <p className="text-sm text-gray-400">{user?.email ?? ""}</p>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-3">
        {menuItems.map(({ icon: Icon, label, path }) => (
          <button
            key={label}
            onClick={() => router.push(path)}
            className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
              <Icon size={18} className="text-gray-500" />
            </div>
            <span className="flex-1 text-sm font-medium text-[#1a1a1a] text-left">
              {label}
            </span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        ))}

        {/* Notification toggle */}
        <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-4">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
            <Bell size={18} className="text-gray-500" />
          </div>
          <span className="flex-1 text-sm font-medium text-[#1a1a1a]">
            Notification
          </span>
          <button
            onClick={() => setNotificationsOn(!notificationsOn)}
            className={`w-12 h-6 rounded-full transition-all duration-300 cursor-pointer relative ${
              notificationsOn ? "bg-secondary" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${
                notificationsOn ? "left-6" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-4 cursor-pointer hover:bg-red-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
            <LogOut size={18} className="text-red-400" />
          </div>
          <span className="flex-1 text-sm font-medium text-red-400 text-left">
            Log out
          </span>
          <ChevronRight size={16} className="text-red-300" />
        </button>
      </div>
    </div>
  );
}
