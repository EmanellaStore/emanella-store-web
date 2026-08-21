"use client";
// src/components/cartera/BotonDevolverProducto.tsx
// Quita un producto de una venta cuando el cliente se retracta y lo devuelve.
// Recalcula el total de la venta y las unidades vuelven al stock del Excel.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Undo2 } from "lucide-react";

export default function BotonDevolverProducto({
  itemId,
  descripcion,
}: {
  itemId: string;
  descripcion: string;
}) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [quitando, setQuitando] = useState(false);

  const quitar = async () => {
    setQuitando(true);
    try {
      const res = await fetch("/api/cartera/ventas/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setQuitando(false);
      setConfirmando(false);
    }
  };

  if (confirmando) {
    return (
      <span className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={quitar}
          disabled={quitando}
          className="font-sans text-[10px] uppercase tracking-wider text-red-600 disabled:opacity-50"
        >
          {quitando ? "…" : "Devolver"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          disabled={quitando}
          className="font-sans text-[10px] uppercase tracking-wider text-warm-gray"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirmando(true)}
      aria-label={`Devolver ${descripcion}`}
      title="El cliente lo devolvió: vuelve al stock"
      className="flex h-6 w-6 shrink-0 items-center justify-center text-warm-gray transition-colors hover:text-red-600"
    >
      <Undo2 size={13} strokeWidth={1.5} />
    </button>
  );
}
