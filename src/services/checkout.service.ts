//src/services/checkout.service.ts
import { OrderStatus, Prisma } from "@prisma/client";
import { CartItem } from "@/store/useCartStore";
import { notifyOrderStatusChange } from "@/lib/webhooks";
import db from "@/lib/db";
import { sendMetaCapiEvent } from "./capi.service";

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

interface TrackingInfo {
  ip?: string;
  userAgent?: string;
  fbc?: string;
  fbp?: string;
}

const SHIPPING_COST = 15000;
const FREE_SHIPPING_THRESHOLD = 200000;

export async function createOrder(
  data: CheckoutData,
  cartItems: CartItem[],
  sessionId: string,
  couponCode?: string,
  trackingInfo?: TrackingInfo
): Promise<CheckoutResult> {
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

      //actualiza métricas del cliente al crear pedido  
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          lastPurchaseAt: new Date(),
          orderCount: { increment: 1 },
          totalSpent: { increment: totalAmount },
        },
      });

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

    // 9) Trigger Meta Conversion API (CAPI) for Purchase
    // if (order) {
    //   sendMetaCapiEvent({
    //     eventName: "Purchase",
    //     eventId: order.id,
    //     eventUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/gracias?orderId=${order.id}`,
    //     userData: {
    //       phone: customer.phone,
    //       firstName: customer.name,
    //       city: customer.city || "",
    //       ip: trackingInfo?.ip,
    //       userAgent: trackingInfo?.userAgent,
    //       fbp: trackingInfo?.fbp,
    //       fbc: trackingInfo?.fbc,
    //     },
    //     customData: {
    //       value: Number(order.totalAmount),
    //       currency: "COP",
    //       contentIds: cartItems.map((item) => item.productId),
    //       contentType: "product",
    //       contents: cartItems.map((item) => ({
    //         id: item.productId,
    //         quantity: item.quantity,
    //         item_price: Number(item.price),
    //       })),
    //       numItems: cartItems.reduce((acc, item) => acc + item.quantity, 0),
    //       coupon: order.appliedCouponCode || undefined,
    //     },
    //   }).catch((e) => console.error("Error triggering CAPI Purchase:", e));
    // }

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Error creando pedido:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, error: `DB error: ${error.code}` };
    }
    return { success: false, error: "No se pudo procesar el pedido." };
  }
}