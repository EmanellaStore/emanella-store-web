// src/app/gracias/PurchaseTracker.tsx
"use client";

import { useEffect } from "react";
import { trackPurchaseClient } from "@/lib/analytics";

interface PurchaseTrackerProps {
  order: {
    orderId: string;
    totalAmount: number;
    shippingAmount: number;
    discountAmount: number;
    coupon?: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      category?: string;
    }>;
  } | null;
}

export default function PurchaseTracker({ order }: PurchaseTrackerProps) {
  useEffect(() => {
    if (!order) return;

    // Prevent double tracking if the component somehow remounts
    const trackedKey = `order_tracked_${order.orderId}`;
    if (sessionStorage.getItem(trackedKey)) {
      return;
    }

    // Trigger client-side Purchase event (Pixel and GA4)
    trackPurchaseClient(
      order.orderId,
      order.items,
      order.totalAmount,
      order.shippingAmount,
      order.discountAmount,
      order.coupon
    );

    // Mark as tracked
    sessionStorage.setItem(trackedKey, "true");
  }, [order]);

  return null;
}
