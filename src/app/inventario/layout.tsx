// src/app/inventario/layout.tsx — módulo de inventario: app aparte, para celular.
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Image from "next/image";
import BotonSalir from "@/components/cartera/BotonSalir";

export const metadata: Metadata = {
  title: "Inventario Emanella",
  description: "Stock y precios",
  manifest: "/inventario.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Inventario",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/inventario-icon-192.png",
    apple: "/inventario-icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2A2330",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function InventarioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="sticky top-0 z-40 bg-warm-black text-on-dark">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/inventario" className="flex items-center gap-2.5">
            <Image
              src="/inventario-icon-192.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="font-sans text-[11px] uppercase tracking-[0.2em]">
              Inventario
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/cartera"
              className="font-sans text-[11px] uppercase tracking-[0.2em] text-on-dark/60 active:text-gold"
            >
              Cartera
            </Link>
            <BotonSalir />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-4">{children}</main>
    </div>
  );
}
