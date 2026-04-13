"use server";
import db from "@/lib/db";
import { OrderStatus } from "@prisma/client";

export async function createOrder(formData: any, cartItems: any[]) {
    try {
        const { name, phone, address, city, notes, paymentMethod } = formData;

        // 1. Buscar o crear el cliente por teléfono
        const customer = await db.customer.upsert({
            where: { phone },
            update: { name, address, city, notes: notes || "" },
            create: { name, phone, address, city, notes: notes || "" },
        });

        // 2. Calcular total
        const totalAmount = cartItems.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        );

        // 3. Crear el pedido en una transacción
        const order = await db.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    customerId: customer.id,
                    paymentMethod,
                    totalAmount,
                    status: OrderStatus.PENDIENTE,
                    notes: notes || "Sin notas adicionales",
                    items: {
                        create: cartItems.map((item) => ({
                            variantId: item.variantId,
                            quantity: item.quantity,
                            unitPrice: item.price,
                        })),
                    },
                    events: {
                        create: {
                            status: OrderStatus.PENDIENTE,
                            note: "Pedido realizado por el cliente desde la web.",
                        },
                    },
                },
            });

            // 4. Opcional: Descontar stock (Lógica simple)
            for (const item of cartItems) {
                await tx.productVariant.update({
                    where: { id: item.variantId },
                    data: { stock: { decrement: item.quantity } },
                });
            }
            return newOrder;
        });

        // ── Disparar webhook a n8n (fire & forget) ──  
        const webhookUrl = process.env.N8N_WEBHOOK_URL;
        if (webhookUrl) {
            const payload = {
                orderId: order.id,
                customer: {
                    name,
                    phone,
                    city,
                    address,
                },
                paymentMethod,
                total: totalAmount,
                items: cartItems.map((item) => ({
                    name: item.name,
                    variant: `${item.attributeName}: ${item.attributeValue}`,
                    quantity: item.quantity,
                    price: item.price,
                })),
                createdAt: new Date().toISOString(),
            };

            // No bloqueamos el response con await  
            fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }).catch((err) => console.error("n8n webhook error:", err));
        }

        return { success: true, orderId: order.id };
    } catch (error) {
        console.error("Error creando pedido:", error);
        return { success: false, error: "No se pudo procesar el pedido." };
    }
}