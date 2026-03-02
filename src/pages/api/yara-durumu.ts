import type { APIRoute } from 'astro';
import { getWoundEntries, saveWoundEntry } from '../../utils/storage';
import { randomUUID } from 'crypto';

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const patientId = url.searchParams.get('patientId');
        if (!patientId) return new Response(JSON.stringify({ error: 'patientId gerekli.' }), { status: 400 });
        const entries = await getWoundEntries(patientId);
        return new Response(JSON.stringify(entries), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { patientId, footSide, wagnerGrade, size, symptoms, painScore, canWalk, temperature, notes, datetime } = body;

        if (!patientId || footSide === undefined || wagnerGrade === undefined || !size || !canWalk) {
            return new Response(JSON.stringify({ error: 'Eksik alan.' }), { status: 400 });
        }

        const entry = {
            id: randomUUID(),
            patientId,
            datetime: datetime ?? new Date().toISOString(),
            footSide,
            wagnerGrade: Number(wagnerGrade),
            size,
            symptoms: symptoms ?? {},
            painScore: painScore ? Number(painScore) : 1,
            canWalk,
            temperature: temperature ? Number(temperature) : undefined,
            notes: notes ?? '',
            createdAt: new Date().toISOString()
        };

        await saveWoundEntry(entry);
        return new Response(JSON.stringify(entry), { status: 201 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};
