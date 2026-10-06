"use client";
// src/components/cartera/NavCartera.tsx — pestañas de la barra de la cartera.
// La sección actual se marca en dorado.
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/cartera/historial", label: "Historial" },
  { href: "/cartera/inventario", label: "Inventario" },
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

/**
 * Marca "Cartera" (logo + nombre) a la izquierda de la barra. También es la
 * pestaña de la cartera: se marca en dorado en la lista, la ficha de cada
 * persona y la nueva venta (todo lo que no es Historial ni Inventario).
 */
export function MarcaCartera() {
  const pathname = usePathname();
  const activo = !LINKS.some(
    (l) => pathname === l.href || pathname.startsWith(`${l.href}/`)
  );
  return (
    <Link
      href="/cartera"
      aria-current={activo && pathname === "/cartera" ? "page" : undefined}
      className="flex items-center gap-2.5"
    >
      <Image
        src="/cartera-icon-192.png"
        alt=""
        width={28}
        height={28}
        className="h-7 w-7"
      />
      <span
        className={`font-sans text-[11px] uppercase tracking-[0.2em] ${
          activo ? "text-gold" : "text-on-dark"
        }`}
      >
        Cartera
      </span>
    </Link>
  );
}
