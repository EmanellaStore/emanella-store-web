import type { Metadata } from "next";
import "./globals.css";
import TiendaOverlays from "@/components/shop/TiendaOverlays";

export const metadata: Metadata = {
  title: "Emanella Store | Perfumes & Accesorios",
  description:
    "Perfumería original y alternativas 1.1 de alta fidelidad, elegidas una a una.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
        {/* Carrito, toasts, WhatsApp y Pixel: solo en la tienda */}
        <TiendaOverlays />
      </body>
    </html>
  );
}
