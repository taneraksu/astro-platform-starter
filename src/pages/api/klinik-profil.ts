import type { APIRoute } from 'astro';
import { getClinicalProfile, saveClinicalProfile } from '../../utils/storage';
import { randomUUID } from 'crypto';

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const patientId = url.searchParams.get('patientId');
        if (!patientId) return new Response(JSON.stringify({ error: 'patientId gerekli.' }), { status: 400 });
        const profile = await getClinicalProfile(patientId);
        return new Response(JSON.stringify(profile ?? null), { status: 200 });
    } catch {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { patientId, doctorId } = body;
        if (!patientId || !doctorId) return new Response(JSON.stringify({ error: 'patientId ve doctorId gerekli.' }), { status: 400 });

        const existing = await getClinicalProfile(patientId);
        const profile = {
            ...body,
            id: existing?.id ?? randomUUID(),
            updatedAt: new Date().toISOString(),
        };
        await saveClinicalProfile(profile);
        return new Response(JSON.stringify(profile), { status: 200 });
    } catch {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};
