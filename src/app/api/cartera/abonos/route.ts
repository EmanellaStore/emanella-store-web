// src/app/api/cartera/abonos/route.ts — registrar y deshacer abonos.
import { NextRequest, NextResponse } from "next/server";
import { crearAbono, eliminarAbono } from "@/services/cartera.service";
import { getSession } from "@/lib/session";
import { parseFechaLocal } from "@/lib/cartera";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();

    if (!body?.clienteId) {
      return NextResponse.json({ error: "Falta la persona" }, { status: 400 });
    }

    const abono = await crearAbono({
      clienteId: body.clienteId,
      monto: Number(body.monto),
      fecha: parseFechaLocal(body.fecha) ?? undefined,
      metodo: body.metodo,
      nota: body.nota,
      createdBy: session?.name ?? null,
    });

    return NextResponse.json({ ok: true, abono });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo registrar el abono";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { abonoId } = await req.json();
    if (!abonoId) {
      return NextResponse.json({ error: "abonoId requerido" }, { status: 400 });
    }
    await eliminarAbono(abonoId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo eliminar el abono";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
