// src/app/api/coupons/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal, customerId } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "Código requerido" },
        { status: 400 }
      );
    }

    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.active) {
      return NextResponse.json({ valid: false, error: "Cupón no válido" });
    }

    // Expiración
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "Cupón expirado" });
    }

    // Usos máximos
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "Cupón agotado" });
    }

    // Personal: si el cupón es de un cliente específico
    if (coupon.customerId && coupon.customerId !== customerId) {
      return NextResponse.json({
        valid: false,
        error: "Cupón no válido para este cliente",
      });
    }

    // Monto mínimo
    const sub = Number(subtotal || 0);
    if (coupon.minAmount && sub < Number(coupon.minAmount)) {
      return NextResponse.json({
        valid: false,
        error: `Compra mínima $${Number(coupon.minAmount).toLocaleString("es-CO")}`,
      });
    }

    // Calcula descuento
    let discount = 0;
    if (coupon.type === "PERCENT") {
      discount = Math.round(sub * (Number(coupon.value) / 100));
    } else if (coupon.type === "FIXED") {
      discount = Math.min(Number(coupon.value), sub);
    }
    // FREE_SHIPPING → discount = 0, el front maneja shipping=0

    return NextResponse.json({
      valid: true,
      discount,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
      },
    });
  } catch (err) {
    console.error("[coupons/validate] error:", err);
    return NextResponse.json(
      { valid: false, error: "Error validando cupón" },
      { status: 500 }
    );
  }
}