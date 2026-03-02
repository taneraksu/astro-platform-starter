import type { APIRoute } from 'astro';
import { getOsteomyelitisEntries, saveOsteomyelitisEntry } from '../../utils/storage';
import { randomUUID } from 'crypto';

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const patientId = url.searchParams.get('patientId');
        if (!patientId) return new Response(JSON.stringify({ error: 'patientId gerekli.' }), { status: 400 });
        const entries = await getOsteomyelitisEntries(patientId);
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
            probeToBone, probeToBoneResult,
            xrayResult, mriResult,
            boneBiopsy, biopsyOrganism,
            esr, crp, wbc,
            affectedBone,
            diagnosis, treatment,
            antibioticProtocol, surgicalPlan,
            notes
        } = body;

        if (!patientId || !doctorId || !affectedBone || !diagnosis || !treatment) {
            return new Response(JSON.stringify({ error: 'Eksik alan.' }), { status: 400 });
        }

        const entry = {
            id: randomUUID(),
            patientId,
            doctorId,
            date: date ?? new Date().toISOString().split('T')[0],
            probeToBone: Boolean(probeToBone),
            probeToBoneResult: probeToBoneResult ?? undefined,
            xrayResult: xrayResult ?? 'not_done',
            mriResult: mriResult ?? 'not_done',
            boneBiopsy: Boolean(boneBiopsy),
            biopsyOrganism: biopsyOrganism ?? undefined,
            esr: esr !== undefined && esr !== '' ? Number(esr) : undefined,
            crp: crp !== undefined && crp !== '' ? Number(crp) : undefined,
            wbc: wbc !== undefined && wbc !== '' ? Number(wbc) : undefined,
            affectedBone,
            diagnosis,
            treatment,
            antibioticProtocol: antibioticProtocol ?? undefined,
            surgicalPlan: surgicalPlan ?? undefined,
            notes: notes ?? '',
            createdAt: new Date().toISOString()
        };

        await saveOsteomyelitisEntry(entry);
        return new Response(JSON.stringify(entry), { status: 201 });
    } catch {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};
