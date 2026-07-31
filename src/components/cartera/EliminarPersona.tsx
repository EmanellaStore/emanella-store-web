"use client";
// src/components/cartera/EliminarPersona.tsx
// Saca a una persona de la cartera junto con todo su historial. Doble confirmación.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function EliminarPersona({
  clienteId,
  nombre,
}: {
  clienteId: string;
  nombre: string;
}) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [borrando, setBorrando] = useState(false);

  const eliminar = async () => {
    setBorrando(true);
    try {
      const res = await fetch("/api/cartera/clientes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId }),
      });
      if (!res.ok) throw new Error();
      router.push("/cartera");
      router.refresh();
    } catch {
      setBorrando(false);
      setConfirmando(false);
    }
  };

  if (confirmando) {
    return (
      <div className="border border-red-300 bg-red-50 p-4 text-center">
        <p className="mb-3 font-sans text-sm text-red-700">
          ¿Eliminar a {nombre} y todo su historial? No se puede deshacer.
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={eliminar}
            disabled={borrando}
            className="bg-red-600 px-5 py-2.5 font-sans text-[11px] uppercase tracking-wider text-white disabled:opacity-60"
          >
            {borrando ? "Eliminando…" : "Sí, eliminar"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmando(false)}
            disabled={borrando}
            className="border border-blush px-5 py-2.5 font-sans text-[11px] uppercase tracking-wider text-cacao"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirmando(true)}
      className="mx-auto flex items-center gap-2 py-2 font-sans text-[11px] uppercase tracking-wider text-warm-gray transition-colors hover:text-red-600"
    >
      <Trash2 size={13} /> Eliminar esta persona
    </button>
  );
}
