// src/app/api/cartera/ventas/route.ts — registrar una venta (fiada o de contado).
import { NextRequest, NextResponse } from "next/server";
import { crearVenta, anularVenta, eliminarVenta } from "@/services/cartera.service";
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

    return NextResponse.json({ ok: true, venta });
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
    await anularVenta(ventaId);
    return NextResponse.json({ ok: true });
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
    await eliminarVenta(ventaId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo eliminar la venta";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
