// src/app/cartera/historial/page.tsx — historial de perfumes vendidos.
// Trazabilidad: qué se vendió, qué día, a qué hora, por cuánto y a quién.
import { getHistorialVendidos } from "@/services/cartera.service";
import HistorialVendidos from "@/components/cartera/HistorialVendidos";

export const dynamic = "force-dynamic";

export default async function HistorialPage() {
  const vendidos = await getHistorialVendidos();

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl text-cacao">Historial de ventas</h1>
      <HistorialVendidos vendidos={vendidos} />
    </div>
  );
}
