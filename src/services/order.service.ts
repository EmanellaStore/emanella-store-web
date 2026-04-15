import db from "@/lib/db";
import { OrderStatus } from "@prisma/client";

export async function updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
  const [order] = await db.$transaction([
    db.order.update({
      where: { id: orderId },
      data: { status },
    }),
    db.orderEvent.create({
      data: {
        orderId,
        status,
        note: note || `Estado actualizado a ${status} desde el panel admin.`,
      },
    }),
  ]);

  return order;
}

export async function notifyShipping(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { customer: true },
  });

  if (!order) throw new Error("Pedido no encontrado");

  await updateOrderStatus(orderId, OrderStatus.ENVIADO);

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
}

export async function getOrders() {
  return db.order.findMany({
    include: { 
      customer: true,
      _count: { select: { items: true } }
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(orderId: string) {
  return db.order.findUnique({
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
      events: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export interface OrderItemInput {
  variantId: string;
  quantity: number;
  unitPrice: number;
}

export async function updateOrderItems(
  orderId: string,
  items: OrderItemInput[],
  adminNote?: string
) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) throw new Error("Pedido no encontrado");

  const newTotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const updatedOrder = await db.$transaction(async (tx) => {
    await tx.orderItem.deleteMany({ where: { orderId } });

    await tx.orderItem.createMany({
      data: items.map((item) => ({
        orderId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { totalAmount: newTotal },
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

    await tx.orderEvent.create({
      data: {
        orderId,
        status: order.status,
        note: adminNote || `Items actualizados. Nuevo total: $${newTotal.toLocaleString("es-CO")}`,
      },
    });

    return updated;
  });

  return updatedOrder;
}

export async function updateOrderCustomer(
  orderId: string,
  customerData: {
    name: string;
    phone: string;
    address?: string;
    city?: string;
    notes?: string;
  },
  adminNote?: string
) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { customer: true },
  });

  if (!order) throw new Error("Pedido no encontrado");

  return db.$transaction(async (tx) => {
    await tx.customer.update({
      where: { id: order.customerId },
      data: {
        name: customerData.name,
        phone: customerData.phone,
        address: customerData.address || order.customer.address,
        city: customerData.city || order.customer.city,
        notes: customerData.notes,
      },
    });

    await tx.orderEvent.create({
      data: {
        orderId,
        status: order.status,
        note: adminNote || `Datos del cliente actualizados: ${customerData.name}, ${customerData.phone}`,
      },
    });

    return tx.order.findUnique({
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
        events: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  });
}
