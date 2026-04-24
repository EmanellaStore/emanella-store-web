//src/services/checkout.service.ts
import { OrderStatus, Prisma } from "@prisma/client";
import { CartItem } from "@/store/useCartStore";
import { notifyOrderStatusChange } from "@/lib/webhooks";
import db from "@/lib/db";

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

const SHIPPING_COST = 15000;
const FREE_SHIPPING_THRESHOLD = 200000;

export async function createOrder(
  data: CheckoutData,
  cartItems: CartItem[],
  sessionId: string,
  couponCode?: string
): Promise<CheckoutResult> {
  console.log("[service] arguments.length:", arguments.length);  
  console.log("[service] couponCode param:", couponCode);
  try {
    // 1) Upsert del cliente
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

    // 2) Subtotal
    const subtotal = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // 3) Validar cupón (server-side, no confiar en el front)
    let discount = 0;
    let freeShipping = false;
    let validCoupon: Awaited<ReturnType<typeof db.coupon.findUnique>> = null;

    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      const isValid =
        coupon &&
        coupon.active &&
        (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
        (coupon.maxUses === null || coupon.usedCount < coupon.maxUses) &&
        (!coupon.customerId || coupon.customerId === customer.id) &&
        (!coupon.minAmount || subtotal >= Number(coupon.minAmount));

      if (isValid && coupon) {
        validCoupon = coupon;
        if (coupon.type === "PERCENT") {
          discount = Math.round(subtotal * (Number(coupon.value) / 100));
        } else if (coupon.type === "FIXED") {
          discount = Math.min(Number(coupon.value), subtotal);
        } else if (coupon.type === "FREE_SHIPPING") {
          freeShipping = true;
        }
      }
    }

    // 4) Shipping
    const shipping =
      freeShipping || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

    // 5) Total final
    const totalAmount = Math.max(0, subtotal + shipping - discount);

    // 6) Transacción: crea order + items + event + decrementa stock + registra uso de cupón
    console.log("[checkout] couponCode recibido:", couponCode);
    console.log("[checkout] validCoupon:", validCoupon?.code, validCoupon?.id);
    console.log("[checkout] discount:", discount, "shipping:", shipping, "total:", totalAmount);
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId: customer.id,
          paymentMethod: data.paymentMethod,
          totalAmount,
          shippingAmount: shipping,
          discountAmount: discount,
          appliedCouponCode: validCoupon?.code ?? null,
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

      // Decrementa stock
      for (const item of cartItems) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Registra uso de cupón
      if (validCoupon) {
        await tx.coupon.update({
          where: { id: validCoupon.id },
          data: { usedCount: { increment: 1 } },
        });
        await tx.couponUse.create({
          data: {
            couponId: validCoupon.id,
            orderId: newOrder.id,
            customerId: customer.id,
          },
        });
      }

      return newOrder;
    });

    // 7) Webhook a n8n (fuera de la transacción)
    await notifyOrderStatusChange(order.id);

    // 8) Marca el cart como RECOVERED
    if (sessionId) {
      await db.cart.updateMany({
        where: { sessionId, status: { not: "RECOVERED" } },
        data: {
          status: "RECOVERED",
          recoveredAt: new Date(),
          orderId: order.id,
        },
      });
    }

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Error creando pedido:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, error: `DB error: ${error.code}` };
    }
    return { success: false, error: "No se pudo procesar el pedido." };
  }
}