// src/app/catalogo/CatalogSearchTracker.tsx
"use client";

import { useEffect } from "react";
import { trackSearch } from "@/lib/analytics";
import { useCartStore } from "@/store/useCartStore";

interface CatalogSearchTrackerProps {
  query: string;
}

export default function CatalogSearchTracker({ query }: CatalogSearchTrackerProps) {
  const phone = useCartStore((state) => state.phone);

  useEffect(() => {
    const cleanedQuery = query.trim();
    if (cleanedQuery) {
      trackSearch(cleanedQuery, { phone: phone || undefined });
    }
  }, [query, phone]);

  return null;
}
