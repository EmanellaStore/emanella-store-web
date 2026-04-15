"use server";

import { revalidatePath } from "next/cache";
import { updateOrderItems, updateOrderCustomer, updateOrderStatus, notifyShipping } from "@/services/order.service";
import { OrderStatus } from "@prisma/client";

export async function handleUpdateOrderItems(orderId: string, items: { variantId: string; quantity: number; unitPrice: number }[]) {
  try {
    await updateOrderItems(orderId, items, "Items actualizados desde panel admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating order items:", error);
    throw error;
  }
}

export async function handleUpdateOrderCustomer(
  orderId: string,
  data: { name: string; phone: string; address?: string; city?: string; notes?: string }
) {
  try {
    await updateOrderCustomer(orderId, data, "Datos del cliente actualizados desde panel admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating order customer:", error);
    throw error;
  }
}

export async function handleUpdateOrderStatus(orderId: string, status: string) {
  try {
    await updateOrderStatus(orderId, status as OrderStatus, "Estado actualizado desde panel admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

export async function handleNotifyShipping(orderId: string) {
  try {
    await notifyShipping(orderId);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("Error notifying shipping:", error);
    throw error;
  }
}
