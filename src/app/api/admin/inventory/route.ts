// src/app/api/admin/inventory/route.ts
// PATCH { variantId, stock } (valor absoluto) o { variantId, delta } (ajuste ±).
// Protegido por el proxy (sesión ADMIN o x-n8n-token).
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const variantId = body?.variantId;
  if (!variantId || typeof variantId !== "string") {
    return NextResponse.json({ error: "variantId requerido" }, { status: 400 });
  }

  const variant = await db.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) {
    return NextResponse.json({ error: "Variante no encontrada" }, { status: 404 });
  }

  let newStock: number;
  if (typeof body.stock === "number") {
    newStock = Math.floor(body.stock);
  } else if (typeof body.delta === "number") {
    newStock = variant.stock + Math.floor(body.delta);
  } else {
    return NextResponse.json(
      { error: "Envía stock (absoluto) o delta (ajuste)" },
      { status: 400 }
    );
  }

  if (!Number.isFinite(newStock) || newStock < 0) newStock = 0;

  const updated = await db.productVariant.update({
    where: { id: variantId },
    data: { stock: newStock },
    select: { id: true, stock: true },
  });

  return NextResponse.json({ ok: true, variant: updated });
}
