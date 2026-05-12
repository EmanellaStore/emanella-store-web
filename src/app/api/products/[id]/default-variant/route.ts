// src/app/api/products/[id]/default-variant/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Unwrap params (important in Next app router)
    const { id } = await context.params;

    const attr = req.nextUrl.searchParams.get("attr")?.toLowerCase().replace(/\s+/g, "") || null;

    // Primero intenta encontrar variante que coincida con el atributo pedido y tenga stock
    let variant = null;

    if (attr) {
      variant = await db.productVariant.findFirst({
        where: {
          productId: id,
          stock: { gt: 0 },
          // remove spaces when comparing attributeValue too
          attributeValue: { contains: attr, mode: "insensitive" },
        },
        orderBy: { price: "asc" },
        include: { product: { select: { name: true } } },
      });
    }

    // Si no hay match por atributo, toma la variante más barata con stock
    if (!variant) {
      variant = await db.productVariant.findFirst({
        where: { productId: id, stock: { gt: 0 } },
        orderBy: { price: "asc" },
        include: { product: { select: { name: true } } },
      });
    }

    // Si aún no hay (por ejemplo variantes con id null), tomar cualquier variante
    if (!variant) {
      variant = await db.productVariant.findFirst({
        where: { productId: id },
        orderBy: { price: "asc" },
        include: { product: { select: { name: true } } },
      });
    }

    if (!variant) {
      return NextResponse.json({ error: "Producto sin variantes configuradas" }, { status: 404 });
    }

    return NextResponse.json({
      variantId: variant.id,
      productName: `${variant.product.name}${variant.attributeValue ? ` ${variant.attributeValue}` : ""}`,
      price: Number(variant.price || 0),
      attributeValue: variant.attributeValue,
      stock: variant.stock,
    });
  } catch (err) {
    console.error("[api/products/[id]/default-variant] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}