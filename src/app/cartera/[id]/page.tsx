// src/app/cartera/[id]/page.tsx — ficha de la persona: saldo, historial y acciones.
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ShoppingBag, HandCoins } from "lucide-react";
import { getFichaCliente } from "@/services/cartera.service";
import { formatMoney, formatFecha, estaVencida, diasDeAtraso } from "@/lib/cartera";
import AccionesCliente from "@/components/cartera/AccionesCliente";
import BotonEliminarMovimiento from "@/components/cartera/BotonEliminarMovimiento";
import BotonDevolverProducto from "@/components/cartera/BotonDevolverProducto";
import EliminarPersona from "@/components/cartera/EliminarPersona";

export const revalidate = 0;

type Props = { params: Promise<{ id: string }> };

export default async function FichaClientePage({ params }: Props) {
  const { id } = await params;
  const cliente = await getFichaCliente(id);
  if (!cliente) notFound();

  const ventas = cliente.ventas.filter((v) => !v.anulada);
  const proximoPago = ventas
    .filter((v) => v.tipo === "CREDITO" && v.fechaPago)
    .sort((a, b) => a.fechaPago!.getTime() - b.fechaPago!.getTime())[0]?.fechaPago ?? null;
  const vencido = estaVencida(proximoPago, cliente.saldo);

  // Línea de tiempo: ventas y abonos mezclados, lo más reciente arriba
  const movimientos = [
    ...ventas.map((v) => ({
      tipo: "venta" as const,
      id: v.id,
      fecha: v.fecha,
      total: Number(v.total),
      esContado: v.tipo === "CONTADO",
      items: v.items,
      notas: v.notas,
    })),
    ...cliente.abonos.map((a) => ({
      tipo: "abono" as const,
      id: a.id,
      fecha: a.fecha,
      total: Number(a.monto),
      metodo: a.metodo,
      nota: a.nota,
    })),
  ].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  // Texto para WhatsApp / copiar
  const lineas = [
    `Hola ${cliente.nombre}, este es tu estado de cuenta con Emanella:`,
    "",
    ...ventas
      .filter((v) => v.tipo === "CREDITO")
      .map(
        (v) =>
          `• ${formatFecha(v.fecha)} — ${v.items
            .map(
              (i) =>
                `${i.cantidad > 1 ? `${i.cantidad}x ` : ""}${i.descripcion}: ${formatMoney(
                  Number(i.precio) * i.cantidad
                )}`
            )
            .join(", ")}`
      ),
    ...(cliente.abonos.length
      ? ["", `Abonos: ${formatMoney(cliente.totalAbonos)}`]
      : []),
    "",
    cliente.saldo > 0
      ? `Saldo pendiente: ${formatMoney(cliente.saldo)}`
      : "¡Estás al día! Gracias 🌸",
  ];
  const estadoCuenta = lineas.join("\n");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/cartera"
          aria-label="Volver"
          className="-ml-2 flex h-9 w-9 items-center justify-center text-cacao"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="truncate font-serif text-2xl text-cacao">{cliente.nombre}</h1>
      </div>

      {/* Saldo */}
      <section
        className={`border px-5 py-5 ${
          cliente.saldo > 0 ? "border-blush bg-warm-black text-on-dark" : "border-green-300 bg-green-50"
        }`}
      >
        <p
          className={`font-sans text-[10px] uppercase tracking-[0.2em] ${
            cliente.saldo > 0 ? "text-on-dark/60" : "text-green-700"
          }`}
        >
          {cliente.saldo > 0 ? "Debe" : "Al día"}
        </p>
        <p
          className={`mt-1 font-serif text-4xl font-semibold ${
            cliente.saldo > 0 ? "text-gold" : "text-green-700"
          }`}
        >
          {formatMoney(Math.max(0, cliente.saldo))}
        </p>
        {cliente.saldo > 0 && (
          <p className="mt-2 font-sans text-xs text-on-dark/70">
            Fiado {formatMoney(cliente.totalVentas)} · Abonado{" "}
            {formatMoney(cliente.totalAbonos)}
            {proximoPago && (
              <>
                {" · "}
                {vencido ? (
                  <span className="text-amber-300">
                    venció hace {diasDeAtraso(proximoPago)} días
                  </span>
                ) : (
                  <>paga el {formatFecha(proximoPago)}</>
                )}
              </>
            )}
          </p>
        )}
      </section>

      <AccionesCliente
        clienteId={cliente.id}
        nombre={cliente.nombre}
        telefono={cliente.telefono}
        saldo={Math.max(0, cliente.saldo)}
        estadoCuenta={estadoCuenta}
      />

      {/* Historial */}
      <section>
        <h2 className="mb-2 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
          Movimientos
        </h2>
        {movimientos.length === 0 ? (
          <p className="border border-blush bg-bg-card px-4 py-8 text-center font-sans text-sm text-warm-gray">
            Todavía no hay movimientos.
          </p>
        ) : (
          <ul className="divide-y divide-blush border border-blush bg-bg-card">
            {movimientos.map((m) => (
              <li key={`${m.tipo}-${m.id}`} className="flex gap-3 px-4 py-3.5">
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    m.tipo === "abono" ? "bg-green-100 text-green-700" : "bg-beige text-cacao"
                  }`}
                >
                  {m.tipo === "abono" ? <HandCoins size={15} /> : <ShoppingBag size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-sans text-sm text-cacao">
                      {m.tipo === "abono"
                        ? "Abono"
                        : m.esContado
                          ? "Venta de contado"
                          : "Fiado"}
                    </p>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <span
                        className={`font-serif text-sm font-semibold ${
                          m.tipo === "abono" ? "text-green-700" : "text-cacao"
                        }`}
                      >
                        {m.tipo === "abono" ? "−" : "+"}
                        {formatMoney(m.total)}
                      </span>
                      <BotonEliminarMovimiento tipo={m.tipo} id={m.id} />
                    </span>
                  </div>
                  {m.tipo === "venta" && m.items.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {m.items.map((i) => (
                        <li
                          key={i.id}
                          className="flex items-baseline justify-between gap-2 font-sans text-xs text-cacao-light"
                        >
                          <span className="min-w-0 truncate">
                            {i.cantidad > 1 ? `${i.cantidad}x ${i.descripcion}` : i.descripcion}
                          </span>
                          <span className="flex shrink-0 items-center gap-1">
                            <span className="text-warm-gray">
                              {formatMoney(Number(i.precio) * i.cantidad)}
                            </span>
                            <BotonDevolverProducto
                              itemId={i.id}
                              descripcion={i.descripcion}
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-0.5 font-sans text-[11px] text-warm-gray">
                    {formatFecha(m.fecha)}
                    {m.tipo === "abono" && m.metodo ? ` · ${m.metodo}` : ""}
                    {m.tipo === "abono" && m.nota ? ` · ${m.nota}` : ""}
                    {m.tipo === "venta" && m.notas ? ` · ${m.notas}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Sacar a la persona de la cartera (con su historial) */}
      <div className="pt-2">
        <EliminarPersona clienteId={cliente.id} nombre={cliente.nombre} />
      </div>

      <Link
        href={`/cartera/nuevo?cliente=${cliente.id}`}
        className="fixed bottom-5 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-center gap-2 bg-warm-black py-4 font-sans text-[12px] uppercase tracking-[0.2em] text-on-dark shadow-lg active:bg-gold-dark"
      >
        Nueva venta a {cliente.nombre.split(" ")[0]}
      </Link>
    </div>
  );
}
