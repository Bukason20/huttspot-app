"use client";

import { Suspense } from "react";
import SubscriptionView from "@/components/subscription/SubscriptionView";
import { SkeletonText } from "@/components/ui";

// useSearchParams (?return=…) needs a Suspense boundary in the App Router
export default function SubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="px-5">
          <SkeletonText className="h-7 w-40" />
        </div>
      }
    >
      <SubscriptionView mode="HUTTSPOTTER" />
    </Suspense>
  );
}
