"use client";
// src/components/shop/ProductCard.tsx — card estilo Amelie (paridad tema Shopify):
// sharp, fondo nácar, hover = zoom + barra oscura con "Agregar" y stepper [− 1 +].
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useToastStore } from "@/store/useToastStore";
import { useUiStore } from "@/store/useUiStore";
import { trackAddToCart } from "@/lib/analytics";

export interface ProductCardVariant {
  id: string;
  attributeName: string;
  attributeValue: string;
  stock?: number;
}

interface ProductCardProps {
  name: string;
  slug: string;
  imageUrl?: string | null;
  hoverImageUrl?: string | null;
  category: string;
  price: number;
  originalPrice?: number | null;
  productId?: string;
  variant?: ProductCardVariant | null;
}

function formatCategory(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export default function ProductCard({
  name,
  slug,
  imageUrl,
  hoverImageUrl,
  category,
  price,
  originalPrice,
  productId,
  variant,
}: ProductCardProps) {
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const phone = useCartStore((s) => s.phone);
  const showToast = useToastStore((s) => s.showToast);

  const hasImage = Boolean(imageUrl && imageUrl.trim() !== "");
  const hasDiscount = Boolean(originalPrice && originalPrice > price);
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice! - price) / originalPrice!) * 100)
    : 0;
  const canAdd = Boolean(variant && productId);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canAdd || adding) return;
    setAdding(true);
    addItem({
      variantId: variant!.id,
      productId: productId!,
      name,
      slug,
      attributeName: variant!.attributeName,
      attributeValue: variant!.attributeValue,
      price,
      quantity: qty,
      imageUrl,
    });
    trackAddToCart(
      { id: variant!.id, name, price, quantity: qty, category, slug },
      { phone: phone || undefined }
    );
    showToast({ title: "Agregado", description: name, imageUrl: imageUrl || undefined });
    setQty(1);
    setTimeout(() => {
      setAdding(false);
      useUiStore.getState().openCartDrawer();
    }, 450);
  };

  return (
    <div className="group flex h-full flex-col">
      {/* Imagen: clic = abrir PDP. Caja cuadrada un punto más oscura que la página. */}
      <div className="relative mb-4 aspect-square overflow-hidden border border-blush bg-beige">
        <Link href={`/producto/${slug}`} className="absolute inset-0 z-[1] block" aria-label={name}>
          {hasImage ? (
            <>
              <Image
                src={imageUrl!}
                alt={name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className={`object-contain transition-transform duration-[400ms] ease-out group-hover:scale-[1.03] ${
                  hoverImageUrl ? "group-hover:opacity-0" : ""
                }`}
              />
              {hoverImageUrl && (
                <Image
                  src={hoverImageUrl}
                  alt={`${name} — vista alternativa`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="absolute inset-0 object-contain opacity-0 transition-all duration-[400ms] ease-out group-hover:scale-[1.03] group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
              <span className="mb-2 font-serif text-2xl text-cacao">Emanella</span>
              <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-warm-gray">
                Próximamente imagen
              </span>
            </span>
          )}
        </Link>

        {/* Badge de descuento (grafito, sharp) */}
        {hasDiscount && (
          <span className="absolute left-0 top-3 z-[2] bg-warm-black px-2.5 py-1 font-sans text-[10px] tracking-[0.12em] text-on-dark">
            −{discountPercent}%
          </span>
        )}

        {/* Barra única oscura: Agregar al carrito + stepper integrado */}
        {canAdd && (
          <div className="absolute bottom-2 left-2 right-2 z-[3] translate-y-0 opacity-100 transition-all duration-300 md:pointer-events-none md:translate-y-3 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100">
            <div className="flex h-10 w-full items-stretch overflow-hidden bg-warm-black">
              <button
                type="button"
                onClick={handleAdd}
                disabled={adding}
                className="min-w-0 flex-1 whitespace-nowrap px-2 font-sans text-[11px] uppercase tracking-[0.08em] text-on-dark transition-colors hover:bg-[rgba(255,255,255,0.08)] disabled:opacity-80"
              >
                {adding ? "Agregado ✓" : "Agregar al carrito"}
              </button>
              <span className="flex items-center pr-1">
                <button
                  type="button"
                  aria-label="Disminuir cantidad"
                  onClick={(e) => {
                    e.preventDefault();
                    setQty((v) => Math.max(1, v - 1));
                  }}
                  className="flex h-full w-6 items-center justify-center text-on-dark"
                >
                  <Minus size={12} strokeWidth={1.5} />
                </button>
                <span className="w-[22px] text-center font-sans text-sm text-on-dark">{qty}</span>
                <button
                  type="button"
                  aria-label="Aumentar cantidad"
                  onClick={(e) => {
                    e.preventDefault();
                    setQty((v) => v + 1);
                  }}
                  className="flex h-full w-6 items-center justify-center text-on-dark"
                >
                  <Plus size={12} strokeWidth={1.5} />
                </button>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Info: título a 2 líneas fijas + bloque de precio con alto reservado */}
      <div className="flex flex-1 flex-col">
        <p className="mb-1 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
          {formatCategory(category)}
        </p>
        <Link href={`/producto/${slug}`} className="group/title">
          <h3 className="min-h-[2.6em] font-serif text-lg leading-[1.3] text-cacao line-clamp-2 transition-colors group-hover/title:text-gold-dark">
            {name}
          </h3>
        </Link>
        <div className="mt-auto min-h-[1.8em] pt-1.5">
          {hasDiscount ? (
            <span className="flex items-baseline gap-2">
              <span className="font-sans text-xs text-warm-gray line-through">
                ${originalPrice!.toLocaleString("es-CO")}
              </span>
              <span className="font-serif text-base font-semibold text-gold-dark">
                ${price.toLocaleString("es-CO")}
              </span>
            </span>
          ) : (
            <span className="font-serif text-base font-semibold text-gold-dark">
              ${price.toLocaleString("es-CO")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
