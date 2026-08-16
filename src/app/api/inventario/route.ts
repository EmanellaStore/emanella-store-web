// src/app/api/inventario/route.ts — leer y actualizar el inventario (Excel).
// El acceso lo controla el proxy (ADMIN o CARTERA).
import { NextRequest, NextResponse } from "next/server";
import {
  getInventario,
  actualizarProducto,
  agregarProducto,
} from "@/services/inventario.service";
import { invalidarCacheInventario } from "@/services/cartera.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { items } = await getInventario();
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    return NextResponse.json({ ok: false, error: mensajeError(e) }, { status: 502 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const fila = Number(body?.fila);
    if (!Number.isInteger(fila) || fila < 2) {
      return NextResponse.json({ ok: false, error: "Fila inválida" }, { status: 400 });
    }
    await actualizarProducto(fila, {
      stockInicial: body.stockInicial,
      ventaDetal: body.ventaDetal,
      precioCompra: body.precioCompra,
      precioMayorista: body.precioMayorista,
      precioDetal: body.precioDetal,
      estado: body.estado,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: mensajeError(e) }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.nombre || !String(body.nombre).trim()) {
      return NextResponse.json({ ok: false, error: "El nombre es obligatorio" }, { status: 400 });
    }
    const fila = await agregarProducto({
      nombre: body.nombre,
      tipo: body.tipo,
      stockInicial: body.stockInicial,
      precioCompra: body.precioCompra,
      precioMayorista: body.precioMayorista,
      precioDetal: body.precioDetal,
      estado: body.estado,
    });
    invalidarCacheInventario(); // el nuevo producto aparece ya en el buscador de la cartera
    return NextResponse.json({ ok: true, fila });
  } catch (e) {
    return NextResponse.json({ ok: false, error: mensajeError(e) }, { status: 400 });
  }
}

function mensajeError(e: unknown): string {
  const msg = e instanceof Error ? e.message : "Error desconocido";
  if (msg.includes("SHEETS_NO_CONFIG")) {
    return "El inventario aún no está conectado a Google Sheets.";
  }
  if (msg.includes("SHEETS_AUTH_ERROR")) {
    return "No se pudo autenticar con Google. Revisa la credencial.";
  }
  if (msg.includes("SHEETS_API_ERROR")) {
    return "Google Sheets rechazó la operación. ¿El Excel está compartido con la cuenta?";
  }
  if (msg.includes("SHEETS_SIN_TABLA")) {
    return "No se encontró la tabla de inventario en el Excel.";
  }
  return msg;
}
