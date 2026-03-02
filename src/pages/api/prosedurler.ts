import type { APIRoute } from 'astro';
import { getProcedures, saveProcedure } from '../../utils/storage';
import { randomUUID } from 'crypto';

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const patientId = url.searchParams.get('patientId');
        if (!patientId) return new Response(JSON.stringify({ error: 'patientId gerekli.' }), { status: 400 });
        const procs = await getProcedures(patientId);
        return new Response(JSON.stringify(procs), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { patientId, doctorId, date, type, surgeonName, details, outcome, followupDate } = body;

        if (!patientId || !doctorId || !date || !type) {
            return new Response(JSON.stringify({ error: 'Eksik alan.' }), { status: 400 });
        }

        const proc = {
            id: randomUUID(),
            patientId,
            doctorId,
            date,
            type,
            surgeonName: surgeonName ?? '',
            details: details ?? '',
            outcome: outcome ?? '',
            followupDate: followupDate ?? '',
            createdAt: new Date().toISOString()
        };

        await saveProcedure(proc);
        return new Response(JSON.stringify(proc), { status: 201 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};
