"use client";
// src/components/inventario/EditorProducto.tsx
// Modal para editar stock, precios y estado de un producto. Guarda en el Excel.
import { useState } from "react";
import { X, Minus, Plus } from "lucide-react";
import {
  ESTADOS,
  formatMoney,
  parseNumero,
  type InventarioItem,
} from "@/lib/inventario";

interface Props {
  item: InventarioItem;
  onCerrar: () => void;
  onGuardado: (fila: number, patch: Partial<InventarioItem>) => void;
}

export default function EditorProducto({ item, onCerrar, onGuardado }: Props) {
  const [stock, setStock] = useState<number>(Math.max(0, item.stock));
  const [precioCompra, setPrecioCompra] = useState(
    item.precioCompra ? String(item.precioCompra) : ""
  );
  const [precioMayorista, setPrecioMayorista] = useState(
    item.precioMayorista ? String(item.precioMayorista) : ""
  );
  const [precioDetal, setPrecioDetal] = useState(
    item.precioDetal ? String(item.precioDetal) : ""
  );
  const [estado, setEstado] = useState(item.estado || ESTADOS[0]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const nCompra = parseNumero(precioCompra);
  const nDetal = parseNumero(precioDetal);
  const margen = nDetal > 0 && nCompra > 0 ? nDetal - nCompra : null;

  const guardar = async () => {
    setError("");
    const patch = {
      fila: item.fila,
      stock,
      precioCompra: nCompra,
      precioMayorista: parseNumero(precioMayorista),
      precioDetal: nDetal,
      estado,
    };
    setGuardando(true);
    try {
      const res = await fetch("/api/inventario", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No se pudo guardar");
        return;
      }
      onGuardado(item.fila, {
        stock,
        precioCompra: nCompra,
        precioMayorista: parseNumero(precioMayorista),
        precioDetal: nDetal,
        estado,
      });
    } catch {
      setError("Error de conexión");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCerrar}
        className="absolute inset-0 bg-warm-black/50"
      />
      <div className="relative max-h-[92vh] w-full overflow-y-auto bg-cream p-5 pb-8 sm:max-w-sm sm:border sm:border-blush sm:pb-6 sm:shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="font-serif text-xl leading-tight text-cacao">{item.nombre}</h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="mt-1 shrink-0">
            <X size={20} className="text-warm-gray" />
          </button>
        </div>

        {/* Stock con stepper */}
        <label className="mb-1.5 block font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
          Stock disponible
        </label>
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={() => setStock((s) => Math.max(0, s - 1))}
            aria-label="Restar uno"
            className="flex w-12 items-center justify-center border border-blush bg-bg-card text-cacao active:bg-beige"
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={stock}
            onChange={(e) => setStock(Math.max(0, Math.round(Number(e.target.value) || 0)))}
            className="w-full border-y border-blush bg-bg-card px-3 py-3 text-center font-serif text-2xl text-cacao outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={() => setStock((s) => s + 1)}
            aria-label="Sumar uno"
            className="flex w-12 items-center justify-center border border-blush bg-bg-card text-cacao active:bg-beige"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Precios */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <CampoPrecio label="Precio compra" valor={precioCompra} onChange={setPrecioCompra} />
          <CampoPrecio label="Precio mayorista" valor={precioMayorista} onChange={setPrecioMayorista} />
        </div>
        <div className="mt-3">
          <CampoPrecio
            label="Precio detal (público)"
            valor={precioDetal}
            onChange={setPrecioDetal}
            destacado
          />
        </div>
        {margen != null && (
          <p className="mt-1.5 font-sans text-[11px] text-warm-gray">
            Margen: {formatMoney(margen)}
          </p>
        )}

        {/* Estado */}
        <label className="mb-1.5 mt-4 block font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
          Estado
        </label>
        <div className="grid gap-2">
          {ESTADOS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEstado(e)}
              className={`border px-3 py-2.5 text-left font-sans text-[12px] uppercase tracking-wider ${
                estado === e
                  ? "border-cacao bg-warm-black text-on-dark"
                  : "border-blush bg-bg-card text-cacao"
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-3 border border-red-300 bg-red-50 px-3 py-2 font-sans text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          className="mt-5 w-full bg-warm-black py-4 font-sans text-[12px] uppercase tracking-[0.2em] text-on-dark active:bg-gold-dark disabled:opacity-60"
        >
          {guardando ? "Guardando…" : "Guardar en el Excel"}
        </button>
      </div>
    </div>
  );
}

function CampoPrecio({
  label,
  valor,
  onChange,
  destacado,
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  destacado?: boolean;
}) {
  const n = parseNumero(valor);
  return (
    <div>
      <label className="mb-1.5 block font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
        {label}
      </label>
      <input
        type="text"
        inputMode="numeric"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className={`w-full border bg-bg-card px-3 py-3 font-sans text-base text-cacao outline-none focus:border-gold ${
          destacado ? "border-gold" : "border-blush"
        }`}
      />
      <p className="mt-1 font-sans text-[11px] text-warm-gray">
        {n > 0 ? formatMoney(n) : "—"}
      </p>
    </div>
  );
}
