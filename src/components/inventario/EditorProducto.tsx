"use client";
// src/components/inventario/EditorProducto.tsx
// Editor de un producto. El Stock Disponible es una FÓRMULA del Excel, así que
// aquí es solo lectura (se previsualiza en vivo). Se editan las ENTRADAS:
// Venta Detal (registrar ventas, baja el stock) y Stock Inicial (reabastecer).
import { useState } from "react";
import { X, Minus, Plus, ShoppingCart, PackagePlus } from "lucide-react";
import {
  ESTADOS,
  ESTADO_AGOTADO,
  formatMoney,
  parseNumero,
  calcularStock,
  type InventarioItem,
} from "@/lib/inventario";

interface Props {
  item: InventarioItem;
  onCerrar: () => void;
  onGuardado: (fila: number, patch: Partial<InventarioItem>) => void;
}

export default function EditorProducto({ item, onCerrar, onGuardado }: Props) {
  const [ventaDetal, setVentaDetal] = useState<number>(Math.max(0, item.ventaDetal));
  const [stockInicial, setStockInicial] = useState<number>(Math.max(0, item.stockInicial));
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

  // Stock disponible previsualizado, igual que la fórmula del Excel.
  const stockPreview = calcularStock({
    stockInicial,
    ventaDetal,
    ventaMayorista: item.ventaMayorista,
    regalos: item.regalos,
  });

  // Registrar una venta: si deja el stock en 0, el artículo se marca solo como
  // "Se debe volver a comprar" (igual que la regla del Excel). Se puede corregir
  // a mano abajo antes de guardar.
  const registrarVenta = () => {
    const nuevo = ventaDetal + 1;
    setVentaDetal(nuevo);
    const restante = calcularStock({
      stockInicial,
      ventaDetal: nuevo,
      ventaMayorista: item.ventaMayorista,
      regalos: item.regalos,
    });
    if (restante <= 0 && estado !== ESTADO_AGOTADO) setEstado(ESTADO_AGOTADO);
  };

  const guardar = async () => {
    setError("");
    setGuardando(true);
    try {
      const res = await fetch("/api/inventario", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fila: item.fila,
          stockInicial,
          ventaDetal,
          precioCompra: nCompra,
          precioMayorista: parseNumero(precioMayorista),
          precioDetal: nDetal,
          estado,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No se pudo guardar");
        return;
      }
      onGuardado(item.fila, {
        stock: stockPreview,
        stockInicial,
        ventaDetal,
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

        {/* Stock disponible: calculado (solo lectura) */}
        <div className="mb-4 flex items-end justify-between border border-blush bg-bg-card px-4 py-3">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
              Stock disponible
            </p>
            <p className="font-sans text-[10px] text-warm-gray">calculado por el Excel</p>
          </div>
          <p
            className={`font-serif text-3xl font-semibold ${
              stockPreview > 0 ? "text-cacao" : "text-red-600"
            }`}
          >
            {stockPreview}
          </p>
        </div>

        {/* Registrar venta (detal) */}
        <label className="mb-1.5 flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
          <ShoppingCart size={12} /> Ventas al detal
        </label>
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={() => setVentaDetal((v) => Math.max(0, v - 1))}
            aria-label="Quitar una venta"
            className="flex w-12 items-center justify-center border border-blush bg-bg-card text-cacao active:bg-beige"
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={ventaDetal}
            onChange={(e) => setVentaDetal(Math.max(0, Math.round(Number(e.target.value) || 0)))}
            className="w-full border-y border-blush bg-bg-card px-3 py-3 text-center font-serif text-2xl text-cacao outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={registrarVenta}
            disabled={stockPreview <= 0}
            aria-label="Registrar una venta"
            className="flex w-12 items-center justify-center border border-blush bg-warm-black text-on-dark active:bg-gold-dark disabled:opacity-40"
          >
            <Plus size={16} />
          </button>
        </div>
        <p className="mt-1 font-sans text-[11px] text-warm-gray">
          Cada venta baja el stock. {item.ventaDetal > 0 && `Van ${item.ventaDetal} registradas.`}
        </p>

        {/* Reabastecer (stock inicial) */}
        <label className="mb-1.5 mt-4 flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
          <PackagePlus size={12} /> Stock inicial (entradas)
        </label>
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={() => setStockInicial((v) => Math.max(0, v - 1))}
            aria-label="Restar una entrada"
            className="flex w-12 items-center justify-center border border-blush bg-bg-card text-cacao active:bg-beige"
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={stockInicial}
            onChange={(e) => setStockInicial(Math.max(0, Math.round(Number(e.target.value) || 0)))}
            className="w-full border-y border-blush bg-bg-card px-3 py-3 text-center font-serif text-xl text-cacao outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={() => setStockInicial((v) => v + 1)}
            aria-label="Sumar una entrada"
            className="flex w-12 items-center justify-center border border-blush bg-bg-card text-cacao active:bg-beige"
          >
            <Plus size={16} />
          </button>
        </div>
        <p className="mt-1 font-sans text-[11px] text-warm-gray">
          Súbelo cuando compres más unidades.
        </p>

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
