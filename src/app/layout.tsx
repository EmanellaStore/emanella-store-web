//src/app/layaout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { WhatsAppButton } from "@/components/shop/WhatsAppButton";
import { ToastContainer } from "@/components/shop";
import CartSyncProvider from "@/components/shop/CartSyncProvider";
import WelcomeCaptureModal from "@/components/shop/WelcomeCaptureModel";

export const metadata: Metadata = {
  title: "Emanella Store | Perfumes & Accesorios",
  description: "Descubre nuestra colección exclusiva de perfumes, bolsos y accesorios.",
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
        <ToastContainer />
        <WhatsAppButton />
        <CartSyncProvider />
        <WelcomeCaptureModal />
      </body>
    </html>
  );
}