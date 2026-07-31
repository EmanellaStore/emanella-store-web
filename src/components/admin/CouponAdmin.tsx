"use client";
// src/components/admin/CouponAdmin.tsx — crear cupón manual + activar/desactivar.
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateCouponForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    code: "",
    type: "PERCENT",
    value: "",
    minAmount: "",
    maxUses: "",
    expiresAt: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No se pudo crear el cupón");
        return;
      }
      setForm({ code: "", type: "PERCENT", value: "", minAmount: "", maxUses: "", expiresAt: "" });
      setOpen(false);
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-warm-black px-4 py-2 font-sans text-[11px] uppercase tracking-widest text-on-dark hover:bg-gold-dark transition-colors"
      >
        + Crear cupón
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-bg-card border border-blush p-5 space-y-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="block">
          <span className="block font-sans text-[10px] uppercase tracking-widest text-warm-gray mb-1.5">
            Código (vacío = autogenerado)
          </span>
          <input
            type="text"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            placeholder="EJ: LILA10"
            className="w-full border border-blush bg-cream px-3 py-2 font-sans text-sm uppercase outline-none focus:border-gold"
          />
        </label>
        <label className="block">
          <span className="block font-sans text-[10px] uppercase tracking-widest text-warm-gray mb-1.5">Tipo</span>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="w-full border border-blush bg-cream px-3 py-2 font-sans text-sm outline-none focus:border-gold"
          >
            <option value="PERCENT">Porcentaje (%)</option>
            <option value="FIXED">Valor fijo ($)</option>
          </select>
        </label>
        <label className="block">
          <span className="block font-sans text-[10px] uppercase tracking-widest text-warm-gray mb-1.5">
            Valor {form.type === "PERCENT" ? "(%)" : "($)"}
          </span>
          <input
            type="number"
            required
            min={1}
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            placeholder={form.type === "PERCENT" ? "10" : "20000"}
            className="w-full border border-blush bg-cream px-3 py-2 font-sans text-sm outline-none focus:border-gold"
          />
        </label>
        <label className="block">
          <span className="block font-sans text-[10px] uppercase tracking-widest text-warm-gray mb-1.5">
            Compra mínima ($, opcional)
          </span>
          <input
            type="number"
            min={0}
            value={form.minAmount}
            onChange={(e) => setForm((f) => ({ ...f, minAmount: e.target.value }))}
            placeholder="100000"
            className="w-full border border-blush bg-cream px-3 py-2 font-sans text-sm outline-none focus:border-gold"
          />
        </label>
        <label className="block">
          <span className="block font-sans text-[10px] uppercase tracking-widest text-warm-gray mb-1.5">
            Usos máximos (opcional)
          </span>
          <input
            type="number"
            min={1}
            value={form.maxUses}
            onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
            placeholder="Ilimitado"
            className="w-full border border-blush bg-cream px-3 py-2 font-sans text-sm outline-none focus:border-gold"
          />
        </label>
        <label className="block">
          <span className="block font-sans text-[10px] uppercase tracking-widest text-warm-gray mb-1.5">
            Vence (opcional)
          </span>
          <input
            type="datetime-local"
            value={form.expiresAt}
            onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
            className="w-full border border-blush bg-cream px-3 py-2 font-sans text-sm outline-none focus:border-gold"
          />
        </label>
      </div>
      {error && <p className="font-sans text-xs text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-warm-black px-5 py-2.5 font-sans text-[11px] uppercase tracking-widest text-on-dark hover:bg-gold-dark transition-colors disabled:opacity-60"
        >
          {saving ? "Creando…" : "Crear cupón"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="border border-blush px-5 py-2.5 font-sans text-[11px] uppercase tracking-widest text-cacao hover:border-gold transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function CouponToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !active }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      className={`px-3 py-1 font-sans text-[10px] uppercase tracking-widest border transition-colors disabled:opacity-50 ${
        active
          ? "border-blush text-warm-gray hover:border-red-300 hover:text-red-600"
          : "border-green-300 text-green-700 hover:bg-green-50"
      }`}
    >
      {saving ? "…" : active ? "Desactivar" : "Activar"}
    </button>
  );
}
