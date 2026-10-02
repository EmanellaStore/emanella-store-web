"use client";
// src/components/cartera/HistorialVendidos.tsx
// Perfumes vendidos agrupados por día (hora Colombia), del más reciente al más
// viejo. Se filtra por mes y se busca por perfume o por persona; el resumen de
// arriba siempre refleja lo que se está viendo.
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatMoney } from "@/lib/cartera";
import { normalizar } from "@/lib/inventario";
import type { VendidoHistorial } from "@/services/cartera.service";

const TODOS = "todos";

export default function HistorialVendidos({
  vendidos,
}: {
  vendidos: VendidoHistorial[];
}) {
  const [q, setQ] = useState("");
  const [mes, setMes] = useState<string>(TODOS);

  // Meses con ventas ("2026-09"), del más reciente al más viejo.
  const meses = useMemo(() => {
    const vistos = new Map<string, string>();
    for (const v of vendidos) if (!vistos.has(v.mesClave)) vistos.set(v.mesClave, v.mesLargo);
    return [...vistos.entries()].map(([clave, largo]) => ({
      clave,
      etiqueta: largo.replace(/ de \d{4}$/, ""),
      anio: largo.slice(-4),
    }));
  }, [vendidos]);

  const filtrados = useMemo(() => {
    const terms = normalizar(q).split(/\s+/).filter(Boolean);
    return vendidos.filter((v) => {
      if (mes !== TODOS && v.mesClave !== mes) return false;
      if (terms.length === 0) return true;
      const texto = normalizar(`${v.descripcion} ${v.clienteNombre}`);
      return terms.every((t) => texto.includes(t));
    });
  }, [vendidos, q, mes]);

  const resumen = useMemo(() => {
    const vigentes = filtrados.filter((v) => !v.anulada);
    const total = vigentes.reduce((s, v) => s + v.total, 0);
    const porCobrar = vigentes.reduce((s, v) => s + v.pendiente, 0);
    return {
      unidades: vigentes.reduce((s, v) => s + v.cantidad, 0),
      total,
      porCobrar,
      cobrado: total - porCobrar,
    };
  }, [filtrados]);

  // Agrupa por día calendario de Colombia (ya vienen ordenados por fecha).
  const dias = useMemo(() => {
    const grupos: { clave: string; largo: string; items: VendidoHistorial[] }[] = [];
    for (const v of filtrados) {
      const ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.clave === v.diaClave) ultimo.items.push(v);
      else grupos.push({ clave: v.diaClave, largo: v.diaLargo, items: [v] });
    }
    return grupos;
  }, [filtrados]);

  const mostrarAnio = new Set(meses.map((m) => m.anio)).size > 1;

  return (
    <div className="space-y-4">
      {/* Resumen de lo que se está viendo */}
      <section aria-label="Resumen" className="space-y-3">
        <p className="font-sans text-sm text-cacao-light">
          <span className="font-serif text-lg font-semibold text-cacao">
            {resumen.unidades}
          </span>{" "}
          {resumen.unidades === 1 ? "perfume vendido" : "perfumes vendidos"} ·{" "}
          <span className="font-serif text-lg font-semibold text-cacao">
            {formatMoney(resumen.total)}
          </span>
        </p>

        {resumen.total > 0 && (
          <div>
            {/* Qué parte de lo vendido ya entró */}
            <div
              className="h-1 bg-blush"
              role="img"
              aria-label={`Cobrado el ${Math.round((resumen.cobrado / resumen.total) * 100)} %`}
            >
              <div
                className="h-full bg-gold-dark"
                style={{ width: `${(resumen.cobrado / resumen.total) * 100}%` }}
              />
            </div>
            <dl className="mt-2.5 grid grid-cols-2 gap-3">
              <div>
                <dt className="font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
                  Cobrado
                </dt>
                <dd className="mt-0.5 font-serif text-lg font-semibold text-gold-dark">
                  {formatMoney(resumen.cobrado)}
                </dd>
              </div>
              <div className="text-right">
                <dt className="font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
                  Por cobrar
                </dt>
                <dd className="mt-0.5 font-serif text-lg font-semibold text-cacao">
                  {formatMoney(resumen.porCobrar)}
                </dd>
              </div>
            </dl>
          </div>
        )}
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
          placeholder="Buscar perfume o persona…"
          aria-label="Buscar perfume o persona"
          className="w-full border border-blush bg-bg-card py-3 pl-9 pr-3 font-sans text-base text-cacao outline-none focus:border-gold"
        />
      </div>

      {/* Meses */}
      {meses.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[{ clave: TODOS, etiqueta: "Todo", anio: "" }, ...meses].map((m) => (
            <button
              key={m.clave}
              type="button"
              onClick={() => setMes(m.clave)}
              aria-pressed={mes === m.clave}
              className={`shrink-0 border px-3 py-1.5 font-sans text-[11px] uppercase tracking-wider ${
                mes === m.clave
                  ? "border-cacao bg-warm-black text-on-dark"
                  : "border-blush bg-bg-card text-cacao"
              }`}
            >
              {m.etiqueta}
              {mostrarAnio && m.anio ? ` ${m.anio}` : ""}
            </button>
          ))}
        </div>
      )}

      {/* Días */}
      {dias.length === 0 ? (
        <div className="border border-blush bg-bg-card px-5 py-12 text-center">
          <p className="font-serif text-xl text-cacao">
            {vendidos.length === 0 ? "Aún no hay ventas" : "Sin resultados"}
          </p>
          <p className="mt-2 font-sans text-sm font-light text-cacao-light">
            {vendidos.length === 0
              ? "Cada venta que registres en la cartera aparece aquí."
              : "Prueba con otro perfume, otra persona u otro mes."}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {dias.map((dia) => {
            const vigentes = dia.items.filter((v) => !v.anulada);
            const unidades = vigentes.reduce((s, v) => s + v.cantidad, 0);
            const total = vigentes.reduce((s, v) => s + v.total, 0);
            return (
              <section key={dia.clave} aria-label={dia.largo}>
                <header className="mb-1.5 flex items-baseline justify-between gap-3">
                  <h2 className="font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
                    {dia.largo}
                  </h2>
                  <span className="shrink-0 font-sans text-[11px] text-warm-gray">
                    {unidades} · {formatMoney(total)}
                  </span>
                </header>

                <ul className="border border-blush bg-bg-card">
                  {dia.items.map((v) => (
                    <li key={v.id} className="group flex items-stretch">
                      {/* Columna de hora: el hilo dorado del registro */}
                      <div className="w-[5.25rem] shrink-0 border-r border-gold/50 py-3 pl-2 pr-2.5 text-right">
                        <span className="whitespace-nowrap font-sans text-xs tabular-nums text-cacao-light">
                          {v.hora ?? "—"}
                        </span>
                      </div>

                      <div className="flex min-w-0 flex-1 items-start justify-between gap-3 border-b border-blush px-3 py-3 group-last:border-b-0">
                        <div className="min-w-0">
                          <p
                            className={`font-sans text-[15px] leading-snug text-cacao ${
                              v.anulada ? "line-through opacity-50" : ""
                            }`}
                          >
                            {v.cantidad > 1 && (
                              <span className="text-gold-dark">{v.cantidad}× </span>
                            )}
                            {v.descripcion}
                          </p>
                          <p className="mt-0.5 font-sans text-xs text-warm-gray">
                            <Link
                              href={`/cartera/${v.clienteId}`}
                              className="text-cacao-light underline decoration-blush underline-offset-2 active:text-gold-dark"
                            >
                              {v.clienteNombre}
                            </Link>
                            {" · "}
                            {v.anulada
                              ? "Anulada"
                              : v.tipo === "CONTADO"
                                ? "De contado"
                                : "Fiado"}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 font-serif text-base font-semibold text-cacao ${
                            v.anulada ? "line-through opacity-50" : ""
                          }`}
                        >
                          {formatMoney(v.total)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
