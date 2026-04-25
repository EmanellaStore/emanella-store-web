// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// POST: cliente envía su reseña (desde link en Telegram/WhatsApp)
export async function POST(req: NextRequest) {
    try {
        const { orderId, customerId, productId, rating, comment, photoUrl } =
            await req.json();

        if (!orderId || !customerId || !rating) {
            return NextResponse.json(
                { error: 'orderId, customerId y rating son requeridos' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating debe ser entre 1 y 5' },
                { status: 400 }
            );
        }

        // Verificar que la orden existe y pertenece al cliente
        const order = await db.order.findFirst({
            where: { id: orderId, customerId },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Orden no encontrada' },
                { status: 404 }
            );
        }

        // Evitar reseña duplicada por orden
        const existing = await db.review.findFirst({
            where: { orderId, customerId },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Ya dejaste una reseña para este pedido' },
                { status: 409 }
            );
        }

        const review = await db.review.create({
            data: {
                orderId,
                customerId,
                productId: productId || null,
                rating,
                comment: comment || null,
                photoUrl: photoUrl || null,
                verified: true,
                published: false, // admin aprueba antes de publicar
            },
        });

        // Marcar la orden como reviewada
        await db.order.update({
            where: { id: orderId },
            data: { reviewedAt: new Date() },
        });

        // Generar cupón por foto si aplica
        const existingCoupon = await db.coupon.findFirst({
            where: {
                customerId: customerId,
                campaign: 'REVIEW',
                usedCount: 0,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        const couponToReturn = existingCoupon ?? null;

        // Solo si tiene foto Y hay cupón pre-generado, lo retorna  
        if (photoUrl && couponToReturn) {
            return NextResponse.json({ ok: true, coupon: couponToReturn });
        }

        return NextResponse.json({
            ok: true,
            reviewId: review.id,
        });
    } catch (err) {
        console.error('[reviews] error:', err);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

// GET: reseñas públicas de un producto
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
        return NextResponse.json({ error: 'productId requerido' }, { status: 400 });
    }

    const reviews = await db.review.findMany({
        where: { productId, published: true },
        include: {
            customer: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
    });

    return NextResponse.json({ reviews });
}