// src/app/api/admin/coupons/route.ts
// POST: crear cupón manual desde el panel. PATCH: activar/desactivar.
// Protegido por el proxy (sesión ADMIN o x-n8n-token).
// (La generación automática de campañas n8n vive en ./generate)
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido" }, { status: 400 });

  const type = body.type === "FIXED" ? "FIXED" : "PERCENT";
  const value = Number(body.value);
  if (!Number.isFinite(value) || value <= 0) {
    return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
  }
  if (type === "PERCENT" && value > 100) {
    return NextResponse.json({ error: "Un porcentaje no puede superar 100" }, { status: 400 });
  }

  const code = (typeof body.code === "string" && body.code.trim()
    ? body.code.trim().toUpperCase().replace(/\s+/g, "")
    : `EMA${crypto.randomBytes(3).toString("hex").toUpperCase()}`
  ).slice(0, 30);

  const exists = await db.coupon.findUnique({ where: { code } });
  if (exists) {
    return NextResponse.json({ error: `El código ${code} ya existe` }, { status: 409 });
  }

  const coupon = await db.coupon.create({
    data: {
      code,
      type,
      value,
      minAmount: body.minAmount ? Number(body.minAmount) : null,
      maxUses: body.maxUses ? Math.max(1, Math.floor(Number(body.maxUses))) : null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      campaign: "MANUAL",
    },
  });

  return NextResponse.json({ ok: true, coupon });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.id || typeof body.active !== "boolean") {
    return NextResponse.json({ error: "id y active requeridos" }, { status: 400 });
  }
  const coupon = await db.coupon.update({
    where: { id: body.id },
    data: { active: body.active },
    select: { id: true, active: true, code: true },
  });
  return NextResponse.json({ ok: true, coupon });
}
