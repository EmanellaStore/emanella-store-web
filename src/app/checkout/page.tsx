"use client";

import { useState, useEffect, useMemo } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Navbar, Footer } from "@/components/shop";
import { useRouter, useSearchParams } from "next/navigation";

const SHIPPING_COST = 15000;
const FREE_SHIPPING_THRESHOLD = 200000;

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const sessionId = useCartStore((state) => state.sessionId);
  const customerId = useCartStore((state) => state.customerId);
  const setContact = useCartStore((state) => state.setContact);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);

  // ===== PRE-FILL desde Telegram (?phone=) =====
  const [prefillName, setPrefillName] = useState("");
  const [prefillPhone, setPrefillPhone] = useState("");
  const [prefillCity, setPrefillCity] = useState("");
  const [prefillAddress, setPrefillAddress] = useState("");

  // ===== CUPONES =====
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    freeShipping: boolean;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // ===== TOTALES =====
  const subtotal = useMemo(() => getTotal(), [getTotal, items]);
  const shipping = useMemo(() => {
    if (appliedCoupon?.freeShipping) return 0;
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return SHIPPING_COST;
  }, [subtotal, appliedCoupon]);
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal + shipping - discount);
  const searchParams = useSearchParams();

  // ===== RESTORE FLOW =====
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasRestoreParam = params.has("cart");
    if (!hasRestoreParam) {
      setIsRestoring(false);
      return;
    }
    const timer = setTimeout(() => setIsRestoring(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isRestoring || submitted || loading) return;
    if (items.length === 0) router.replace("/catalogo");
  }, [items.length, submitted, loading, isRestoring, router]);

  // pre-cargar cupón desde URL ?c=CODIGO
  useEffect(() => {
    const couponFromUrl = searchParams.get("c");
    if (couponFromUrl && !appliedCoupon) {
      setCouponCode(couponFromUrl.toUpperCase());
    }
  }, [searchParams]);

  // ===== PRE-FILL desde Telegram: ?phone=3001234567 =====
  useEffect(() => {
    const phoneFromUrl = searchParams.get("phone");
    if (!phoneFromUrl) return;

    fetch(`/api/checkout/prefill?phone=${encodeURIComponent(phoneFromUrl)}`)
      .then((r) => r.json())
      .then(({ customer }) => {
        if (customer) {
          setPrefillName(customer.name ?? "");
          setPrefillPhone(customer.phone ?? "");
          setPrefillCity(customer.city ?? "");
          setPrefillAddress(customer.address ?? "");
          if (customer.phone) setContact({ phone: customer.phone });
        } else {
          // Cliente nuevo: pre-llenar solo el teléfono
          setPrefillPhone(phoneFromUrl);
        }
      })
      .catch(() => {
        // Silencioso — el cliente llena el form manualmente
      });
  }, [searchParams]);

  // ===== CUPÓN: aplicar / quitar =====
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          subtotal,
          customerId: customerId || null,
        }),
      });
      const data = await res.json();
      if (!data.valid) {
        setCouponError(data.error || "Cupón no válido");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.coupon.code,
          discount: data.discount,
          freeShipping: data.coupon.type === "FREE_SHIPPING",
        });
      }
    } catch {
      setCouponError("Error validando cupón");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

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
        body: JSON.stringify({
          data,
          items,
          sessionId,
          couponCode: appliedCoupon?.code,
        }),
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

  if (items.length === 0 && !submitted) return null;

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <section className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl text-cacao mb-10 text-center">
          Finalizar Pedido
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-12"
        >
          {/* ===== COLUMNA IZQUIERDA ===== */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl text-cacao border-b border-blush/30 pb-2">
              Tus Datos
            </h2>
            <div className="space-y-4">
              <input
                required
                name="name"
                placeholder="Nombre completo"
                value={prefillName}
                onChange={(e) => setPrefillName(e.target.value)}
                className="w-full border border-blush/50 bg-white/50 p-3 outline-none focus:border-gold"
              />
              <input
                required
                name="phone"
                placeholder="WhatsApp (ej: 3001234567)"
                value={prefillPhone}
                onChange={(e) => setPrefillPhone(e.target.value)}
                onBlur={handlePhoneBlur}
                className="w-full border border-blush/50 bg-white/50 p-3 outline-none focus:border-gold"
              />
              <input
                required
                name="city"
                placeholder="Ciudad"
                value={prefillCity}
                onChange={(e) => setPrefillCity(e.target.value)}
                className="w-full border border-blush/50 bg-white/50 p-3 outline-none focus:border-gold"
              />
              <input
                required
                name="address"
                placeholder="Dirección exacta"
                value={prefillAddress}
                onChange={(e) => setPrefillAddress(e.target.value)}
                className="w-full border border-blush/50 bg-white/50 p-3 outline-none focus:border-gold"
              />
              <textarea
                name="notes"
                placeholder="Notas adicionales (opcional)"
                className="w-full border border-blush/50 bg-white/50 p-3 outline-none focus:border-gold h-24"
              />
            </div>
          </div>

          {/* ===== COLUMNA DERECHA ===== */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl text-cacao border-b border-blush/30 pb-2">
              Método de Pago
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-blush/50 bg-white/50 cursor-pointer hover:border-gold transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="contraentrega"
                  defaultChecked
                  className="accent-gold"
                />
                <span className="font-sans text-sm text-cacao">
                  Pago Contraentrega
                </span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-blush/50 bg-white/50 cursor-pointer hover:border-gold transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transferencia"
                  className="accent-gold"
                />
                <span className="font-sans text-sm text-cacao">
                  Transferencia Bancaria
                </span>
              </label>
            </div>

            {/* ===== CUPÓN ===== */}
            <div className="bg-white/50 border border-blush/30 p-4 space-y-2">
              <p className="font-sans text-xs uppercase tracking-widest text-cacao">
                ¿Tienes un cupón?
              </p>
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Código"
                    className="flex-1 border border-blush/50 bg-white px-3 py-2 text-sm outline-none focus:border-gold uppercase"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-cacao text-cream text-xs uppercase tracking-widest disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Aplicar"}
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-green-50 border border-green-200 px-3 py-2">
                  <span className="text-xs text-green-700 font-bold">
                    ✓ {appliedCoupon.code}
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-red-600 underline"
                  >
                    Quitar
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-xs text-red-600">{couponError}</p>
              )}
            </div>

            {/* ===== RESUMEN ===== */}
            <div className="bg-cacao p-6 text-cream space-y-3">
              <div className="flex justify-between font-sans text-xs tracking-widest uppercase opacity-80">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between font-sans text-xs tracking-widest uppercase opacity-80">
                <span>Envío</span>
                <span>
                  {shipping === 0
                    ? "GRATIS"
                    : `$${shipping.toLocaleString("es-CO")}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-sans text-xs tracking-widest uppercase text-green-300">
                  <span>Descuento</span>
                  <span>-${discount.toLocaleString("es-CO")}</span>
                </div>
              )}
              <div className="border-t border-cream/20 pt-3 flex justify-between font-sans text-sm tracking-widest uppercase">
                <span>Total</span>
                <span className="text-gold font-bold">
                  ${total.toLocaleString("es-CO")}
                </span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold py-4 text-xs uppercase tracking-[0.3em] hover:bg-gold-dark transition-colors disabled:bg-warm-gray mt-4"
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