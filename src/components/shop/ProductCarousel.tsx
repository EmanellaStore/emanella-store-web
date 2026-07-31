"use client";
// src/components/shop/ProductCarousel.tsx — carrusel horizontal scroll-snap
// (paridad "También te pueden gustar" / "Vistos recientemente" del tema Shopify).
// Flechas ‹ › en desktop con estados disabled; en móvil se desliza con el dedo.
import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard, { ProductCardVariant } from "./ProductCard";

export interface CarouselProduct {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  hoverImageUrl: string | null;
  category: string;
  price: number;
  originalPrice: number | null;
  variant: ProductCardVariant | null;
}

interface ProductCarouselProps {
  eyebrow: string;
  title: string;
  products: CarouselProduct[];
}

export default function ProductCarousel({ eyebrow, title, products }: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, products.length]);

  if (products.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 640, behavior: "smooth" });
  };

  return (
    <section className="border-t border-blush py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center text-center">
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h2 className="font-serif text-2xl font-medium text-cacao md:text-3xl">{title}</h2>
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => scrollBy(-1)}
            disabled={!canPrev}
            className="absolute -left-4 top-[38%] z-10 hidden h-10 w-10 items-center justify-center border border-blush bg-bg-card text-cacao transition-opacity hover:border-gold disabled:opacity-30 md:flex"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:thin] [scrollbar-color:var(--color-accent)_transparent]"
          >
            {products.map((p) => (
              <div key={p.productId} className="w-[240px] shrink-0 snap-start sm:w-[280px]">
                <ProductCard
                  name={p.name}
                  slug={p.slug}
                  imageUrl={p.imageUrl}
                  hoverImageUrl={p.hoverImageUrl}
                  category={p.category}
                  price={p.price}
                  originalPrice={p.originalPrice}
                  productId={p.productId}
                  variant={p.variant}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => scrollBy(1)}
            disabled={!canNext}
            className="absolute -right-4 top-[38%] z-10 hidden h-10 w-10 items-center justify-center border border-blush bg-bg-card text-cacao transition-opacity hover:border-gold disabled:opacity-30 md:flex"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
