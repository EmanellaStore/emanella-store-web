import db from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { CartItem } from "@/store/useCartStore";
import { notifyOrderStatusChange } from "@/lib/webhooks";

interface CheckoutData {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  paymentMethod: string;
}

interface CheckoutResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export async function createOrder(data: CheckoutData, cartItems: CartItem[], sessionId: string): Promise<CheckoutResult> {
  try {
    const customer = await db.customer.upsert({
      where: { phone: data.phone },
      update: {
        name: data.name,
        address: data.address,
        city: data.city,
        notes: data.notes || "",
      },
      create: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        notes: data.notes || "",
      },
    });

    const totalAmount = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId: customer.id,
          paymentMethod: data.paymentMethod,
          totalAmount,
          status: OrderStatus.PENDIENTE,
          notes: data.notes || "Sin notas adicionales",
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

      for (const item of cartItems) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    await notifyOrderStatusChange(order.id);

    if (sessionId) {
      await db.cart.updateMany({
        where: { sessionId: sessionId, status: { not: 'RECOVERED' } },
        data: { status: 'RECOVERED', recoveredAt: new Date(), orderId: order.id },
      });
    }
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Error creando pedido:", error);
    return { success: false, error: "No se pudo procesar el pedido." };
  }
}