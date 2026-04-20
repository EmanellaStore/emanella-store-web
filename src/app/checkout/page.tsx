"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Navbar, Footer } from "@/components/shop";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const sessionId = useCartStore((state) => state.sessionId);
  const setContact = useCartStore((state) => state.setContact);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);

  // Detecta si viene de un link de recuperación y espera a que se restaure
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasRestoreParam = params.has("cart");

    if (!hasRestoreParam) {
      setIsRestoring(false);
      return;
    }

    // Damos 2s máximo para que el hook useCartSync termine la restauración
    const timer = setTimeout(() => setIsRestoring(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Redirige SOLO cuando ya terminamos de restaurar y el carrito sigue vacío
  useEffect(() => {
    if (isRestoring || submitted || loading) return;
    if (items.length === 0) {
      router.replace("/catalogo");
    }
  }, [items.length, submitted, loading, isRestoring, router]);

  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const phone = e.target.value.trim();
    if (phone.length >= 10) setContact({ phone });
  };

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
        body: JSON.stringify({ data, items, sessionId }),
      });

      const result = await res.json();

      if (result.success) {
        setSubmitted(true);
        clearCart();
        router.replace(`/gracias?orderId=${result.orderId}`);
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

  // Mientras restauramos, mostramos un loader (no null, para no flashear redirect)
  if (isRestoring) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-sans text-xs tracking-[0.3em] text-cacao uppercase">
            Recuperando tu bolsa...
          </p>
        </div>
      </main>
    );
  }

  if (items.length === 0 && !submitted) {
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
              <input
                required
                name="name"
                placeholder="Nombre completo"
                className="w-full border border-blush/50 bg-white/50 p-3 outline-none focus:border-gold"
              />
              <input
                required
                name="phone"
                placeholder="WhatsApp (ej: 3001234567)"
                onBlur={handlePhoneBlur}
                className="w-full border border-blush/50 bg-white/50 p-3 outline-none focus:border-gold"
              />
              <input
                required
                name="city"
                placeholder="Ciudad"
                className="w-full border border-blush/50 bg-white/50 p-3 outline-none focus:border-gold"
              />
              <input
                required
                name="address"
                placeholder="Dirección exacta"
                className="w-full border border-blush/50 bg-white/50 p-3 outline-none focus:border-gold"
              />
              <textarea
                name="notes"
                placeholder="Notas adicionales (opcional)"
                className="w-full border border-blush/50 bg-white/50 p-3 outline-none focus:border-gold h-24"
              />
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