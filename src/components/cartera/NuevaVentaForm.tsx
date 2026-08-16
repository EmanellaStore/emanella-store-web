"use client";
// src/components/cartera/NuevaVentaForm.tsx — registrar una venta fiada o de contado.
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Plus, Minus, Check } from "lucide-react";
import InputMonto from "./InputMonto";
import { parseMonto, formatMoney, fechaPagoSugerida, METODOS_PAGO } from "@/lib/cartera";

interface ClienteSugerido {
  id: string;
  nombre: string;
  saldo: number;
}

interface ProductoSugerido {
  productId: string | null;
  variantId: string | null;
  nombre: string;
  presentacion: string;
  precio: number;
  borrador?: boolean;
}

interface ItemVenta {
  key: string;
  productId: string | null;
  variantId: string | null;
  descripcion: string;
  presentacion: string;
  cantidad: number;
  precioTexto: string;
}

function aInputDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function NuevaVentaForm({
  clienteInicial = null,
}: {
  clienteInicial?: ClienteSugerido | null;
}) {
  const router = useRouter();

  const [tipo, setTipo] = useState<"CREDITO" | "CONTADO">("CREDITO");
  const [metodoPago, setMetodoPago] = useState<string>("Efectivo");

  const [clienteTexto, setClienteTexto] = useState("");
  const [clienteSel, setClienteSel] = useState<ClienteSugerido | null>(clienteInicial);
  const [sugerenciasCliente, setSugerenciasCliente] = useState<ClienteSugerido[]>([]);

  const [items, setItems] = useState<ItemVenta[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<ProductoSugerido[]>([]);
  const [buscando, setBuscando] = useState(false);

  const [fechaPago, setFechaPago] = useState(aInputDate(fechaPagoSugerida()));
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Sugerencias de personas ya registradas
  useEffect(() => {
    if (clienteSel || clienteTexto.trim().length < 2) {
      setSugerenciasCliente([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/cartera/clientes?q=${encodeURIComponent(clienteTexto)}`);
        const data = await res.json();
        setSugerenciasCliente((data.clientes ?? []).slice(0, 5));
      } catch {
        setSugerenciasCliente([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [clienteTexto, clienteSel]);

  // Búsqueda en el catálogo
  useEffect(() => {
    if (busqueda.trim().length < 2) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/cartera/productos?q=${encodeURIComponent(busqueda)}`);
        const data = await res.json();
        setResultados(data.resultados ?? []);
      } catch {
        setResultados([]);
      } finally {
        setBuscando(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [busqueda]);

  const agregarProducto = (p: ProductoSugerido) => {
    setItems((prev) => [
      ...prev,
      {
        key: `${p.variantId ?? p.nombre}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        productId: p.productId,
        variantId: p.variantId,
        descripcion: p.nombre,
        presentacion: p.presentacion,
        cantidad: 1,
        precioTexto: String(Math.round(p.precio / 1000)),
      },
    ]);
    setBusqueda("");
    setResultados([]);
  };

  const total = items.reduce(
    (s, i) => s + parseMonto(i.precioTexto) * Math.max(1, i.cantidad),
    0
  );

  const guardar = async () => {
    setError("");
    if (!clienteSel && !clienteTexto.trim()) {
      setError("Escribe a quién le vendiste");
      return;
    }
    if (items.length === 0 || total <= 0) {
      setError("Agrega al menos un producto con precio");
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch("/api/cartera/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: clienteSel?.id,
          clienteNombre: clienteSel ? undefined : clienteTexto.trim(),
          tipo,
          fechaPago: tipo === "CREDITO" ? fechaPago : null,
          metodoPago: tipo === "CONTADO" ? metodoPago : null,
          notas,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            descripcion: i.descripcion,
            cantidad: Math.max(1, i.cantidad),
            precio: parseMonto(i.precioTexto),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No se pudo guardar");
        return;
      }
      router.push(`/cartera/${data.venta.clienteId}`);
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tipo de venta */}
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            { v: "CREDITO", label: "Fiado" },
            { v: "CONTADO", label: "De contado" },
          ] as const
        ).map((op) => (
          <button
            key={op.v}
            type="button"
            onClick={() => setTipo(op.v)}
            className={`border py-3 font-sans text-[12px] uppercase tracking-[0.15em] transition-colors ${
              tipo === op.v
                ? "border-cacao bg-warm-black text-on-dark"
                : "border-blush bg-bg-card text-cacao"
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>

      {/* Persona */}
      <section>
        <label className="mb-2 block font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
          ¿A quién?
        </label>
        {clienteSel ? (
          <div className="flex items-center justify-between border border-gold bg-bg-card px-3 py-3">
            <span className="font-sans text-base text-cacao">{clienteSel.nombre}</span>
            <button
              type="button"
              onClick={() => {
                setClienteSel(null);
                setClienteTexto("");
              }}
              aria-label="Cambiar persona"
              className="text-warm-gray"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={clienteTexto}
              onChange={(e) => setClienteTexto(e.target.value)}
              placeholder="Nombre (ej: Empleada de Luis)"
              className="w-full border border-blush bg-bg-card px-3 py-3 font-sans text-base text-cacao outline-none focus:border-gold"
            />
            {sugerenciasCliente.length > 0 && (
              <ul className="mt-1 divide-y divide-blush border border-blush bg-bg-card">
                {sugerenciasCliente.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setClienteSel(c)}
                      className="flex w-full items-center justify-between px-3 py-3 text-left active:bg-beige"
                    >
                      <span className="font-sans text-sm text-cacao">{c.nombre}</span>
                      {c.saldo > 0 && (
                        <span className="font-sans text-xs text-gold-dark">
                          debe {formatMoney(c.saldo)}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {clienteTexto.trim().length >= 2 && (
              <p className="mt-1.5 font-sans text-[11px] text-warm-gray">
                Si no está en la lista, se crea como persona nueva.
              </p>
            )}
          </>
        )}
      </section>

      {/* Productos */}
      <section>
        <label className="mb-2 block font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
          ¿Qué se llevó?
        </label>

        {items.length > 0 && (
          <ul className="mb-3 divide-y divide-blush border border-blush bg-bg-card">
            {items.map((item, idx) => (
              <li key={item.key} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-sm text-cacao">{item.descripcion}</p>
                    {item.presentacion && (
                      <p className="font-sans text-[11px] text-warm-gray">{item.presentacion}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label={`Quitar ${item.descripcion}`}
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-warm-gray"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="mt-2 flex items-end gap-3">
                  <span className="flex items-center border border-blush">
                    <button
                      type="button"
                      aria-label="Menos"
                      onClick={() =>
                        setItems((prev) =>
                          prev.map((it, i) =>
                            i === idx ? { ...it, cantidad: Math.max(1, it.cantidad - 1) } : it
                          )
                        )
                      }
                      className="flex h-11 w-10 items-center justify-center text-cacao"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center font-sans text-sm text-cacao">
                      {item.cantidad}
                    </span>
                    <button
                      type="button"
                      aria-label="Más"
                      onClick={() =>
                        setItems((prev) =>
                          prev.map((it, i) =>
                            i === idx ? { ...it, cantidad: it.cantidad + 1 } : it
                          )
                        )
                      }
                      className="flex h-11 w-10 items-center justify-center text-cacao"
                    >
                      <Plus size={13} />
                    </button>
                  </span>
                  <div className="flex-1">
                    <InputMonto
                      valor={item.precioTexto}
                      ariaLabel={`Precio de ${item.descripcion}`}
                      onChange={(v) =>
                        setItems((prev) =>
                          prev.map((it, i) => (i === idx ? { ...it, precioTexto: v } : it))
                        )
                      }
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-[1.15rem] -translate-y-1/2 text-warm-gray"
          />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar en el catálogo…"
            className="w-full border border-blush bg-bg-card py-3 pl-9 pr-3 font-sans text-base text-cacao outline-none focus:border-gold"
          />
        </div>
        {busqueda.trim().length >= 2 && (
          <ul className="mt-1 max-h-72 divide-y divide-blush overflow-y-auto border border-blush bg-bg-card">
            {buscando && resultados.length === 0 && (
              <li className="px-3 py-3 font-sans text-sm text-warm-gray">Buscando…</li>
            )}
            {!buscando && resultados.length === 0 && (
              <li className="px-3 py-3 font-sans text-sm text-warm-gray">
                Sin resultados en el catálogo.
              </li>
            )}
            {resultados.map((p) => (
              <li key={p.variantId}>
                <button
                  type="button"
                  onClick={() => agregarProducto(p)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left active:bg-beige"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-sans text-sm text-cacao">
                      {p.nombre}
                    </span>
                    <span className="font-sans text-[11px] text-warm-gray">
                      {p.presentacion}
                      {p.borrador && (
                        <span className="ml-1.5 text-gold-dark">· borrador</span>
                      )}
                    </span>
                  </span>
                  <span className="shrink-0 font-serif text-sm font-semibold text-gold-dark">
                    {formatMoney(p.precio)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Condiciones */}
      {tipo === "CREDITO" ? (
        <section>
          <label className="mb-2 block font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
            ¿Cuándo paga?
          </label>
          <div className="mb-2 flex gap-2">
            {[
              { label: "2 quincenas", d: fechaPagoSugerida(new Date(), 2) },
              { label: "3 quincenas", d: fechaPagoSugerida(new Date(), 3) },
              { label: "1 quincena", d: fechaPagoSugerida(new Date(), 1) },
            ].map((op) => {
              const valor = aInputDate(op.d);
              return (
                <button
                  key={op.label}
                  type="button"
                  onClick={() => setFechaPago(valor)}
                  className={`flex-1 border py-2.5 font-sans text-[11px] uppercase tracking-wider transition-colors ${
                    fechaPago === valor
                      ? "border-cacao bg-warm-black text-on-dark"
                      : "border-blush bg-bg-card text-cacao"
                  }`}
                >
                  {op.label}
                </button>
              );
            })}
          </div>
          <input
            type="date"
            value={fechaPago}
            onChange={(e) => setFechaPago(e.target.value)}
            className="w-full border border-blush bg-bg-card px-3 py-3 font-sans text-base text-cacao outline-none focus:border-gold"
          />
        </section>
      ) : (
        <section>
          <label className="mb-2 block font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
            ¿Cómo pagó?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {METODOS_PAGO.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetodoPago(m)}
                className={`border py-2.5 font-sans text-[11px] uppercase tracking-wider transition-colors ${
                  metodoPago === m
                    ? "border-cacao bg-warm-black text-on-dark"
                    : "border-blush bg-bg-card text-cacao"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <label className="mb-2 block font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
          Nota (opcional)
        </label>
        <input
          type="text"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Ej: se lo llevó Yuliana"
          className="w-full border border-blush bg-bg-card px-3 py-3 font-sans text-base text-cacao outline-none focus:border-gold"
        />
      </section>

      {error && (
        <p className="border border-red-300 bg-red-50 px-3 py-2 font-sans text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Total + guardar, fijos abajo */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-blush bg-cream px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex-1">
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
              Total
            </p>
            <p className="font-serif text-2xl font-semibold text-cacao">
              {formatMoney(total)}
            </p>
          </div>
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="flex items-center gap-2 bg-warm-black px-6 py-4 font-sans text-[12px] uppercase tracking-[0.2em] text-on-dark active:bg-gold-dark disabled:opacity-60"
          >
            <Check size={16} />
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
