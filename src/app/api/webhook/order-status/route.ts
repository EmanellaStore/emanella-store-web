import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * Este endpoint NO se llama desde el frontend ni desde n8n.
 * Se llama desde el BACKEND cuando cambia el status de un pedido.
 * n8n DEBE exponer un Webhook que apunte a este endpoint — al revés:
 * el backend dispara n8n.
 */

const N8N_WEBHOOK_URL = process.env.N8N_ORDER_STATUS_WEBHOOK!;

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-internal-token');
  if (token !== process.env.INTERNAL_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orderId } = await req.json();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
    },
  });

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // Enviar payload a n8n
  const payload = {
    orderId: order.id,
    shortId: order.id.slice(0, 8).toUpperCase(),
    status: order.status,
    totalAmount: Number(order.totalAmount),
    paymentMethod: order.paymentMethod,
    trackingCode: order.trackingCode,
    trackingCarrier: order.trackingCarrier,
    customer: {
      name: order.customer.name,
      phone: order.customer.phone,
      address: order.customer.address,
      city: order.customer.city,
    },
    items: order.items.map(i => ({
      name: i.variant.product.name,
      variant: i.variant.attributeValue,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
    })),
    trackingUrl: `${process.env.STORE_URL}/track/${order.id}`,
  };

  try {
    await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Failed to notify n8n:', err);
    // No fallamos la operación principal si n8n no responde
  }

  return NextResponse.json({ ok: true });
}