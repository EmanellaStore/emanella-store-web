import db from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { CartItem } from "@/store/useCartStore";

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

export async function createOrder(data: CheckoutData, cartItems: CartItem[]): Promise<CheckoutResult> {
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

    await triggerOrderWebhook(order.id, {
      name: data.name,
      phone: data.phone,
      city: data.city,
      address: data.address,
      paymentMethod: data.paymentMethod,
      total: totalAmount,
      items: cartItems,
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Error creando pedido:", error);
    return { success: false, error: "No se pudo procesar el pedido." };
  }
}

async function triggerOrderWebhook(orderId: string, data: {
  name: string;
  phone: string;
  city: string;
  address: string;
  paymentMethod: string;
  total: number;
  items: CartItem[];
}) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) return;

  const payload = {
    orderId,
    customer: {
      name: data.name,
      phone: data.phone,
      city: data.city,
      address: data.address,
    },
    paymentMethod: data.paymentMethod,
    total: data.total,
    items: data.items.map((item) => ({
      name: item.name,
      variant: `${item.attributeName}: ${item.attributeValue}`,
      quantity: item.quantity,
      price: item.price,
    })),
    createdAt: new Date().toISOString(),
  };

  fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch((err) => console.error("n8n webhook error:", err));
}
