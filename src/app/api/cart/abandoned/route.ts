// app/api/cart/abandoned/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/db";

/*const WINDOWS = {
  '1': { minAgo: 60,   maxAgo: 10080 }, // 1h a 7 días  
  '2': { minAgo: 1440, maxAgo: 10080 }, // 24h a 7 días  
  '3': { minAgo: 4320, maxAgo: 10080 }, // 72h a 7 días  
};*/
//TODO cambiar esto para prod
const WINDOWS = {  
  '1': { minAgo: 1, maxAgo: 99999 }, // carritos con 1+ min  
  '2': { minAgo: 1, maxAgo: 99999 },  
  '3': { minAgo: 1, maxAgo: 99999 },  
};

export async function GET(req: NextRequest) {
  const step = req.nextUrl.searchParams.get('step') as '1' | '2' | '3';
  const token = req.headers.get('x-n8n-token');
  if (token !== process.env.N8N_SECRET) return new NextResponse('Unauthorized', { status: 401 });

  const { minAgo, maxAgo } = WINDOWS[step];
  const now = Date.now();

  const carts = await prisma.cart.findMany({
    where: {
      status: { in: ['ACTIVE', 'ABANDONED', 'RECOVERING'] },
      recoveryStep: Number(step) - 1,
      phone: { not: null },
      totalAmount: { gt: 0 },
      lastActivity: {
        lte: new Date(now - minAgo * 60_000),
        gte: new Date(now - maxAgo * 60_000),
      },
    },
    include: {
      items: { include: { variant: { include: { product: { include: { images: true } } } } } },
      customer: true,
    },
    take: 50,
  });

  return NextResponse.json(carts);
}