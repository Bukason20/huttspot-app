"use client";

import { useState } from "react";
import { Headset, Heart, Menu, MessageCircle } from "lucide-react";
import { heroAgent, heroClient, logo } from "@/assets";
import { listings } from "@/data";
import { useRouter } from "next/navigation";

export default function Home() {
  const [saved, setSaved] = useState<number[]>([]);
  const router = useRouter();

  const toggleSave = (id: number) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div className="max-w-[390px] relative mx-auto min-h-screen">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 py-5">
        <div className="flex gap-3 items-center">
          <Menu className="text-primary cursor-pointer" />
          <img src={logo} alt="" className="w-22 ml-auto" />
        </div>

        <button className="cursor-pointer text-[14px]">Become an Agent</button>
      </nav>

      {/* -------------------------HERO SECTION--------------------------------- */}
      <section>
        {/* Chat Bubbles */}
        <div className="relative pt-2 px-5 min-h-[100px]">
          {/* Left bubble — user */}
          <div className="bubble-left flex items-end relativew-fit">
            <img
              src={heroClient}
              alt="user"
              className="h-[42px] w-[42px] rounded-[50%] absolute bottom-[-35px] left-[-5px]"
            />

            <div className="bg-primary/70 text-black rounded-r-full rounded-tl-full max-w-47 py-2 px-3 text-xs/4">
              Looking for a self con in Port harcourt
            </div>
          </div>

          {/* Right bubble — agent */}
          <div className="bubble-right bubble-left flex items-end relative w-fit ml-auto">
            <img
              src={heroAgent}
              alt="agent"
              className="h-[42px] w-[42px] rounded-[50%] absolute top-[-35px] right-[-5px]"
            />

            <div className="bg-secondary/70 text-white rounded-l-full rounded-br-full max-w-47 py-2 px-3 text-xs/4">
              yes, I'm a verified agent Let's connect
            </div>
          </div>
        </div>
      </section>

      {/* Hero Text */}
      <div className="hero-text p-5 text-center">
        <h1 className="text-3xl/8 tracking-wide">
          Connecting House Hunters and Agents, All in One Spot.
        </h1>
      </div>

      <p className="text-center max-w-[400px] p-3 mx-auto text-tertiary">
        No more waka up and down. From apartments to shops, even roommates —
        connect with trusted agents and real people in PH.
      </p>

      {/* CTA Buttons */}
      <div className="hero-btns flex items-center gap-3 py-6 px-5">
        <button
          onClick={() => router.push("/auth?mode=signup")}
          className="cta-primary bg-secondary rounded-full cursor-pointer py-3 px-6 text-white"
        >
          Get started
        </button>
        <button
          onClick={() => router.push("/auth?mode=signin")}
          className="cta-secondary cursor-pointer rounded-full py-3 px-6 border"
        >
          Become an Agent
        </button>
      </div>

      {/* Section Header */}
      <div className="section-head px-5 pt-7">
        <p className="text-primary font-bold text-[13px]">No dulling !</p>
        <h2 className="text-[19px] font-extrabold text-[#1a1a1a] mt-0.5 tracking-tight">
          Find your next house, shop, or roommate
        </h2>
      </div>

      {/* Listing Grid */}
      <div className="grid-anim grid grid-cols-3 gap-2.5 px-5 pt-4 pb-24">
        {listings.map((l) => (
          <div
            key={l.id}
            className="listing-card relative rounded-xl overflow-hidden"
          >
            {/* Image */}
            <img
              src={l.image}
              alt="listing"
              className="listing w-full h-[110px] object-cover"
            />
            {/* Heart */}
            <button
              className="heart-btn absolute top-1.5 right-1.5 bg-white/85 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
              onClick={() => toggleSave(l.id)}
            >
              <Heart
                size={13}
                fill={saved.includes(l.id) ? "#e8622a" : "none"}
                color={saved.includes(l.id) ? "#e8622a" : "#333"}
              />
            </button>

            {/* Time & View */}
            <div className="pt-1.5 pb-1">
              <p className="text-[9.5px] text-gray-400 font-medium">
                {l.uploadedTime}
              </p>
              <button className="view-btn mt-1 bg-secondary text-white rounded-full px-2.5 py-1 text-[10px] font-semibold cursor-pointer">
                View Listing
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Chat Button */}
      <button className="fixed bottom-15 left-5 w-12 h-12 rounded-full bg-primary flex items-center justify-center cursor-pointer shadow-lg shadow-primary/40">
        <Headset size={22} color="#fff" fill="#fff" />
      </button>
    </div>
  );
}
