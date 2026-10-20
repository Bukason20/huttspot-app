"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { heroAgent, heroClient } from "@/assets";

const HeroSection = () => {
  const router = useRouter();
  return (
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
      <div className="hero-btns flex items-center justify-center gap-3 py-6 px-5">
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
    </section>
  );
};

export default HeroSection;
