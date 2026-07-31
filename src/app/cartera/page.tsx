// src/app/cartera/page.tsx — Inicio: cuánto hay por cobrar y quién debe.
import Link from "next/link";
import { Plus, Search, AlertTriangle } from "lucide-react";
import { getClientesConSaldo, getResumenCartera } from "@/services/cartera.service";
import { formatMoney, formatFecha, diasDeAtraso } from "@/lib/cartera";

export const revalidate = 0;

type Props = {
  searchParams?: Promise<{ q?: string; todos?: string }>;
};

export default async function CarteraInicioPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = typeof params?.q === "string" ? params.q.trim() : "";
  const verTodos = params?.todos === "1";

  const [resumen, clientes] = await Promise.all([
    getResumenCartera(),
    getClientesConSaldo({ q, incluirSaldados: verTodos }),
  ]);

  return (
    <div className="space-y-5">
      {/* Resumen */}
      <section className="border border-blush bg-warm-black px-5 py-5 text-on-dark">
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-dark/60">
          Por cobrar
        </p>
        <p className="mt-1 font-serif text-4xl font-semibold text-gold">
          {formatMoney(resumen.totalPorCobrar)}
        </p>
        <div className="mt-3 flex gap-5 font-sans text-xs text-on-dark/70">
          <span>
            {resumen.personasQueDeben}{" "}
            {resumen.personasQueDeben === 1 ? "persona debe" : "personas deben"}
          </span>
          {resumen.vencidos > 0 && (
            <span className="flex items-center gap-1.5 text-amber-300">
              <AlertTriangle size={13} /> {resumen.vencidos} vencido
              {resumen.vencidos === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </section>

      {/* Buscador */}
      <form action="/cartera" className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar persona…"
            className="w-full border border-blush bg-bg-card py-3 pl-9 pr-3 font-sans text-base text-cacao outline-none focus:border-gold"
          />
        </div>
        {verTodos && <input type="hidden" name="todos" value="1" />}
      </form>

      {/* Lista */}
      {clientes.length === 0 ? (
        <div className="border border-blush bg-bg-card px-5 py-12 text-center">
          <p className="font-serif text-xl text-cacao">
            {q ? "Nadie coincide con esa búsqueda" : "No hay nada por cobrar"}
          </p>
          <p className="mt-2 font-sans text-sm font-light text-cacao-light">
            {q
              ? "Prueba con otro nombre."
              : "Cuando fíes algo, aparecerá aquí con su saldo."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-blush border border-blush bg-bg-card">
          {clientes.map((c) => {
            const atraso = c.vencido ? diasDeAtraso(c.proximoVencimiento) : 0;
            return (
              <li key={c.id}>
                <Link
                  href={`/cartera/${c.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-4 active:bg-beige"
                >
                  <div className="min-w-0">
                    <p className="truncate font-sans text-base text-cacao">{c.nombre}</p>
                    <p className="mt-0.5 font-sans text-xs text-warm-gray">
                      {c.saldo <= 0 ? (
                        "Al día"
                      ) : c.vencido ? (
                        <span className="text-red-600">
                          Venció hace {atraso} {atraso === 1 ? "día" : "días"}
                        </span>
                      ) : c.proximoVencimiento ? (
                        `Paga el ${formatFecha(c.proximoVencimiento)}`
                      ) : (
                        "Sin fecha de pago"
                      )}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 font-serif text-lg font-semibold ${
                      c.saldo <= 0 ? "text-green-700" : c.vencido ? "text-red-600" : "text-gold-dark"
                    }`}
                  >
                    {formatMoney(c.saldo)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="text-center">
        <Link
          href={verTodos ? "/cartera" : "/cartera?todos=1"}
          className="font-sans text-[11px] uppercase tracking-[0.2em] text-gold-dark"
        >
          {verTodos ? "Ver solo quienes deben" : "Ver todas las personas"}
        </Link>
      </div>

      {/* Botón principal: siempre al alcance del pulgar */}
      <Link
        href="/cartera/nuevo"
        className="fixed bottom-5 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-center gap-2 bg-warm-black py-4 font-sans text-[12px] uppercase tracking-[0.2em] text-on-dark shadow-lg active:bg-gold-dark"
      >
        <Plus size={16} /> Nueva venta
      </Link>
    </div>
  );
}
