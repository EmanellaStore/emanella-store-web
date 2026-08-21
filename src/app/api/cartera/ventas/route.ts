// src/app/api/cartera/ventas/route.ts — registrar una venta (fiada o de contado).
import { NextRequest, NextResponse } from "next/server";
import {
  crearVenta,
  anularVenta,
  eliminarVenta,
  invalidarCacheInventario,
} from "@/services/cartera.service";
import {
  descontarPorVenta,
  devolverAlInventario,
} from "@/services/inventario.service";
import { getSession } from "@/lib/session";
import { parseFechaLocal } from "@/lib/cartera";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();

    const venta = await crearVenta({
      clienteId: body.clienteId || undefined,
      clienteNombre: body.clienteNombre,
      clienteTelefono: body.clienteTelefono,
      tipo: body.tipo === "CONTADO" ? "CONTADO" : "CREDITO",
      fecha: parseFechaLocal(body.fecha) ?? undefined,
      fechaPago: parseFechaLocal(body.fechaPago),
      notas: body.notas,
      metodoPago: body.metodoPago,
      items: Array.isArray(body.items) ? body.items : [],
      createdBy: session?.name ?? null,
    });

    // Descuenta las unidades vendidas del Excel (Venta Detal). Best-effort: si el
    // Excel no responde, la venta igual queda registrada.
    let inventario: {
      descontados: number;
      sinCoincidencia: string[];
      agotados: number[];
    } | null = null;
    try {
      inventario = await descontarPorVenta(
        venta.items.map((i) => ({ descripcion: i.descripcion, cantidad: i.cantidad }))
      );
      invalidarCacheInventario();
    } catch (e) {
      console.error("No se pudo descontar del inventario:", e);
    }

    return NextResponse.json({ ok: true, venta, inventario });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo registrar la venta";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { ventaId } = await req.json();
    if (!ventaId) {
      return NextResponse.json({ error: "ventaId requerido" }, { status: 400 });
    }
    const { devolver } = await anularVenta(ventaId);
    const inventario = await reponer(devolver);
    return NextResponse.json({ ok: true, inventario });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo anular la venta";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { ventaId } = await req.json();
    if (!ventaId) {
      return NextResponse.json({ error: "ventaId requerido" }, { status: 400 });
    }
    const { devolver } = await eliminarVenta(ventaId);
    const inventario = await reponer(devolver);
    return NextResponse.json({ ok: true, inventario });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo eliminar la venta";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

/**
 * Repone en el Excel las unidades de una venta que se deshizo. Best-effort,
 * igual que el descuento: si el Apps Script no responde, la venta ya quedó
 * anulada/eliminada en la cartera y el error solo se loguea.
 */
async function reponer(devolver: { descripcion: string; cantidad: number }[]) {
  if (devolver.length === 0) return null;
  try {
    const inventario = await devolverAlInventario(devolver);
    invalidarCacheInventario();
    return inventario;
  } catch (e) {
    console.error("No se pudo reponer el inventario:", e);
    return null;
  }
}
