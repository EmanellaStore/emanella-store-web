// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  // Rutas admin: permiten acceso con cookie ADMIN O con x-n8n-token (para n8n/curl)
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const n8nToken = request.headers.get("x-n8n-token");
    const isN8nRequest = n8nToken && n8nToken === process.env.N8N_SECRET;

    if (!isN8nRequest && (!session || session.role !== "ADMIN")) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Cartera (fiados) e Inventario: abiertos a ADMIN y al usuario compartido (CARTERA)
  if (
    pathname.startsWith("/cartera") ||
    pathname.startsWith("/api/cartera") ||
    pathname.startsWith("/inventario") ||
    pathname.startsWith("/api/inventario")
  ) {
    const allowed = session && (session.role === "ADMIN" || session.role === "CARTERA");
    if (!allowed) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const destino = pathname.startsWith("/inventario") ? "inventario" : "cartera";
      return NextResponse.redirect(new URL(`/login?destino=${destino}`, request.url));
    }
  }

  if (pathname === "/login" && session) {
    const destino =
      session.role === "ADMIN"
        ? "/admin"
        : session.role === "CARTERA"
          ? "/cartera"
          : "/catalogo";
    return NextResponse.redirect(new URL(destino, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/cartera/:path*",
    "/api/cartera/:path*",
    "/inventario/:path*",
    "/api/inventario/:path*",
    "/login",
  ],
};