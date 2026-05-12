import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { OrderStatus } from '@prisma/client';
import { notifyOrderStatusChange } from "@/lib/webhooks";

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDIENTE: ['CONFIRMADO', 'CANCELADO'],
    CONFIRMADO: ['ENVIADO', 'CANCELADO'],
    ENVIADO: ['ENTREGADO', 'CANCELADO'],
    ENTREGADO: [],
    CANCELADO: [],
};

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const token = req.headers.get('x-n8n-token');
    if (token !== process.env.N8N_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; // ← await aquí
    const body = await req.json();
    const { status, note, trackingCode, trackingCarrier } = body;

    if (!status || !Object.values(OrderStatus).includes(status)) {
        return NextResponse.json({ error: `Status inválido` }, { status: 400 });
    }

    const order = await db.order.findUnique({
        where: { id },
        include: { customer: true },
    });

    if (!order) {
        return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed.includes(status)) {
        return NextResponse.json(
            { error: `Transición inválida: ${order.status} → ${status}` },
            { status: 422 }
        );
    }

    const updated = await db.$transaction(async (tx) => {
        const updateData: Record<string, unknown> = { status };
        if (trackingCode) updateData.trackingCode = trackingCode;
        if (trackingCarrier) updateData.trackingCarrier = trackingCarrier;
        if (status === 'ENTREGADO') updateData.deliveredAt = new Date();

        const updatedOrder = await tx.order.update({
            where: { id },
            data: updateData,
            include: {
                customer: true,
                items: { include: { variant: { include: { product: true } } } },
            },
        });

        await tx.orderEvent.create({
            data: {
                orderId: id,
                status,
                note: note ?? `Estado actualizado a ${status} vía n8n`,
            },
        });

        return updatedOrder;
    });

    // Disparar webhook lifecycle
    try {
        await notifyOrderStatusChange(order.id);

    } catch (e) {
        console.error('[order-status] webhook error:', e);
    }

    return NextResponse.json({ ok: true, order: updated });
}