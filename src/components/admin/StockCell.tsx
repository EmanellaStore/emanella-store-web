"use client";
// src/components/admin/StockCell.tsx — edición rápida de stock estilo Shopify:
// stepper [− stock +] con guardado inmediato y estado optimista.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";

interface StockCellProps {
  variantId: string;
  stock: number;
}

export default function StockCell({ variantId, stock: initial }: StockCellProps) {
  const [stock, setStock] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const save = async (payload: { stock?: number; delta?: number }, optimistic: number) => {
    const previous = stock;
    setStock(optimistic);
    setSaving(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, ...payload }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error);
      setStock(data.variant.stock);
      router.refresh();
    } catch {
      setStock(previous);
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-end gap-0.5">
      <span className={`inline-flex items-center border ${error ? "border-red-400" : "border-blush"} bg-cream`}>
        <button
          type="button"
          aria-label="Restar una unidad"
          disabled={saving || stock <= 0}
          onClick={() => save({ delta: -1 }, Math.max(0, stock - 1))}
          className="flex h-8 w-8 items-center justify-center text-cacao hover:text-gold-dark disabled:opacity-30"
        >
          <Minus size={12} strokeWidth={1.5} />
        </button>
        <input
          type="number"
          min={0}
          value={stock}
          disabled={saving}
          onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
          onBlur={(e) => {
            const v = Math.max(0, parseInt(e.target.value) || 0);
            if (v !== initial) save({ stock: v }, v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className={`w-14 bg-transparent text-center font-sans text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
            saving ? "text-warm-gray" : "text-cacao"
          }`}
        />
        <button
          type="button"
          aria-label="Sumar una unidad"
          disabled={saving}
          onClick={() => save({ delta: 1 }, stock + 1)}
          className="flex h-8 w-8 items-center justify-center text-cacao hover:text-gold-dark disabled:opacity-30"
        >
          <Plus size={12} strokeWidth={1.5} />
        </button>
      </span>
      {error && (
        <span className="font-sans text-[10px] text-red-600">No se guardó, reintenta</span>
      )}
    </div>
  );
}
