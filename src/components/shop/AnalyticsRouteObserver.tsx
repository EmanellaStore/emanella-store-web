/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/shop/AnalyticsRouteObserver.tsx
"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GA_TRACKING_ID } from "@/lib/analytics";

function RouteObserverInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

    // Track PageView on Meta Pixel
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "PageView");
    }

    // Track PageView on GA4 (DISABLED)
    // if (typeof window !== "undefined" && (window as any).gtag && GA_TRACKING_ID) {
    //   (window as any).gtag("config", GA_TRACKING_ID, {
    //     page_path: url,
    //   });
    // }
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsRouteObserver() {
  return (
    <Suspense fallback={null}>
      <RouteObserverInner />
    </Suspense>
  );
}
