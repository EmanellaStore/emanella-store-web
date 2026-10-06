// src/app/inventario/page.tsx — el inventario ahora vive dentro de la cartera
// (/cartera/inventario): misma barra, mismas pestañas y, sobre todo, dentro del
// alcance de la app instalada (scope "/cartera"). Desde /inventario, la app
// instalada lo abría como una pestaña aparte del navegador. Esta ruta queda solo
// para enlaces y accesos viejos.
import { redirect } from "next/navigation";

export default function InventarioViejo() {
  redirect("/cartera/inventario");
}
