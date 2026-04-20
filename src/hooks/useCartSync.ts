"use client";
import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/useCartStore";

export function useCartSync() {
  const items = useCartStore((s) => s.items);
  const sessionId = useCartStore((s) => s.sessionId);
  const phone = useCartStore((s) => s.phone);
  const customerId = useCartStore((s) => s.customerId);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const restoredRef = useRef(false);

  // 1) Restaurar carrito desde ?cart=sessionId
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const restoreId = params.get('cart');
    if (!restoreId) return;

    fetch(`/api/cart/restore?sessionId=${restoreId}`)
      .then(r => r.json())
      .then(data => {
        if (data.items?.length > 0) {
          useCartStore.setState({
            items: data.items,
            sessionId: restoreId, // mantenemos el mismo sessionId para trazar conversión
            phone: data.phone || null,
          });
        }
      })
      .catch(err => console.warn('cart restore failed', err));
  }, []);

  // 2) Track automático (ya lo tenías)
  useEffect(() => {
    if (items.length === 0) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetch("/api/cart/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          customerId,
          phone,
          items: items.map(i => ({
            variantId: i.variantId,
            quantity: i.quantity,
            unitPrice: i.price,
          })),
        }),
      }).catch(err => console.warn("cart track failed", err));
    }, 2000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [items, sessionId, phone, customerId]);
}