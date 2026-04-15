"use client";

import { useState, useTransition } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Navbar, Footer } from "@/components/shop";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      notes: formData.get("notes") as string,
      paymentMethod: formData.get("paymentMethod") as string,
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, items }),
      });

      const result = await res.json();

      if (result.success) {
        clearCart();
        startTransition(() => {
          router.push(`/gracias?orderId=${result.orderId}`);
        });
      } else {
        alert("Hubo un error: " + result.error);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error creando pedido:", error);
      alert("Hubo un error al procesar el pedido.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    router.replace("/catalogo");
    return null;
  }

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <section className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl text-cacao mb-10 text-center">Finalizar Pedido</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="font-serif text-2xl text-cacao border-b border-blush/30 pb-2">Tus Datos</h2>
            <div className="space-y-4">
              <input required name="name" placeholder="Nombre completo" className="w-full border border-blush/50 bg-white/50 p-3 outline-none focus:border-gold" />
              <input required name="phone" placeholder="WhatsApp (ej: 3001234567)" className="w-full border border-blush/50 bg-white/50 p-3 outline-none focus:border-gold" />
              <input required name="city" placeholder="Ciudad" className="w-full border border-blush/50 bg-white/50 p-3 outline-none focus:border-gold" />
              <input required name="address" placeholder="Dirección exacta" className="w-full border border-blush/50 bg-white/50 p-3 outline-none focus:border-gold" />
              <textarea name="notes" placeholder="Notas adicionales (opcional)" className="w-full border border-blush/50 bg-white/50 p-3 outline-none focus:border-gold h-24" />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="font-serif text-2xl text-cacao border-b border-blush/30 pb-2">Método de Pago</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-blush/50 bg-white/50 cursor-pointer hover:border-gold transition-colors">
                <input type="radio" name="paymentMethod" value="contraentrega" defaultChecked className="accent-gold" />
                <span className="font-sans text-sm text-cacao">Pago Contraentrega</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-blush/50 bg-white/50 cursor-pointer hover:border-gold transition-colors">
                <input type="radio" name="paymentMethod" value="transferencia" className="accent-gold" />
                <span className="font-sans text-sm text-cacao">Transferencia Bancaria</span>
              </label>
            </div>

            <div className="bg-cacao p-6 text-cream space-y-4">
              <div className="flex justify-between font-sans text-xs tracking-widest uppercase opacity-80">
                <span>Total a pagar</span>
                <span>${getTotal().toLocaleString("es-CO")}</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold py-4 text-xs uppercase tracking-[0.3em] hover:bg-gold-dark transition-colors disabled:bg-warm-gray"
              >
                {loading ? "Procesando..." : "Confirmar Pedido"}
              </button>
            </div>
          </div>
        </form>
      </section>
      <Footer />
    </main>
  );
}