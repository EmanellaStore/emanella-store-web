"use client";
// src/components/inventario/NuevoProducto.tsx
// Agrega un producto nuevo al Excel (fila nueva con las fórmulas heredadas).
import { useState } from "react";
import { X } from "lucide-react";
import { ESTADOS, formatMoney, parseNumero } from "@/lib/inventario";

const TIPOS = ["Men", "Women", "Unisex"];

export default function NuevoProducto({
  onCerrar,
  onCreado,
}: {
  onCerrar: () => void;
  onCreado: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [stockInicial, setStockInicial] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioMayorista, setPrecioMayorista] = useState("");
  const [precioDetal, setPrecioDetal] = useState("");
  const [estado, setEstado] = useState<string>(ESTADOS[0]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const guardar = async () => {
    setError("");
    if (!nombre.trim()) {
      setError("Escribe el nombre del producto");
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          tipo: tipo || undefined,
          stockInicial: stockInicial === "" ? undefined : Math.round(Number(stockInicial) || 0),
          precioCompra: parseNumero(precioCompra) || undefined,
          precioMayorista: parseNumero(precioMayorista) || undefined,
          precioDetal: parseNumero(precioDetal) || undefined,
          estado,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No se pudo agregar");
        return;
      }
      onCreado();
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
          <h2 className="font-serif text-xl text-cacao">Nuevo producto</h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="mt-1 shrink-0">
            <X size={20} className="text-warm-gray" />
          </button>
        </div>

        {/* Nombre */}
        <label className="mb-1.5 block font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
          Nombre
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Lattafa Yara Moi"
          autoFocus
          className="w-full border border-blush bg-bg-card px-3 py-3 font-sans text-base text-cacao outline-none focus:border-gold"
        />

        {/* Tipo */}
        <label className="mb-1.5 mt-4 block font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
          Tipo
        </label>
        <div className="grid grid-cols-3 gap-2">
          {TIPOS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo((prev) => (prev === t ? "" : t))}
              className={`border py-2.5 font-sans text-[12px] uppercase tracking-wider ${
                tipo === t
                  ? "border-cacao bg-warm-black text-on-dark"
                  : "border-blush bg-bg-card text-cacao"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Stock inicial */}
        <label className="mb-1.5 mt-4 block font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
          Stock inicial
        </label>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={stockInicial}
          onChange={(e) => setStockInicial(e.target.value)}
          placeholder="0"
          className="w-full border border-blush bg-bg-card px-3 py-3 font-serif text-xl text-cacao outline-none focus:border-gold"
        />

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
          {guardando ? "Agregando…" : "Agregar al Excel"}
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
      <p className="mt-1 font-sans text-[11px] text-warm-gray">{n > 0 ? formatMoney(n) : "—"}</p>
    </div>
  );
}
