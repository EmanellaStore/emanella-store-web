import db from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { notifyOrderStatusChange } from "@/lib/webhooks";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string,
  extraData?: { trackingCode?: string; trackingCarrier?: string }
) {
  const current = await db.order.findUnique({ where: { id: orderId } });
  if (!current) throw new Error("Pedido no encontrado");

  // No hacer nada si es el mismo estado (evita mensajes duplicados)
  if (current.status === status && !extraData?.trackingCode) {
    return current;
  }

  // Primera vez que pasa a ENTREGADO → dispara métricas del cliente
  const isBecomingDelivered =
    status === OrderStatus.ENTREGADO && !current.deliveredAt;

  const [order] = await db.$transaction([
    db.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(isBecomingDelivered && { deliveredAt: new Date() }),
        ...(extraData?.trackingCode !== undefined && {
          trackingCode: extraData.trackingCode,
        }),
        ...(extraData?.trackingCarrier !== undefined && {
          trackingCarrier: extraData.trackingCarrier,
        }),
      },
    }),
    db.orderEvent.create({
      data: {
        orderId,
        status,
        note: note || `Estado actualizado a ${status}`,
      },
    }),
    // Solo incluimos el update del customer si corresponde
    ...(isBecomingDelivered
      ? [
          db.customer.update({
            where: { id: current.customerId },
            data: {
              lastPurchaseAt: new Date(),
              orderCount: { increment: 1 },
              totalSpent: { increment: current.totalAmount },
            },
          }),
        ]
      : []),
  ]);

  // Dispara el webhook a n8n SIEMPRE que cambie de estado
  await notifyOrderStatusChange(orderId);

  return order;
}

export async function getOrders() {
  return db.order.findMany({
    include: {
      customer: true,
      _count: { select: { items: true } },
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

  const newTotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

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
        note:
          adminNote ||
          `Items actualizados. Nuevo total: $${newTotal.toLocaleString("es-CO")}`,
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
        note:
          adminNote ||
          `Datos del cliente actualizados: ${customerData.name}, ${customerData.phone}`,
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