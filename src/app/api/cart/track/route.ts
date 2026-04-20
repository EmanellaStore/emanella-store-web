// app/api/cart/track/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  const { sessionId, customerId, phone, email, items } = await req.json();
  // items: [{ variantId, quantity, unitPrice }]

  const total = items.reduce((s: number, i: any) => s + i.unitPrice * i.quantity, 0);

  const cart = await prisma.cart.upsert({
    where: { sessionId },
    update: {
      customerId, phone, email,
      totalAmount: total,
      lastActivity: new Date(),
      status: 'ACTIVE',
      items: {
        deleteMany: {},
        create: items,
      },
    },
    create: {
      sessionId, customerId, phone, email,
      totalAmount: total,
      items: { create: items },
    },
  });

  return NextResponse.json({ cartId: cart.id });
}