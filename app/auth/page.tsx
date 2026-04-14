"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page is no longer used.
// Google auth logic has been moved into auth/signup/page.tsx and auth/signin/page.tsx.
export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/signup");
  }, [router]);

  return null;
}
