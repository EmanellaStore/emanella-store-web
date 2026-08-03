"use client";
// src/components/inventario/InventarioLista.tsx
// Lista del inventario (desde el Excel) con buscador, filtros y edición.
// Cada guardado escribe de vuelta en el Excel vía /api/inventario.
import { useMemo, useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import {
  formatMoney,
  normalizar,
  type InventarioItem,
} from "@/lib/inventario";
import EditorProducto from "./EditorProducto";

type Filtro = "todos" | "stock" | "agotado" | "comprar";

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "stock", label: "En stock" },
  { id: "agotado", label: "Agotados" },
  { id: "comprar", label: "Por comprar" },
];

export function estadoColor(estado: string, stock: number): string {
  const e = normalizar(estado);
  if (stock <= 0 || e.includes("volver a comprar")) return "text-red-600";
  if (e.includes("no disponible")) return "text-warm-gray";
  return "text-green-700";
}

export default function InventarioLista({
  itemsIniciales,
}: {
  itemsIniciales: InventarioItem[];
}) {
  const [items, setItems] = useState<InventarioItem[]>(itemsIniciales);
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [editando, setEditando] = useState<InventarioItem | null>(null);
  const [refrescando, setRefrescando] = useState(false);

  const resumen = useMemo(() => {
    const unidades = items.reduce((s, i) => s + Math.max(0, i.stock), 0);
    const valorCosto = items.reduce(
      (s, i) => s + Math.max(0, i.stock) * (i.precioCompra || 0),
      0
    );
    const enStock = items.filter((i) => i.stock > 0).length;
    return { unidades, valorCosto, enStock, total: items.length };
  }, [items]);

  const filtrados = useMemo(() => {
    const term = normalizar(q);
    return items.filter((i) => {
      if (term && !normalizar(i.nombre).includes(term)) return false;
      const e = normalizar(i.estado);
      if (filtro === "stock" && !(i.stock > 0)) return false;
      if (filtro === "agotado" && i.stock > 0) return false;
      if (filtro === "comprar" && !e.includes("volver a comprar")) return false;
      return true;
    });
  }, [items, q, filtro]);

  const refrescar = async () => {
    setRefrescando(true);
    try {
      const res = await fetch("/api/inventario", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) setItems(data.items);
    } catch {
      // silencioso: se mantiene lo que ya hay
    } finally {
      setRefrescando(false);
    }
  };

  const onGuardado = (fila: number, patch: Partial<InventarioItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.fila === fila ? { ...i, ...patch } : i))
    );
    setEditando(null);
  };

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <section className="border border-blush bg-warm-black px-5 py-4 text-on-dark">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-dark/60">
              Valor del inventario (a costo)
            </p>
            <p className="mt-1 font-serif text-3xl font-semibold text-gold">
              {formatMoney(resumen.valorCosto)}
            </p>
          </div>
          <button
            type="button"
            onClick={refrescar}
            disabled={refrescando}
            aria-label="Refrescar desde el Excel"
            className="flex h-9 w-9 items-center justify-center text-on-dark/70 active:text-gold disabled:opacity-50"
          >
            <RefreshCw size={17} className={refrescando ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="mt-2 flex gap-5 font-sans text-xs text-on-dark/70">
          <span>{resumen.unidades} unidades</span>
          <span>
            {resumen.enStock} de {resumen.total} con stock
          </span>
        </div>
      </section>

      {/* Buscador */}
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar producto…"
          className="w-full border border-blush bg-bg-card py-3 pl-9 pr-3 font-sans text-base text-cacao outline-none focus:border-gold"
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFiltro(f.id)}
            className={`shrink-0 border px-3 py-1.5 font-sans text-[11px] uppercase tracking-wider ${
              filtro === f.id
                ? "border-cacao bg-warm-black text-on-dark"
                : "border-blush bg-bg-card text-cacao"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="border border-blush bg-bg-card px-5 py-12 text-center">
          <p className="font-serif text-xl text-cacao">Sin resultados</p>
          <p className="mt-2 font-sans text-sm font-light text-cacao-light">
            {q ? "Prueba con otro nombre." : "No hay productos en este filtro."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-blush border border-blush bg-bg-card">
          {filtrados.map((i) => (
            <li key={i.fila}>
              <button
                type="button"
                onClick={() => setEditando(i)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left active:bg-beige"
              >
                <div className="min-w-0">
                  <p className="truncate font-sans text-[15px] text-cacao">{i.nombre}</p>
                  <p className="mt-0.5 flex items-center gap-2 font-sans text-xs">
                    <span className={estadoColor(i.estado, i.stock)}>
                      {i.stock > 0 ? `${i.stock} en stock` : "Agotado"}
                    </span>
                    {i.tipo && <span className="text-warm-gray">· {i.tipo}</span>}
                  </p>
                </div>
                <span className="shrink-0 text-right">
                  <span className="block font-serif text-base font-semibold text-cacao">
                    {i.precioDetal > 0 ? formatMoney(i.precioDetal) : "—"}
                  </span>
                  {i.precioCompra > 0 && i.precioDetal > 0 && (
                    <span className="font-sans text-[11px] text-warm-gray">
                      margen {formatMoney(i.precioDetal - i.precioCompra)}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {editando && (
        <EditorProducto
          item={editando}
          onCerrar={() => setEditando(null)}
          onGuardado={onGuardado}
        />
      )}
    </div>
  );
}
