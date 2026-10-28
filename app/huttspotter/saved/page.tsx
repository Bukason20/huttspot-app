"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Saved listings now live in the "Saved" tab of the Listings page.
// Keep this route so old links / bookmarks still work.
export default function SavedListingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/huttspotter/listings?tab=saved");
  }, [router]);

  return null;
}
