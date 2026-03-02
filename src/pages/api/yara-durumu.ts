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
        const {
            patientId, footSide, wagnerGrade, size,
            footRegions, dimensions, woundBed,
            utGrade, utStage, iwgdfInfectionGrade,
            wifiWound, wifiIschemia, wifiFootInfection,
            symptoms, painScore, canWalk, temperature, notes, datetime
        } = body;

        if (!patientId || footSide === undefined || wagnerGrade === undefined || !size || !canWalk) {
            return new Response(JSON.stringify({ error: 'Eksik alan.' }), { status: 400 });
        }

        const entry: any = {
            id: randomUUID(),
            patientId,
            datetime: datetime ?? new Date().toISOString(),
            footSide,
            footRegions: footRegions ?? undefined,
            wagnerGrade: Number(wagnerGrade),
            size,
            dimensions: dimensions ?? undefined,
            woundBed: woundBed ?? undefined,
            utGrade: utGrade !== undefined ? Number(utGrade) : undefined,
            utStage: utStage ?? undefined,
            iwgdfInfectionGrade: iwgdfInfectionGrade !== undefined ? Number(iwgdfInfectionGrade) : undefined,
            wifiWound: wifiWound !== undefined ? Number(wifiWound) : undefined,
            wifiIschemia: wifiIschemia !== undefined ? Number(wifiIschemia) : undefined,
            wifiFootInfection: wifiFootInfection !== undefined ? Number(wifiFootInfection) : undefined,
            symptoms: symptoms ?? {},
            painScore: painScore ? Number(painScore) : 1,
            canWalk,
            temperature: temperature ? Number(temperature) : undefined,
            notes: notes ?? '',
            createdAt: new Date().toISOString()
        };

        await saveWoundEntry(entry);
        return new Response(JSON.stringify(entry), { status: 201 });
    } catch {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};
