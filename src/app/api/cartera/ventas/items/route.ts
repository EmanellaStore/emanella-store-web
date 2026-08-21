// src/app/api/cartera/ventas/items/route.ts — quitar un producto de una venta.
// Caso real: se vendieron dos perfumes y el cliente devolvió uno. Se retira solo
// esa línea, se recalcula el total de la venta y las unidades vuelven al Excel.
import { NextRequest, NextResponse } from "next/server";
import {
  quitarItemDeVenta,
  invalidarCacheInventario,
} from "@/services/cartera.service";
import { devolverAlInventario } from "@/services/inventario.service";

export async function DELETE(req: NextRequest) {
  try {
    const { itemId } = await req.json();
    if (!itemId) {
      return NextResponse.json({ error: "itemId requerido" }, { status: 400 });
    }

    const { devolver, ventaEliminada } = await quitarItemDeVenta(itemId);

    // Best-effort, igual que el descuento: si el Excel no responde, la cartera
    // ya quedó corregida y el error solo se loguea.
    let inventario = null;
    if (devolver.length > 0) {
      try {
        inventario = await devolverAlInventario(devolver);
        invalidarCacheInventario();
      } catch (e) {
        console.error("No se pudo reponer el inventario:", e);
      }
    }

    return NextResponse.json({ ok: true, ventaEliminada, inventario });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo quitar el producto";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
