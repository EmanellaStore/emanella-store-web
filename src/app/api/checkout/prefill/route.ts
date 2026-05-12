import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-n8n-token');
  // Endpoint público (solo lee datos no sensibles) — sin auth requerida
  // pero puedes agregar rate limiting si lo necesitas

  const phone = req.nextUrl.searchParams.get('phone');
  if (!phone) return NextResponse.json({ customer: null });

  const customer = await db.customer.findUnique({
    where: { phone },
    select: { name: true, phone: true, address: true, city: true },
  });

  return NextResponse.json({ customer: customer ?? null });
}