// src/app/api/admin/orders/route.ts
import { NextResponse } from "next/server";
import { getOrders } from "@/services/order.service";

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}