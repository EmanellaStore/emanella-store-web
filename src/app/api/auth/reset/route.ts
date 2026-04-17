import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset, resetPassword } from "@/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, token, password } = body;

    if (action === "requestReset") {
      if (!email) {
        return NextResponse.json({ error: "Email requerido" }, { status: 400 });
      }

      const result = await requestPasswordReset(email);
      return NextResponse.json(result);
    }

    if (action === "resetPassword") {
      if (!token || !password) {
        return NextResponse.json({ error: "Token y contraseña requeridos" }, { status: 400 });
      }

      const result = await resetPassword(token, password);
      
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  } catch (error) {
    console.error("Password reset API error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}