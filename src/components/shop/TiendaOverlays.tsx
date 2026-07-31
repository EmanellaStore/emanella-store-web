"use client";
// src/components/shop/TiendaOverlays.tsx
// Agrupa lo que solo pertenece a la tienda: carrito, toasts, botón de WhatsApp,
// captura de bienvenida y el Pixel de Meta. Las herramientas internas
// (/admin y /cartera) no deben mostrarlos ni ensuciar las métricas con
// navegación del equipo.
import { usePathname } from "next/navigation";
import { WhatsAppButton } from "@/components/shop/WhatsAppButton";
import { ToastContainer, AnalyticsScripts, AnalyticsRouteObserver } from "@/components/shop";
import CartSyncProvider from "@/components/shop/CartSyncProvider";
import CartDrawer from "@/components/shop/CartDrawer";
import WelcomeCaptureModal from "@/components/shop/WelcomeCaptureModel";

const RUTAS_INTERNAS = ["/admin", "/cartera", "/login", "/reset-password"];

export default function TiendaOverlays() {
  const pathname = usePathname() ?? "";
  const esInterna = RUTAS_INTERNAS.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );

  if (esInterna) return null;

  return (
    <>
      <AnalyticsScripts />
      <AnalyticsRouteObserver />
      <CartDrawer />
      <ToastContainer />
      <WhatsAppButton />
      <CartSyncProvider />
      <WelcomeCaptureModal />
    </>
  );
}
