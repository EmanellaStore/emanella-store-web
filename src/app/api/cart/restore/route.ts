import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId requerido' }, { status: 400 });
  }

  const cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { include: { images: { orderBy: { position: 'asc' }, take: 1 } } },
            },
          },
        },
      },
    },
  });

  if (!cart || cart.status === 'RECOVERED' || cart.status === 'LOST') {
    return NextResponse.json({ items: [] });
  }

  const items = cart.items.map(ci => ({
    variantId: ci.variantId,
    productId: ci.variant.productId,
    name: ci.variant.product.name,
    slug: ci.variant.product.slug,
    attributeName: ci.variant.attributeName,
    attributeValue: ci.variant.attributeValue,
    price: Number(ci.unitPrice),
    quantity: ci.quantity,
    imageUrl: ci.variant.product.images[0]?.imageUrl || null,
  }));

  return NextResponse.json({ sessionId: cart.sessionId, phone: cart.phone, items });
}