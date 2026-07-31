// src/app/api/webhook/wompi/route.ts
// Receptor de eventos de Wompi (transaction.updated).
// Registrar en Wompi → Desarrolladores → Eventos: {APP_URL}/api/webhook/wompi
// Verifica el checksum con SECRET_EVENT; con pago APPROVED la orden pasa
// PENDIENTE → CONFIRMADO (con OrderEvent + notificación lifecycle a n8n).
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyWompiEventChecksum } from "@/lib/wompi";
import { notifyOrderStatusChange } from "@/lib/webhooks";

interface WompiTransaction {
  id: string;
  status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING";
  reference: string;
  amount_in_cents: number;
  payment_method_type?: string;
}

export async function POST(req: NextRequest) {
  let event: {
    event?: string;
    data: { transaction?: WompiTransaction } & Record<string, unknown>;
    timestamp: number;
    signature: { properties: string[]; checksum: string };
  };
  try {
    event = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!event?.signature?.checksum || !verifyWompiEventChecksum(event)) {
    console.warn("[wompi-webhook] checksum inválido");
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const tx = event.data?.transaction;
  if (!tx?.reference) {
    // Evento que no nos interesa: respondemos 200 para que Wompi no reintente.
    return NextResponse.json({ ok: true, ignored: true });
  }

  const order = await db.order.findUnique({ where: { id: tx.reference } });
  if (!order) {
    console.warn(`[wompi-webhook] orden no encontrada: ${tx.reference}`);
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Validación de monto: el pago debe cubrir el total de la orden.
  const expectedCents = Math.round(Number(order.totalAmount) * 100);
  if (tx.status === "APPROVED" && tx.amount_in_cents !== expectedCents) {
    console.error(
      `[wompi-webhook] monto no coincide (orden ${order.id}): esperado ${expectedCents}, recibido ${tx.amount_in_cents}`
    );
    await db.orderEvent.create({
      data: {
        orderId: order.id,
        status: order.status,
        note: `⚠️ Pago Wompi ${tx.id} APROBADO pero con monto distinto (${tx.amount_in_cents} vs ${expectedCents}). Revisar manualmente.`,
      },
    });
    return NextResponse.json({ ok: true, flagged: true });
  }

  if (tx.status === "APPROVED" && order.status === "PENDIENTE") {
    await db.$transaction(async (dbTx) => {
      await dbTx.order.update({
        where: { id: order.id },
        data: { status: "CONFIRMADO", paymentMethod: "wompi" },
      });
      await dbTx.orderEvent.create({
        data: {
          orderId: order.id,
          status: "CONFIRMADO",
          note: `Pago aprobado vía Wompi (${tx.payment_method_type ?? "online"}) — transacción ${tx.id}`,
        },
      });
    });
    try {
      await notifyOrderStatusChange(order.id);
    } catch (e) {
      console.error("[wompi-webhook] error notificando lifecycle:", e);
    }
  } else if (["DECLINED", "VOIDED", "ERROR"].includes(tx.status)) {
    await db.orderEvent.create({
      data: {
        orderId: order.id,
        status: order.status,
        note: `Pago Wompi ${tx.status.toLowerCase()} — transacción ${tx.id}. La orden sigue ${order.status}.`,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
