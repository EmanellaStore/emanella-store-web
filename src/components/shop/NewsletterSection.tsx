"use client";
// src/components/shop/NewsletterSection.tsx — "Entra al círculo Emanella"
import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { trackLead } from "@/lib/analytics";

export default function NewsletterSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const setContact = useCartStore((s) => s.setContact);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.match(/^3\d{9}$/)) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/customers/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Círculo Emanella", phone }),
      });
      const data = await res.json();
      if (data?.customer?.id) {
        setContact({ phone, customerId: data.customer.id });
      }
      trackLead("Newsletter", "Círculo Emanella", { name, phone });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="bg-beige border-t border-blush">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        <p className="eyebrow mb-4">Círculo Emanella</p>
        <h2 className="font-serif text-3xl md:text-4xl font-medium text-cacao mb-4">
          Entra al círculo Emanella
        </h2>
        <p className="font-sans text-cacao-light font-light max-w-md mb-8">
          Lanzamientos, reabastecimientos y precios de inicio antes que nadie.
          Solo cuando valga la pena.
        </p>

        {status === "done" ? (
          <p className="font-sans text-sm text-gold-dark tracking-wide">
            Listo, ya estás en el círculo. Te escribimos por WhatsApp cuando valga la pena.
          </p>
        ) : (
          <form onSubmit={submit} className="w-full max-w-md flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="flex-1 border border-blush bg-cream px-4 py-3 text-sm text-cacao outline-none focus:border-gold font-sans"
              aria-label="Nombre"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="WhatsApp (3XX XXX XXXX)"
              required
              className="flex-1 border border-blush bg-cream px-4 py-3 text-sm text-cacao outline-none focus:border-gold font-sans"
              aria-label="Número de WhatsApp"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="bg-warm-black text-on-dark px-6 py-3 font-sans text-[11px] tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors disabled:opacity-70"
            >
              {status === "sending" ? "Enviando…" : "Unirme"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="mt-3 font-sans text-xs text-red-700">
            Revisa el número: 10 dígitos empezando por 3.
          </p>
        )}
      </div>
    </section>
  );
}
