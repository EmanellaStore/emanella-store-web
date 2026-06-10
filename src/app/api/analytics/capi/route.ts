// src/app/api/analytics/capi/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendMetaCapiEvent } from "@/services/capi.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, eventId, eventUrl, userData = {}, customData } = body;

    if (!eventName || !eventId) {
      return NextResponse.json(
        { success: false, error: "Missing eventName or eventId" },
        { status: 400 }
      );
    }

    // Capture IP and User-Agent from headers
    const userAgent = request.headers.get("user-agent") || "";
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
               request.headers.get("x-real-ip") || 
               "";

    // Capture Meta specific cookies
    const fbp = request.cookies.get("_fbp")?.value || "";
    const fbc = request.cookies.get("_fbc")?.value || "";

    // Merge client headers/cookies into user data
    const enrichedUserData = {
      ...userData,
      ip,
      userAgent,
      fbp,
      fbc,
    };

    // Forward to Meta Conversion API service
    const success = await sendMetaCapiEvent({
      eventName,
      eventId,
      eventUrl: eventUrl || request.headers.get("referer") || "",
      userData: enrichedUserData,
      customData,
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`[CAPI Proxy] Event ${eventName} processed. Success: ${success}`);
    }

    return NextResponse.json({ success });
  } catch (error) {
    console.error("Error in CAPI analytics route:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
