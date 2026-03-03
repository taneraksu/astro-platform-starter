import type { APIRoute } from 'astro';
import { getTreatmentRecords, saveTreatmentRecord } from '../../utils/storage';
import { randomUUID } from 'crypto';

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const patientId = url.searchParams.get('patientId');
        if (!patientId) return new Response(JSON.stringify({ error: 'patientId gerekli.' }), { status: 400 });
        const records = await getTreatmentRecords(patientId);
        return new Response(JSON.stringify(records), { status: 200 });
    } catch {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { patientId, doctorId, planDate } = body;
        if (!patientId || !doctorId || !planDate) {
            return new Response(JSON.stringify({ error: 'patientId, doctorId ve planDate gerekli.' }), { status: 400 });
        }
        const rec = {
            ...body,
            id: body.id ?? randomUUID(),
            createdAt: body.createdAt ?? new Date().toISOString(),
        };
        await saveTreatmentRecord(rec);
        return new Response(JSON.stringify(rec), { status: 200 });
    } catch {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};
