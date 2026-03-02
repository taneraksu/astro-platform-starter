import type { APIRoute } from 'astro';
import { getMessages, saveMessage, markMessagesRead } from '../../utils/storage';
import { randomUUID } from 'crypto';

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const patientId = url.searchParams.get('patientId');
        const readerType = url.searchParams.get('readerType') as 'doctor' | 'patient' | null;
        if (!patientId) return new Response(JSON.stringify({ error: 'patientId gerekli.' }), { status: 400 });

        const messages = await getMessages(patientId);
        if (readerType) {
            await markMessagesRead(patientId, readerType);
        }
        return new Response(JSON.stringify(messages), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { patientId, doctorId, senderType, content } = body;

        if (!patientId || !doctorId || !senderType || !content) {
            return new Response(JSON.stringify({ error: 'Eksik alan.' }), { status: 400 });
        }

        const msg = {
            id: randomUUID(),
            patientId,
            doctorId,
            senderType,
            content,
            read: false,
            createdAt: new Date().toISOString()
        };

        await saveMessage(msg);
        return new Response(JSON.stringify(msg), { status: 201 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};
