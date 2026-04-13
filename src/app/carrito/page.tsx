"use client";

import { useCartStore } from "@/store/useCartStore";
import Navbar from "../components/shop/Navbar";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus } from "lucide-react";
import { useEffect, useState } from "react";

export default function CartPage() {
    const { items, removeItem, updateQuantity, getTotal } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const total = getTotal();

    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-cream">
                <Navbar />
                <section className="pt-40 pb-20 px-4 text-center">
                    <h1 className="font-serif text-5xl text-cacao font-light mb-4">Tu bolsa está vacía</h1>
                    <p className="font-sans text-warm-gray mb-10">
                        Descubre nuestra colección y añade tus favoritos.
                    </p>
                    <Link
                        href="/catalogo"
                        className="inline-block bg-gold text-cream px-10 py-4 text-xs uppercase tracking-[0.3em] hover:bg-gold-dark transition-colors"
                    >
                        Ver catálogo
                    </Link>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-cream">
            <Navbar />

            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                <div className="mb-12 text-center">
                    <p className="font-sans text-[10px] tracking-[0.4em] text-gold uppercase mb-3">
                        Tu selección
                    </p>
                    <h1 className="font-serif text-5xl text-cacao font-light">Mi bolsa</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Lista de productos */}
                    <div className="lg:col-span-2 space-y-6">
                        {items.map((item) => (
                            <div
                                key={item.variantId}
                                className="flex gap-6 border-b border-blush/30 pb-6"
                            >
                                {/* Imagen */}
                                <div className="relative w-24 h-32 flex-shrink-0 bg-blush/10 overflow-hidden">
                                    {item.imageUrl ? (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="font-serif text-sm text-cacao">E</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-serif text-xl text-cacao">{item.name}</h3>
                                        <p className="font-sans text-xs text-warm-gray mt-1">
                                            {item.attributeName}: {item.attributeValue}
                                        </p>
                                        <p className="font-sans text-sm text-gold-dark font-medium mt-2">
                                            ${item.price.toLocaleString("es-CO")}
                                        </p>
                                    </div>

                                    {/* Controles */}
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center border border-blush/50">
                                            <button
                                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                                className="px-3 py-2 text-cacao hover:text-gold transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="px-4 py-2 font-sans text-sm text-cacao border-x border-blush/50">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                                className="px-3 py-2 text-cacao hover:text-gold transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <p className="font-sans text-sm font-medium text-cacao">
                                                ${(item.price * item.quantity).toLocaleString("es-CO")}
                                            </p>
                                            <button
                                                onClick={() => removeItem(item.variantId)}
                                                className="text-warm-gray hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Resumen del pedido */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/50 border border-blush/20 p-8 sticky top-32">
                            <h2 className="font-serif text-2xl text-cacao mb-6">Resumen</h2>

                            <div className="space-y-3 mb-6 font-sans text-sm">
                                <div className="flex justify-between text-warm-gray">
                                    <span>Subtotal</span>
                                    <span>${total.toLocaleString("es-CO")}</span>
                                </div>
                                <div className="flex justify-between text-warm-gray">
                                    <span>Envío</span>
                                    <span className="text-gold">A coordinar</span>
                                </div>
                                <div className="border-t border-blush/30 pt-3 flex justify-between font-medium text-cacao text-base">
                                    <span>Total</span>
                                    <span>${total.toLocaleString("es-CO")}</span>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="block w-full bg-gold text-cream text-center py-4 font-sans text-xs uppercase tracking-[0.3em] hover:bg-gold-dark transition-colors"
                            >
                                Finalizar pedido
                            </Link>

                            <Link
                                href="/catalogo"
                                className="block w-full text-center mt-4 font-sans text-xs text-warm-gray hover:text-gold transition-colors uppercase tracking-widest"
                            >
                                Seguir comprando
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}