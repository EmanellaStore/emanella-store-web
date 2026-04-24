// src/app/api/customers/upsert/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  const { name, phone } = await req.json();
  if (!phone?.match(/^3\d{9}$/)) {
    return NextResponse.json({ error: 'phone inválido' }, { status: 400 });
  }

  const customer = await db.customer.upsert({
    where: { phone },
    update: { name: name || undefined },
    create: { name: name || 'Sin nombre', phone },
  });

  return NextResponse.json({ customer });
}