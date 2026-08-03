// src/app/inventario/page.tsx — inventario en vivo desde el Excel.
import { AlertTriangle, PlugZap } from "lucide-react";
import { getInventario, sheetsConfigurado } from "@/services/inventario.service";
import InventarioLista from "@/components/inventario/InventarioLista";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  if (!sheetsConfigurado()) {
    return <NoConectado />;
  }

  try {
    const { items } = await getInventario();
    return <InventarioLista itemsIniciales={items} />;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return <ErrorCarga detalle={msg} />;
  }
}

function NoConectado() {
  return (
    <div className="border border-blush bg-bg-card px-5 py-10 text-center">
      <PlugZap size={28} className="mx-auto text-gold-dark" />
      <h1 className="mt-3 font-serif text-xl text-cacao">Falta conectar el Excel</h1>
      <p className="mx-auto mt-2 max-w-sm font-sans text-sm font-light text-cacao-light">
        El inventario está listo, pero aún no tiene las credenciales de Google
        Sheets. Cuando estén configuradas en Vercel, aquí verás todos los
        productos con su stock y precios.
      </p>
    </div>
  );
}

function ErrorCarga({ detalle }: { detalle: string }) {
  const amable = detalle.includes("SHEETS_API_ERROR")
    ? "Google Sheets rechazó la lectura. ¿El Excel está compartido con la cuenta de servicio como editor?"
    : detalle.includes("SHEETS_AUTH_ERROR")
      ? "No se pudo autenticar con Google. Revisa la credencial en Vercel."
      : detalle.includes("SHEETS_SIN_TABLA")
        ? "No se encontró la tabla de inventario en el Excel."
        : "No se pudo leer el Excel en este momento.";
  return (
    <div className="border border-red-300 bg-red-50 px-5 py-10 text-center">
      <AlertTriangle size={28} className="mx-auto text-red-500" />
      <h1 className="mt-3 font-serif text-xl text-cacao">No se pudo cargar</h1>
      <p className="mx-auto mt-2 max-w-sm font-sans text-sm text-red-700">{amable}</p>
    </div>
  );
}
