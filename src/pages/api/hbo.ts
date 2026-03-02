import type { APIRoute } from 'astro';
import { getHBOSessions, saveHBOSession } from '../../utils/storage';
import { randomUUID } from 'crypto';

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const patientId = url.searchParams.get('patientId');
        if (!patientId) return new Response(JSON.stringify({ error: 'patientId gerekli.' }), { status: 400 });
        const sessions = await getHBOSessions(patientId);
        return new Response(JSON.stringify(sessions), { status: 200 });
    } catch {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const {
            patientId, doctorId, date,
            sessionNumber, totalPlannedSessions,
            indication, pressureAta, durationMin,
            outcome, woundResponse, sideEffects, notes
        } = body;

        if (!patientId || !doctorId || !sessionNumber || !indication || !outcome) {
            return new Response(JSON.stringify({ error: 'Eksik alan.' }), { status: 400 });
        }

        const session = {
            id: randomUUID(),
            patientId,
            doctorId,
            date: date ?? new Date().toISOString().split('T')[0],
            sessionNumber: Number(sessionNumber),
            totalPlannedSessions: totalPlannedSessions ? Number(totalPlannedSessions) : 30,
            indication,
            pressureAta: pressureAta ? Number(pressureAta) : 2.4,
            durationMin: durationMin ? Number(durationMin) : 90,
            outcome,
            woundResponse: woundResponse ?? undefined,
            sideEffects: sideEffects ?? undefined,
            notes: notes ?? '',
            createdAt: new Date().toISOString()
        };

        await saveHBOSession(session);
        return new Response(JSON.stringify(session), { status: 201 });
    } catch {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};
