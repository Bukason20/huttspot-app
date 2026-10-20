"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, MessageCircle } from "lucide-react";
import PropertySection from "@/components/home/PropertySection";
import { getAllProperties } from "@/lib/properties";
import { toggleSaveProperty } from "@/lib/userProperties";
import { Property } from "@/lib/types";
import HeroSection from "@/components/home/HeroSection";
import { communityImg2 } from "@/assets";

// Property type categories — matches your backend types
const PROPERTY_CATEGORIES = [
  "Self-Contained",
  "Flat / Apartment",
  "Shop",
  "Duplex",
  "Bungalow",
  "Office Space",
  "Land",
  "Room",
];

export default function HomePage() {
  const router = useRouter();
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAllProperties({ limit: 100 });
        setAllProperties(res.data);
      } catch (err) {
        console.error("Failed to load properties:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSaveToggle = useCallback(async (id: string) => {
    try {
      await toggleSaveProperty(id);
      setSavedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    } catch (err) {
      console.error("Failed to toggle save:", err);
    }
  }, []);

  // Group properties by type
  const grouped = PROPERTY_CATEGORIES.map((category) => ({
    title: category,
    properties: allProperties.filter(
      (p) => p.type?.toLowerCase() === category.toLowerCase(),
    ),
  })).filter((g) => g.properties.length > 0); // only show categories that have listings

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          {/* Hamburger */}
          <div className="flex flex-col gap-1 cursor-pointer">
            <span className="block w-5 h-0.5 bg-primary rounded" />
            <span className="block w-4 h-0.5 bg-primary rounded" />
            <span className="block w-5 h-0.5 bg-primary rounded" />
          </div>
          <span className="text-xl font-extrabold text-secondary">
            Hutt<span className="text-primary">Spot</span>
          </span>
        </div>
        <button
          onClick={() => router.push("/auth?mode=signup")}
          className="text-sm font-semibold text-[#1a1a1a] cursor-pointer"
        >
          Become an Agent
        </button>
      </nav>

      {/* Hero section */}
      <div className="px-5 mb-6">
        <HeroSection />
      </div>

      {/* Property sections — each animates in with intersection observer */}
      {loading ? (
        // Skeleton placeholders while loading
        <div className="px-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-6 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-3.5 w-36 bg-gray-200 rounded-full" />
                <div className="h-3.5 w-8 bg-gray-200 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="rounded-xl overflow-hidden">
                    <div className="h-24 bg-gray-200" />
                    <div className="pt-1 flex flex-col gap-1">
                      <div className="h-2.5 w-16 bg-gray-200 rounded-full" />
                      <div className="h-5 w-16 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        grouped.map((group) => (
          <PropertySection
            key={group.title}
            title={group.title}
            properties={group.properties}
            onSaveToggle={handleSaveToggle}
            savedIds={savedIds}
          />
        ))
      )}

      {/* View more / View agents */}
      {!loading && allProperties.length > 0 && (
        <div className="flex items-center gap-3 px-5 mb-8">
          <button
            onClick={() => router.push("/huttspotter/dashboard")}
            className="flex-1 border border-gray-200 text-[#1a1a1a] rounded-full py-3 text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
          >
            View more listings
          </button>
          <button className="flex-1 border border-gray-200 text-[#1a1a1a] rounded-full py-3 text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors">
            View agents
          </button>
        </div>
      )}

      {/* Subscription section */}
      <div className="px-5 mb-8">
        <h2 className="text-xl font-bold text-center text-[#1a1a1a] mb-1">
          Choose Subscription
        </h2>
        <p className="text-sm text-center text-gray-400 mb-5">
          Unlock Full Access
        </p>

        {[
          {
            name: "Standard Plan",
            price: "₦1,800",
            features: [
              "Full access to verified listings",
              "Chat with up to 3 verified agents",
              "Save favourite homes & feature",
              "Renew anytime, no commitment",
            ],
          },
          {
            name: "Premium Plan",
            price: "₦3,000",
            features: [
              "Unlimited access to all listings",
              "Direct chat with all verified agents",
              "Roommate finder feature",
              "Early access to new apartments",
              "Priority support from the HuttSpot team",
            ],
          },
        ].map((plan) => (
          <div
            key={plan.name}
            className="border-2 border-secondary rounded-2xl p-5 mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-[#1a1a1a]">{plan.name}</p>
              <p className="font-bold text-[#1a1a1a]">{plan.price}</p>
            </div>
            <ul className="flex flex-col gap-1.5 mb-4">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-gray-500"
                >
                  <span className="text-secondary mt-0.5 flex-shrink-0">•</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push("/auth?mode=signup")}
              className="w-full bg-secondary text-white rounded-full py-3 text-sm font-semibold cursor-pointer"
            >
              Subscribe Now
            </button>
          </div>
        ))}
      </div>

      {/* Community section */}
      <div className="px-5 pb-12 text-center">
        <p className="text-lg font-bold">
          <span className="text-secondary">HuttSpot</span>{" "}
          <span className="text-primary">Community</span>
        </p>
        <p className="text-xs text-gray-400 mt-2 mb-5 leading-relaxed">
          Here, people connect. Students find roommates, agents meet real
          clients, small businesses grabs shops. We stay build trust for the
          city.
        </p>

        <img src={communityImg2} alt="" />
        <button
          onClick={() => router.push("/auth?mode=signup")}
          className="bg-secondary text-white rounded-full px-10 py-3 text-sm font-semibold cursor-pointer"
        >
          Join Now
        </button>
      </div>

      {/* Floating chat button */}
      <button className="fixed bottom-7 left-5 w-12 h-12 rounded-full bg-primary flex items-center justify-center cursor-pointer shadow-lg shadow-primary/40">
        <MessageCircle size={22} color="#fff" fill="#fff" />
      </button>
    </div>
  );
}
