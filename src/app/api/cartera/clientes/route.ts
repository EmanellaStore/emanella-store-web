// src/app/api/cartera/clientes/route.ts — buscar y crear personas de la cartera.
import { NextRequest, NextResponse } from "next/server";
import { getClientesConSaldo, crearCliente, eliminarCliente } from "@/services/cartera.service";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const clientes = await getClientesConSaldo({ q, incluirSaldados: true });
  return NextResponse.json({ clientes });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.nombre?.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }
    const cliente = await crearCliente(body);
    return NextResponse.json({ ok: true, cliente });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo crear la persona";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { clienteId } = await req.json();
    if (!clienteId) {
      return NextResponse.json({ error: "clienteId requerido" }, { status: 400 });
    }
    await eliminarCliente(clienteId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo eliminar la persona";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
