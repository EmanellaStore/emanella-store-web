// src/app/api/payments/wompi/route.ts
// POST { orderId } → { url } de Wompi Web Checkout para pagar una orden PENDIENTE.
// La firma de integridad se calcula aquí (server-side) con INTEGRIDAD_KEY.
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { buildWompiCheckoutUrl } from "@/lib/wompi";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { id: true, totalAmount: true, status: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }
    if (order.status !== "PENDIENTE") {
      return NextResponse.json(
        { error: `La orden ya está ${order.status}` },
        { status: 422 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const amountInCents = Math.round(Number(order.totalAmount) * 100);

    const url = buildWompiCheckoutUrl({
      reference: order.id,
      amountInCents,
      redirectUrl: `${appUrl}/gracias?orderId=${order.id}`,
    });

    return NextResponse.json({ url });
  } catch (e) {
    console.error("[wompi] error generando URL de pago:", e);
    return NextResponse.json({ error: "Error generando el pago" }, { status: 500 });
  }
}
