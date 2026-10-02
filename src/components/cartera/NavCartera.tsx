"use client";
// src/components/cartera/NavCartera.tsx — pestañas de la barra de la cartera.
// La sección actual se marca en dorado.
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/cartera/historial", label: "Historial" },
  { href: "/inventario", label: "Inventario" },
];

export default function NavCartera() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-4">
      {LINKS.map((l) => {
        const activo = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={activo ? "page" : undefined}
            className={`font-sans text-[11px] uppercase tracking-[0.2em] active:text-gold ${
              activo ? "text-gold" : "text-on-dark/60"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
