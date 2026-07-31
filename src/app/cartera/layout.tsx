// src/app/cartera/layout.tsx — módulo de cartera: app aparte, pensada para celular.
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Image from "next/image";
import BotonSalir from "@/components/cartera/BotonSalir";

export const metadata: Metadata = {
  title: "Cartera Emanella",
  description: "Fiados y abonos",
  manifest: "/cartera.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Cartera",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/cartera-icon-192.png",
    apple: "/cartera-icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2A2330",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function CarteraLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="sticky top-0 z-40 bg-warm-black text-on-dark">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/cartera" className="flex items-center gap-2.5">
            <Image
              src="/cartera-icon-192.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="font-sans text-[11px] uppercase tracking-[0.2em]">
              Cartera
            </span>
          </Link>
          <BotonSalir />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-28 pt-4">{children}</main>
    </div>
  );
}
