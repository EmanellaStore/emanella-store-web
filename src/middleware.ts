// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/session";

export async function middleware(request: NextRequest) {
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

  if (pathname === "/login" && session) {
    return NextResponse.redirect(
      new URL(session.role === "ADMIN" ? "/admin/orders" : "/catalogo", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/login"],
};