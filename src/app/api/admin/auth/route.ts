//src/app/api/admin/auth/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyUser } from "@/services/auth.service";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
  }

  const user = await verifyUser(email, password);

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo administradores pueden acceder" }, { status: 401 });
  }

  return NextResponse.json({ success: true, admin: true });
}