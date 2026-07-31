"use client";
// src/components/cartera/AccionesCliente.tsx — abonar, recordar por WhatsApp
// y compartir el estado de cuenta.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageCircle, Copy, Check, X } from "lucide-react";
import InputMonto from "./InputMonto";
import { parseMonto, formatMoney, METODOS_PAGO } from "@/lib/cartera";

interface Props {
  clienteId: string;
  nombre: string;
  telefono: string | null;
  saldo: number;
  estadoCuenta: string;
}

export default function AccionesCliente({
  clienteId,
  nombre,
  telefono,
  saldo,
  estadoCuenta,
}: Props) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState<string>("Efectivo");
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [copiado, setCopiado] = useState(false);

  const montoNum = parseMonto(monto);

  const guardarAbono = async () => {
    setError("");
    if (montoNum <= 0) {
      setError("Escribe cuánto abonó");
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch("/api/cartera/abonos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId, monto: montoNum, metodo, nota }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No se pudo guardar");
        return;
      }
      setMonto("");
      setNota("");
      setAbierto(false);
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setGuardando(false);
    }
  };

  const copiarEstado = async () => {
    try {
      await navigator.clipboard.writeText(estadoCuenta);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setError("No se pudo copiar");
    }
  };

  const telLimpio = telefono?.replace(/\D/g, "") ?? "";
  const waHref = telLimpio
    ? `https://wa.me/${telLimpio.startsWith("57") ? telLimpio : `57${telLimpio}`}?text=${encodeURIComponent(estadoCuenta)}`
    : null;

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="flex flex-col items-center gap-1 border border-blush bg-bg-card py-3 active:bg-beige"
        >
          <Plus size={18} className="text-gold-dark" />
          <span className="font-sans text-[10px] uppercase tracking-wider text-cacao">
            Abono
          </span>
        </button>

        {waHref ? (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 border border-blush bg-bg-card py-3 active:bg-beige"
          >
            <MessageCircle size={18} className="text-green-700" />
            <span className="font-sans text-[10px] uppercase tracking-wider text-cacao">
              WhatsApp
            </span>
          </a>
        ) : (
          <span
            title="Agrega el teléfono para poder escribirle"
            className="flex flex-col items-center gap-1 border border-blush bg-bg-card py-3 opacity-40"
          >
            <MessageCircle size={18} />
            <span className="font-sans text-[10px] uppercase tracking-wider text-cacao">
              WhatsApp
            </span>
          </span>
        )}

        <button
          type="button"
          onClick={copiarEstado}
          className="flex flex-col items-center gap-1 border border-blush bg-bg-card py-3 active:bg-beige"
        >
          {copiado ? (
            <Check size={18} className="text-green-700" />
          ) : (
            <Copy size={18} className="text-gold-dark" />
          )}
          <span className="font-sans text-[10px] uppercase tracking-wider text-cacao">
            {copiado ? "Copiado" : "Copiar"}
          </span>
        </button>
      </div>

      {/* Hoja de abono */}
      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setAbierto(false)}
            className="absolute inset-0 bg-warm-black/50"
          />
          <div className="relative w-full bg-cream p-5 pb-8 sm:max-w-sm sm:border sm:border-blush sm:pb-5 sm:shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-xl text-cacao">Abono de {nombre}</h2>
              <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar">
                <X size={20} className="text-warm-gray" />
              </button>
            </div>

            <p className="mb-3 font-sans text-sm text-warm-gray">
              Debe {formatMoney(saldo)}
            </p>

            <label className="mb-1.5 block font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
              ¿Cuánto abonó?
            </label>
            <InputMonto valor={monto} onChange={setMonto} autoFocus ariaLabel="Monto del abono" />

            {saldo > 0 && (
              <button
                type="button"
                onClick={() => setMonto(String(saldo))}
                className="mt-2 font-sans text-[11px] uppercase tracking-wider text-gold-dark"
              >
                Pagó todo ({formatMoney(saldo)})
              </button>
            )}

            <label className="mb-1.5 mt-4 block font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
              ¿Cómo pagó?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {METODOS_PAGO.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetodo(m)}
                  className={`border py-2.5 font-sans text-[11px] uppercase tracking-wider ${
                    metodo === m
                      ? "border-cacao bg-warm-black text-on-dark"
                      : "border-blush bg-bg-card text-cacao"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Nota (opcional)"
              className="mt-3 w-full border border-blush bg-bg-card px-3 py-3 font-sans text-base text-cacao outline-none focus:border-gold"
            />

            {error && (
              <p className="mt-3 border border-red-300 bg-red-50 px-3 py-2 font-sans text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={guardarAbono}
              disabled={guardando}
              className="mt-4 w-full bg-warm-black py-4 font-sans text-[12px] uppercase tracking-[0.2em] text-on-dark active:bg-gold-dark disabled:opacity-60"
            >
              {guardando ? "Guardando…" : "Registrar abono"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
