import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { cartId, step } = await req.json();

    if (!cartId || typeof step !== 'number') {
      return NextResponse.json(
        { ok: false, error: 'cartId y step son requeridos', received: { cartId, step } },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findUnique({ where: { id: cartId } });
    if (!cart) {
      return NextResponse.json(
        { ok: false, error: 'Cart no encontrado', cartId },
        { status: 404 }
      );
    }

    await prisma.cart.update({
      where: { id: cartId },
      data: { status: 'RECOVERING', recoveryStep: step },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[mark-recovering] error:', err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}