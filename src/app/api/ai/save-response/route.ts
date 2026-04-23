import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-n8n-token');
  if (token !== process.env.N8N_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { conversationId, content, metadata, escalate } = await req.json();

  await prisma.conversationMessage.create({
    data: {
      conversationId,
      role: 'ASSISTANT',
      content,
      metadata: metadata || undefined,
    },
  });

  if (escalate) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'HUMAN' },
    });
  }

  return NextResponse.json({ ok: true });
}