// src/components/shop/PerfumeSpecs.tsx — ficha técnica en chips:
// Concentración · Familia · Duración · "Inspirado en" (solo 1.1).
// Cada chip aparece solo si tiene dato.

interface PerfumeSpecsProps {
  concentracion?: string | null;
  familia?: string | null;
  duracion?: string | null;
  inspiradoEn?: string | null;
}

export default function PerfumeSpecs({
  concentracion,
  familia,
  duracion,
  inspiradoEn,
}: PerfumeSpecsProps) {
  const chips = [concentracion, familia, duracion].filter(
    (c): c is string => Boolean(c && c.trim() !== "")
  );
  const hasInspired = Boolean(inspiradoEn && inspiradoEn.trim() !== "");

  if (chips.length === 0 && !hasInspired) return null;

  return (
    <ul className="mt-5 flex flex-wrap gap-2 p-0">
      {chips.map((chip) => (
        <li
          key={chip}
          className="border border-blush bg-bg-card px-3 py-1.5 font-sans text-[11px] uppercase tracking-[0.06em] text-cacao"
        >
          {chip}
        </li>
      ))}
      {hasInspired && (
        <li className="border border-gold px-3 py-1.5 font-sans text-[12px] italic text-gold-dark">
          Inspirado en {inspiradoEn}
        </li>
      )}
    </ul>
  );
}
