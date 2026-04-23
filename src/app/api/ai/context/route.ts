import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
    const token = req.headers.get('x-n8n-token');
    if (token !== process.env.N8N_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone, channel = 'TELEGRAM', message } = await req.json();

    // 1. Buscar o crear conversación
    let conversation = await prisma.conversation.findFirst({
        where: { phone, status: { not: 'CLOSED' } },
        include: {
            customer: true,
            messages: { orderBy: { createdAt: 'desc' }, take: 10 },
        },
    });

    if (!conversation) {
        const customer = await prisma.customer.findUnique({ where: { phone } });
        conversation = await prisma.conversation.create({
            data: { phone, channel, customerId: customer?.id },
            include: { customer: true, messages: true },
        });
    }

    // 2. Guardar mensaje entrante del usuario
    if (message) {
        await prisma.conversationMessage.create({
            data: { conversationId: conversation.id, role: 'USER', content: message },
        });
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() },
        });
    }

    // 3. Retornar contexto listo para el LLM (en orden cronológico)
    const history = conversation.messages
        .reverse()
        .map(m => ({ role: m.role.toLowerCase(), content: m.content }));

    return NextResponse.json({
        conversationId: conversation.id,
        status: conversation.status,
        customer: conversation.customer,
        history,
    });
}