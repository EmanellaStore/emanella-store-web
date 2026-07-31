// src/app/api/cartera/productos/route.ts — buscador del catálogo para armar ventas.
import { NextRequest, NextResponse } from "next/server";
import { buscarProductosCatalogo } from "@/services/cartera.service";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const resultados = await buscarProductosCatalogo(q);
  return NextResponse.json({ resultados });
}
