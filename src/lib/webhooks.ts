import db from "@/lib/db";

/**
 * Construye el payload completo de una orden y lo envía directamente al webhook de n8n.
 * Se llama tras crear o cambiar el estado de una orden.
 */
export async function notifyOrderStatusChange(orderId: string) {
  const n8nUrl = process.env.N8N_WEBHOOK_URL;
  if (!n8nUrl) {
    console.warn("[webhooks] N8N_WEBHOOK_URL no configurado — se omite notificación");
    return;
  }

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            variant: { include: { product: true } },
          },
        },
      },
    });

    if (!order) {
      console.warn(`[webhooks] Orden ${orderId} no encontrada`);
      return;
    }

    const payload = {
      orderId: order.id,
      shortId: order.id.slice(0, 8).toUpperCase(),
      status: order.status,
      totalAmount: Number(order.totalAmount),
      paymentMethod: order.paymentMethod,
      trackingCode: order.trackingCode ?? null,
      trackingCarrier: order.trackingCarrier ?? null,
      customer: {
        name: order.customer.name,
        phone: order.customer.phone,
        address: order.customer.address ?? "",
        city: order.customer.city ?? "",
      },
      items: order.items.map((i) => ({
        name: i.variant.product.name,
        variant: i.variant.attributeValue,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      })),
    };

    await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[webhooks] notifyOrderStatusChange error:", err);
  }
}