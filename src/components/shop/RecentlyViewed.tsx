"use client";
// src/components/shop/RecentlyViewed.tsx — "Vistos recientemente" (paridad Shopify):
// guarda un snapshot de cada PDP visitada en localStorage y pinta un carrusel.
// Se oculta si no hay historial (o solo está el producto actual).
import { useEffect, useState } from "react";
import ProductCarousel, { CarouselProduct } from "./ProductCarousel";

const STORAGE_KEY = "emanella-recently-viewed";
const MAX_ITEMS = 10;

export function recordRecentlyViewed(product: CarouselProduct) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: CarouselProduct[] = raw ? JSON.parse(raw) : [];
    const without = list.filter((p) => p.slug !== product.slug);
    without.unshift(product);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(without.slice(0, MAX_ITEMS)));
  } catch {
    /* localStorage no disponible */
  }
}

interface RecentlyViewedProps {
  /** Producto actual: se registra en el historial y se excluye del carrusel. */
  current?: CarouselProduct;
}

export default function RecentlyViewed({ current }: RecentlyViewedProps) {
  const [items, setItems] = useState<CarouselProduct[]>([]);

  const currentSlug = current?.slug ?? null;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: CarouselProduct[] = raw ? JSON.parse(raw) : [];
      const visible = currentSlug ? list.filter((p) => p.slug !== currentSlug) : list;
      setItems(visible);
      if (current) recordRecentlyViewed(current);
    } catch {
      setItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlug]);

  if (items.length === 0) return null;

  return (
    <ProductCarousel eyebrow="Tu recorrido" title="Vistos recientemente" products={items} />
  );
}
