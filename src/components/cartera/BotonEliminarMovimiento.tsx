"use client";
// src/components/cartera/BotonEliminarMovimiento.tsx
// Elimina un movimiento (fiado o abono) por si se registró por error.
// Pide confirmación antes de borrar.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface Props {
  tipo: "venta" | "abono";
  id: string;
}

export default function BotonEliminarMovimiento({ tipo, id }: Props) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [borrando, setBorrando] = useState(false);

  const eliminar = async () => {
    setBorrando(true);
    try {
      const url = tipo === "venta" ? "/api/cartera/ventas" : "/api/cartera/abonos";
      const body = tipo === "venta" ? { ventaId: id } : { abonoId: id };
      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setBorrando(false);
      setConfirmando(false);
    }
  };

  if (confirmando) {
    return (
      <span className="flex items-center gap-2">
        <button
          type="button"
          onClick={eliminar}
          disabled={borrando}
          className="font-sans text-[11px] uppercase tracking-wider text-red-600 disabled:opacity-50"
        >
          {borrando ? "…" : "Eliminar"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          disabled={borrando}
          className="font-sans text-[11px] uppercase tracking-wider text-warm-gray"
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
      aria-label={`Eliminar ${tipo === "venta" ? "fiado" : "abono"}`}
      className="flex h-7 w-7 items-center justify-center text-warm-gray transition-colors hover:text-red-600"
    >
      <Trash2 size={15} strokeWidth={1.5} />
    </button>
  );
}
