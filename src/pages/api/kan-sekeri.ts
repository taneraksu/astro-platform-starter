import type { APIRoute } from 'astro';
import { getGlucoseEntries, saveGlucoseEntry } from '../../utils/storage';
import { randomUUID } from 'crypto';

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const patientId = url.searchParams.get('patientId');
        if (!patientId) return new Response(JSON.stringify({ error: 'patientId gerekli.' }), { status: 400 });
        const entries = await getGlucoseEntries(patientId);
        return new Response(JSON.stringify(entries), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { patientId, value, measurementType, insulinUsed, insulinType, dose, notes, datetime } = body;

        if (!patientId || !value || !measurementType) {
            return new Response(JSON.stringify({ error: 'Eksik alan.' }), { status: 400 });
        }

        const entry = {
            id: randomUUID(),
            patientId,
            datetime: datetime ?? new Date().toISOString(),
            value: Number(value),
            measurementType,
            insulinUsed: insulinUsed ?? false,
            insulinType: insulinType ?? '',
            dose: dose ? Number(dose) : undefined,
            notes: notes ?? '',
            createdAt: new Date().toISOString()
        };

        await saveGlucoseEntry(entry);
        return new Response(JSON.stringify(entry), { status: 201 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};
