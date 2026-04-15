import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus, notifyShipping } from "@/services/order.service";
import { OrderStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, orderId, status } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Falta orderId" }, { status: 400 });
    }

    if (action === "updateStatus") {
      if (!status) {
        return NextResponse.json({ error: "Falta status" }, { status: 400 });
      }
      await updateOrderStatus(orderId, status as OrderStatus);
      return NextResponse.json({ success: true });
    }

    if (action === "notifyShipping") {
      await notifyShipping(orderId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  } catch (error) {
    console.error("Error in order action:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}