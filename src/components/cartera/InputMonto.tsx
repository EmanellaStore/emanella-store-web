"use client";
// src/components/cartera/InputMonto.tsx — campo de dinero con atajo de miles:
// escribir "150" vale $150.000. Muestra el valor real debajo para confirmarlo.
import { parseMonto, formatMoney } from "@/lib/cartera";

interface InputMontoProps {
  valor: string;
  onChange: (texto: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  ariaLabel?: string;
}

export default function InputMonto({
  valor,
  onChange,
  placeholder = "150",
  autoFocus,
  className = "",
  ariaLabel = "Valor",
}: InputMontoProps) {
  const monto = parseMonto(valor);

  return (
    <div>
      <input
        type="text"
        inputMode="numeric"
        value={valor}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ""))}
        placeholder={placeholder}
        className={`w-full border border-blush bg-cream px-3 py-3 text-right font-sans text-base text-cacao outline-none focus:border-gold ${className}`}
      />
      {monto > 0 && (
        <p className="mt-1 text-right font-sans text-[11px] text-gold-dark">
          = {formatMoney(monto)}
        </p>
      )}
    </div>
  );
}
