"use client";
import { useState } from "react";
import { useCartStore, CartItem } from "@/store/useCartStore";

interface Variant {
    id: string;
    sku: string;
    attributeName: string;
    attributeValue: string;
    price: number;
    stock: number;
}

interface AddToCartSectionProps {
    product: {
        id: string;
        name: string;
        slug: string;
        imageUrl?: string | null;
    };
    variants: Variant[];
}

export default function AddToCartSection({ product, variants }: AddToCartSectionProps) {
    const [selectedVariant, setSelectedVariant] = useState<Variant>(variants[0]);
    const addItem = useCartStore((state) => state.addItem);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = () => {
        setIsAdding(true);

        const item: CartItem = {
            variantId: selectedVariant.id,
            productId: product.id,
            name: product.name,
            slug: product.slug,
            attributeName: selectedVariant.attributeName,
            attributeValue: selectedVariant.attributeValue,
            price: Number(selectedVariant.price),
            quantity: 1,
            imageUrl: product.imageUrl,
        };

        addItem(item);

        // Feedback visual rápido
        setTimeout(() => setIsAdding(false), 800);
    };

    return (
        <div className="space-y-10">
            {/* Selector de Variantes */}
            <div>
                <p className="font-sans text-[10px] tracking-[0.2em] text-cacao uppercase mb-4 font-medium">
                    Seleccionar {selectedVariant.attributeName}
                </p>
                <div className="flex flex-wrap gap-3">
                    {variants.map((variant) => (
                        <button
                            key={variant.id}
                            onClick={() => setSelectedVariant(variant)}
                            className={`border px-6 py-3 text-sm font-sans transition-all ${selectedVariant.id === variant.id
                                    ? "bg-cacao text-cream border-cacao"
                                    : "border-blush text-cacao hover:border-gold hover:text-gold"
                                }`}
                        >
                            {variant.attributeValue} — ${Number(variant.price).toLocaleString("es-CO")}
                        </button>
                    ))}
                </div>
            </div>

            {/* Botón de Acción */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className={`w-full py-5 font-sans text-xs tracking-[0.3em] uppercase transition-all duration-500 shadow-lg ${isAdding
                            ? "bg-warm-gray text-cream cursor-default"
                            : "bg-gold text-cream hover:bg-gold-dark shadow-gold/10"
                        }`}
                >
                    {isAdding ? "¡Añadido!" : "Añadir a la bolsa"}
                </button>
            </div>
        </div>
    );
}