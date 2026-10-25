"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="-ml-1 mb-6 inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-full py-1 pr-2 text-sm font-semibold text-gray-500 transition-colors hover:text-[#1a1a1a]"
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
}
