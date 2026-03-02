import type { APIRoute } from 'astro';
import { getVascularEntries, saveVascularEntry } from '../../utils/storage';
import { randomUUID } from 'crypto';

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const patientId = url.searchParams.get('patientId');
        if (!patientId) return new Response(JSON.stringify({ error: 'patientId gerekli.' }), { status: 400 });
        const entries = await getVascularEntries(patientId);
        return new Response(JSON.stringify(entries), { status: 200 });
    } catch {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const {
            patientId, doctorId, date,
            dpPulse, ptPulse, dopplerWave,
            abi, tbi, toePressure, tcpo2,
            padDiagnosis, revascularizationRecommended,
            findings, notes
        } = body;

        if (!patientId || !doctorId || !dpPulse || !ptPulse || !padDiagnosis || !findings) {
            return new Response(JSON.stringify({ error: 'Eksik alan.' }), { status: 400 });
        }

        const entry = {
            id: randomUUID(),
            patientId,
            doctorId,
            date: date ?? new Date().toISOString().split('T')[0],
            dpPulse,
            ptPulse,
            dopplerWave: dopplerWave ?? undefined,
            abi: abi !== undefined && abi !== '' ? Number(abi) : undefined,
            tbi: tbi !== undefined && tbi !== '' ? Number(tbi) : undefined,
            toePressure: toePressure !== undefined && toePressure !== '' ? Number(toePressure) : undefined,
            tcpo2: tcpo2 !== undefined && tcpo2 !== '' ? Number(tcpo2) : undefined,
            padDiagnosis,
            revascularizationRecommended: Boolean(revascularizationRecommended),
            findings,
            notes: notes ?? '',
            createdAt: new Date().toISOString()
        };

        await saveVascularEntry(entry);
        return new Response(JSON.stringify(entry), { status: 201 });
    } catch {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};
