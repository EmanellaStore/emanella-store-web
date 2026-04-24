// src/app/api/admin/coupons/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import  db from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  if (req.headers.get('x-n8n-token') !== process.env.N8N_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const {
    customerId,
    campaign,
    type = 'PERCENT',
    value,
    expiresInHours,
    maxUses = 1,
    minAmount,
  } = await req.json();

  const prefixMap: Record<string, string> = {
    WELCOME: 'BIENVENIDA',
    REVIEW: 'FOTO',
    WINBACK: 'VOLVISTE',
    REPURCHASE: 'VOLVEMOS',
  };
  const prefix = prefixMap[campaign] || 'EMA';
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  const code = `${prefix}${random}`;

  const coupon = await db.coupon.create({
    data: {
      code,
      type,
      value,
      minAmount,
      maxUses,
      customerId: customerId || null,
      campaign,
      expiresAt: expiresInHours
        ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
        : null,
    },
  });

  return NextResponse.json({ coupon });
}