"use client";
// src/components/shop/CartDrawer.tsx — drawer lateral del carrito (paridad Shopify):
// se abre al agregar un producto o desde el ícono de la bolsa.
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useUiStore } from "@/store/useUiStore";
import { useSyncExternalStore } from "react";

const EMPTY_ITEMS: ReturnType<typeof useCartStore.getState>["items"] = [];

function useCartItems() {
  return useSyncExternalStore(
    (cb) => useCartStore.subscribe(cb),
    () => useCartStore.getState().items,
    () => EMPTY_ITEMS
  );
}

export default function CartDrawer() {
  const open = useUiStore((s) => s.cartDrawerOpen);
  const close = useUiStore((s) => s.closeCartDrawer);
  const items = useCartItems();
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = items.reduce((t, i) => t + i.price * i.quantity, 0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Carrito">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={close}
        className="absolute inset-0 h-full w-full bg-warm-black/40 backdrop-blur-[2px]"
      />

      {/* Panel */}
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-cream shadow-2xl animate-[slideInRight_0.3s_ease-out]">
        <div className="flex items-center justify-between border-b border-blush px-6 py-5">
          <h2 className="font-serif text-2xl font-medium text-cacao">Tu carrito</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className="text-cacao transition-colors hover:text-gold-dark"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <p className="font-serif text-xl text-cacao">Tu carrito está vacío</p>
            <p className="font-sans text-sm font-light text-cacao-light">
              Encuentra el perfume por el que te van a recordar.
            </p>
            <Link
              href="/catalogo"
              onClick={close}
              className="bg-warm-black px-8 py-3.5 font-sans text-[11px] uppercase tracking-[0.2em] text-on-dark transition-colors hover:bg-gold-dark"
            >
              Explorar la colección
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-blush overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-5">
                  <Link
                    href={`/producto/${item.slug}`}
                    onClick={close}
                    className="relative h-20 w-20 shrink-0 overflow-hidden border border-blush bg-beige"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-contain"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-serif text-xs text-cacao">
                        Emanella
                      </span>
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link href={`/producto/${item.slug}`} onClick={close}>
                      <p className="truncate font-sans text-sm font-medium text-cacao">
                        {item.name}
                      </p>
                    </Link>
                    <p className="font-sans text-xs font-light text-warm-gray">
                      {item.attributeValue}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="flex items-center border border-blush">
                        <button
                          type="button"
                          aria-label="Disminuir cantidad"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-cacao hover:text-gold-dark"
                        >
                          <Minus size={11} strokeWidth={1.5} />
                        </button>
                        <span className="w-7 text-center font-sans text-xs text-cacao">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Aumentar cantidad"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-cacao hover:text-gold-dark"
                        >
                          <Plus size={11} strokeWidth={1.5} />
                        </button>
                      </span>
                      <span className="font-serif text-sm font-semibold text-gold-dark">
                        ${(item.price * item.quantity).toLocaleString("es-CO")}
                      </span>
                      <button
                        type="button"
                        aria-label={`Quitar ${item.name}`}
                        onClick={() => removeItem(item.variantId)}
                        className="text-warm-gray transition-colors hover:text-cacao"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-blush px-6 py-5">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-sans text-sm uppercase tracking-[0.15em] text-cacao">
                  Subtotal
                </span>
                <span className="font-serif text-xl font-semibold text-cacao">
                  ${subtotal.toLocaleString("es-CO")}
                </span>
              </div>
              <p className="mb-4 font-sans text-xs font-light text-warm-gray">
                El envío se calcula en el checkout.
              </p>
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/checkout"
                  onClick={close}
                  className="w-full bg-warm-black py-4 text-center font-sans text-[11px] uppercase tracking-[0.2em] text-on-dark transition-colors hover:bg-gold-dark"
                >
                  Finalizar compra
                </Link>
                <Link
                  href="/carrito"
                  onClick={close}
                  className="w-full border border-cacao py-4 text-center font-sans text-[11px] uppercase tracking-[0.2em] text-cacao transition-colors hover:border-gold hover:text-gold-dark"
                >
                  Ver carrito
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
