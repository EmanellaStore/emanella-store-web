// src/components/shop/PerfumePyramid.tsx — firma de marca: pirámide olfativa
// (salida · corazón · fondo) anclada a la hairline champán. No renderiza sin notas.

interface PerfumePyramidProps {
  notasSalida?: string | null;
  notasCorazon?: string | null;
  notasFondo?: string | null;
}

export default function PerfumePyramid({
  notasSalida,
  notasCorazon,
  notasFondo,
}: PerfumePyramidProps) {
  const levels = [
    { label: "Salida", notes: notasSalida },
    { label: "Corazón", notes: notasCorazon },
    { label: "Fondo", notes: notasFondo },
  ].filter((l) => l.notes && l.notes.trim() !== "");

  if (levels.length === 0) return null;

  return (
    <div className="mt-9 border-l border-gold pl-6">
      <p className="mb-4 font-sans text-[11px] uppercase tracking-[0.2em] text-gold-dark">
        Pirámide olfativa
      </p>
      <ul>
        {levels.map((level, i) => (
          <li
            key={level.label}
            className={`grid grid-cols-1 items-baseline gap-1 py-3 sm:grid-cols-[7.5rem_1fr] sm:gap-3 ${
              i < levels.length - 1 ? "border-b border-blush" : ""
            }`}
          >
            <span className="font-serif text-lg italic text-warm-black">{level.label}</span>
            <span className="font-sans text-sm font-light leading-relaxed text-cacao">
              {level.notes}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
