// src/app/api/customers/segmented/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function auth(req: NextRequest) {
  return req.headers.get('x-n8n-token') === process.env.N8N_SECRET;
}

export async function GET(req: NextRequest) {
  if (!auth(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const step = Number(searchParams.get('step') || 1);
  const now = new Date();

  try {
    switch (type) {
      // ============ WELCOME ============
      case 'welcome': {
        const from = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2h
        const to = new Date(now.getTime() - 10 * 60 * 1000); // 10 min
        const customers = await db.customer.findMany({
          where: {
            createdAt: { gte: from, lte: to },
            welcomeSentAt: null,
            orderCount: 0,
          },
          take: 50,
        });
        return NextResponse.json({ customers });
      }

      // ============ REVIEW PENDING ============
      case 'review-pending': {
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const orders = await db.order.findMany({
          where: {
            status: 'ENTREGADO',
            deliveredAt: { lte: threeDaysAgo },
            reviewRequestedAt: null,
          },
          include: {
            customer: true,
            items: {
              include: {
                variant: { include: { product: true } },
              },
            },
          },
          take: 30,
        });
        return NextResponse.json({ orders });
      }

      // ============ REPURCHASE (30/60/90) ============
      case 'repurchase': {
        const daysMap: Record<number, number> = { 1: 30, 2: 60, 3: 90 };
        const days = daysMap[step];
        if (!days)
          return NextResponse.json(
            { error: 'step inválido (1,2,3)' },
            { status: 400 },
          );

        const target = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const windowStart = new Date(target.getTime() - 6 * 60 * 60 * 1000);

        const customers = await db.customer.findMany({
          where: {
            lastPurchaseAt: { gte: windowStart, lte: target },
            repurchaseStep: { lt: step },
          },
          include: {
            orders: {
              where: { status: 'ENTREGADO' },
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                items: {
                  include: {
                    variant: { include: { product: true } },
                  },
                },
              },
            },
          },
          take: 30,
        });
        return NextResponse.json({ customers });
      }

      // ============ WINBACK (90+ días) ============
      case 'winback': {
        const ninetyDaysAgo = new Date(
          now.getTime() - 90 * 24 * 60 * 60 * 1000,
        );
        const customers = await db.customer.findMany({
          where: {
            lastPurchaseAt: { lt: ninetyDaysAgo },
            winbackSentAt: null,
            orderCount: { gte: 1 },
          },
          take: 30,
        });
        return NextResponse.json({ customers });
      }

      // ============ PAYMENT PENDING ============
      case 'payment-pending': {
        const stepWindows: Record<number, { from: number; to: number }> = {
          1: { from: 90, to: 30 }, // 30min - 1.5h atrás
          2: { from: 420, to: 360 }, // ~6h
          3: { from: 1500, to: 1440 }, // ~24h
        };
        const w = stepWindows[step];
        if (!w)
          return NextResponse.json(
            { error: 'step inválido (1,2,3)' },
            { status: 400 },
          );

        const fromDate = new Date(now.getTime() - w.from * 60 * 1000);
        const toDate = new Date(now.getTime() - w.to * 60 * 1000);

        const orders = await db.order.findMany({
          where: {
            status: 'PENDIENTE',
            paymentMethod: { in: ['transferencia', 'nequi', 'bancolombia'] },
            createdAt: { gte: fromDate, lte: toDate },
            paymentRecoveryStep: { lt: step },
          },
          include: { customer: true },
          take: 30,
        });
        return NextResponse.json({ orders });
      }

      default:
        return NextResponse.json(
          { error: 'type inválido. Usa: welcome|review-pending|repurchase|winback|payment-pending' },
          { status: 400 },
        );
    }
  } catch (err) {
    console.error('[segmented] error:', err);
    return NextResponse.json(
      { error: 'Internal error', details: String(err) },
      { status: 500 },
    );
  }
}