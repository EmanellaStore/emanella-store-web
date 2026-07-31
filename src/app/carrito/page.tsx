"use client";

import { useCartStore } from "@/store/useCartStore";
import { Navbar, Footer } from "@/components/shop";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, Tag, X } from "lucide-react";
import { useState } from "react";

export default function CartPage() {
    const items = useCartStore((state) => state.items);
    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const getTotal = useCartStore((state) => state.getTotal);
    
    // Cupones
    const couponCode = useCartStore((state) => state.couponCode);
    const discount = useCartStore((state) => state.discount);
    const setCoupon = useCartStore((state) => state.setCoupon);
    const clearCoupon = useCartStore((state) => state.clearCoupon);

    const [couponInput, setCouponInput] = useState("");
    const [validating, setValidating] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);

    const subtotal = items.reduce((t, i) => t + i.price * i.quantity, 0);
    const total = getTotal();

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        setValidating(true);
        setCouponError(null);

        try {
            const res = await fetch("/api/coupons/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponInput.trim(), subtotal }),
            });

            const data = await res.json();
            if (data.valid) {
                setCoupon(data.coupon.code, data.discount);
                setCouponInput("");
            } else {
                setCouponError(data.error || "Cupón inválido o expirado");
            }
        } catch (error) {
            setCouponError("Error al verificar el cupón");
        } finally {
            setValidating(false);
        }
    };

    const handleRemoveCoupon = () => {
        clearCoupon();
        setCouponError(null);
    };

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
                        className="inline-block bg-warm-black text-on-dark px-10 py-4 text-xs uppercase tracking-[0.3em] hover:bg-gold-dark transition-colors"
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
                                            sizes="96px"
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
                        <div className="bg-beige border border-blush/20 p-8 sticky top-32">
                            <h2 className="font-serif text-2xl text-cacao mb-6">Resumen</h2>

                            <div className="space-y-3 mb-6 font-sans text-sm">
                                <div className="flex justify-between text-warm-gray">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toLocaleString("es-CO")}</span>
                                </div>
                                
                                {discount > 0 && couponCode && (
                                    <div className="flex justify-between text-gold font-medium items-center">
                                        <div className="flex items-center gap-1.5">
                                            <Tag size={12} />
                                            <span className="uppercase text-[10px] tracking-wider">{couponCode}</span>
                                        </div>
                                        <span>-${discount.toLocaleString("es-CO")}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-warm-gray">
                                    <span>Envío</span>
                                    <span className="text-gold">A coordinar</span>
                                </div>

                                <div className="border-t border-blush/30 pt-4 mt-2 flex justify-between font-medium text-cacao text-base">
                                    <span>Total Final</span>
                                    <span>${total.toLocaleString("es-CO")}</span>
                                </div>
                            </div>

                            {/* Sección de Código de Cupón */}
                            {!couponCode ? (
                                <div className="mb-6">
                                    <label className="block font-sans text-[10px] uppercase tracking-widest text-cacao mb-2">
                                        ¿Tienes un cupón?
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                            placeholder="EJ: VIP20"
                                            className="w-full bg-cream border border-blush/50 px-3 py-2.5 text-xs text-cacao outline-none focus:border-gold placeholder:text-warm-gray/50 font-sans tracking-widest uppercase"
                                            onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={validating || !couponInput.trim()}
                                            className="bg-cacao text-cream px-4 text-[10px] uppercase tracking-widest hover:bg-gold transition-colors disabled:bg-cacao/50"
                                        >
                                            {validating ? "..." : "Aplicar"}
                                        </button>
                                    </div>
                                    {couponError && (
                                        <p className="text-red-400 text-[10px] mt-2 font-sans">{couponError}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="mb-6 bg-cream border border-gold/30 p-3 flex justify-between items-center rounded-sm">
                                    <div>
                                        <p className="font-sans text-[10px] uppercase tracking-widest text-gold font-semibold">
                                            Cupón Aplicado
                                        </p>
                                        <p className="font-sans text-xs text-cacao mt-0.5">{couponCode}</p>
                                    </div>
                                    <button
                                        onClick={handleRemoveCoupon}
                                        className="text-warm-gray hover:text-red-400 p-1"
                                        title="Quitar cupón"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            <Link
                                href="/checkout"
                                className="block w-full bg-warm-black text-on-dark text-center py-4 font-sans text-xs uppercase tracking-[0.3em] hover:bg-gold-dark transition-colors mt-2"
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
            <Footer />
        </main>
    );
}