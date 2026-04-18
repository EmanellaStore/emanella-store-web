// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createUser, verifyUser, getUserByEmail } from "@/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, name, lastName, phone } = body;

    if (action === "login") {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email y contraseña requeridos" },
          { status: 400 }
        );
      }

      const user = await verifyUser(email, password);
      if (!user) {
        return NextResponse.json(
          { error: "Credenciales inválidas" },
          { status: 401 }
        );
      }

      const isAdmin = user.role === "ADMIN";
      const response = NextResponse.json({
        success: true,
        isAdmin,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
        },
      });

      if (isAdmin) {
        response.cookies.set("admin_session", "true", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24, // 24h
          path: "/",
        });
      }

      return response;
    }

    if (action === "register") {
      if (!email || !password || !name || !phone) {
        return NextResponse.json(
          { error: "Datos incompletos" },
          { status: 400 }
        );
      }

      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json(
          { error: "El email ya está registrado" },
          { status: 400 }
        );
      }

      const { user } = await createUser({ email, password, name, lastName, phone });

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
        },
      });
    }

    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  } catch (error) {
    console.error("Auth API error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}