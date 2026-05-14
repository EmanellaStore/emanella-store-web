import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/services/checkout.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, items, sessionId, couponCode } = body;

    if (!data || !items || !Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "Datos inválidos" }, { status: 400 });
    }
    const result = await createOrder(data, items, sessionId, couponCode);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in checkout API:", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}