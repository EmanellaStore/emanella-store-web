// src/app/api/orders/[id]/mark-review-requested/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (req.headers.get('x-n8n-token') !== process.env.N8N_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await db.order.update({
    where: { id },
    data: { reviewRequestedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}