"use server";

import db from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    await db.order.update({
        where: { id: orderId },
        data: { status },
    });

    await db.orderEvent.create({
        data: {
            orderId,
            status,
            note: `Estado actualizado a ${status} desde el panel admin.`,
        },
    });

    revalidatePath("/admin/orders");
}

export async function notifyShipping(orderId: string) {
    const order = await db.order.findUnique({
        where: { id: orderId },
        include: { customer: true },
    });

    if (!order) throw new Error("Pedido no encontrado");

    // Cambiar estado a ENVIADO
    await updateOrderStatus(orderId, OrderStatus.ENVIADO);

    // Disparar webhook a n8n para notificar al cliente
    const webhookUrl = process.env.N8N_SHIPPING_WEBHOOK_URL;
    if (webhookUrl) {
        fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                orderId: order.id,
                customer: {
                    name: order.customer.name,
                    phone: order.customer.phone,
                    address: order.customer.address,
                    city: order.customer.city,
                },
                total: order.totalAmount,
                paymentMethod: order.paymentMethod,
            }),
        }).catch((err) => console.error("n8n shipping webhook error:", err));
    }

    revalidatePath("/admin/orders");
}