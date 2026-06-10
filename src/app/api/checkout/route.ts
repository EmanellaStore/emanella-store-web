import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/services/checkout.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, items, sessionId, couponCode } = body;

    if (!data || !items || !Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "Datos inválidos" }, { status: 400 });
    }

    // Extract tracking info for CAPI
    const userAgent = request.headers.get("user-agent") || "";
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
               request.headers.get("x-real-ip") || 
               "";
    const fbp = request.cookies.get("_fbp")?.value || "";
    const fbc = request.cookies.get("_fbc")?.value || "";

    const result = await createOrder(data, items, sessionId, couponCode, {
      ip,
      userAgent,
      fbp,
      fbc,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in checkout API:", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}