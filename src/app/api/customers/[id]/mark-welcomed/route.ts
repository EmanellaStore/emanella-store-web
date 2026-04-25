// src/app/api/customers/[id]/mark-welcomed/route.ts
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

  const customer = await db.customer.update({
    where: { id },
    data: { welcomeSentAt: new Date() },
  });

  return NextResponse.json({ ok: true, customerId: customer.id });
}