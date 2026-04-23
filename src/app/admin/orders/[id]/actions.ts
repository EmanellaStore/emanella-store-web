// src/app/admin/orders/[id]/actions.ts
"use server";
import { revalidatePath } from "next/cache";
import { updateOrderItems, updateOrderCustomer, updateOrderStatus } from "@/services/order.service";
import { OrderStatus } from "@prisma/client";

export async function handleUpdateOrderItems(orderId: string, items: { variantId: string; quantity: number; unitPrice: number }[]) {
  await updateOrderItems(orderId, items, "Items actualizados desde panel admin");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function handleUpdateOrderCustomer(
  orderId: string,
  data: { name: string; phone: string; address?: string; city?: string; notes?: string }
) {
  await updateOrderCustomer(orderId, data, "Datos actualizados desde panel admin");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function handleUpdateOrderStatus(
  orderId: string,
  status: string,
  extraData?: { trackingCode?: string; trackingCarrier?: string }
) {
  await updateOrderStatus(orderId, status as OrderStatus, "Estado actualizado desde panel admin", extraData);
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}