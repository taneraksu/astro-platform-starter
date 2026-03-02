import type { APIRoute } from 'astro';
import {
    getPatientsByDoctor, savePatient,
    getGlucoseEntries, getWoundEntries
} from '../../../utils/storage';
import { generateAccessCode } from '../../../utils/codeGenerator';
import { computeRiskFlags } from '../../../utils/scoring';
import { randomUUID } from 'crypto';

// GET — list patients for a doctor with summary data
export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const doctorId = url.searchParams.get('doctorId');
        if (!doctorId) return new Response(JSON.stringify({ error: 'doctorId gerekli.' }), { status: 400 });

        const patients = await getPatientsByDoctor(doctorId);

        const summaries = await Promise.all(patients.map(async (p) => {
            const glucoseEntries = await getGlucoseEntries(p.id);
            const woundEntries = await getWoundEntries(p.id);

            const lastGlucose = glucoseEntries[0];
            const lastWound = woundEntries[0];

            const lastEntryDate = [lastGlucose?.datetime, lastWound?.datetime]
                .filter(Boolean)
                .sort()
                .reverse()[0] ?? null;

            const daysSinceLastEntry = lastEntryDate
                ? Math.floor((Date.now() - new Date(lastEntryDate).getTime()) / 86400000)
                : 999;

            const flags = computeRiskFlags({
                lastGlucose: lastGlucose?.value,
                wagnerGrade: lastWound?.wagnerGrade,
                canWalk: lastWound?.canWalk,
                symptoms: lastWound?.symptoms,
                daysSinceLastEntry
            });

            // 7-day avg glucose
            const sevenDaysAgo = Date.now() - 7 * 86400000;
            const recentGlucose = glucoseEntries.filter(e => new Date(e.datetime).getTime() > sevenDaysAgo);
            const avgGlucose = recentGlucose.length
                ? Math.round(recentGlucose.reduce((s, e) => s + e.value, 0) / recentGlucose.length)
                : null;

            return {
                ...p,
                lastEntryDate,
                lastGlucoseValue: lastGlucose?.value ?? null,
                lastWagnerGrade: lastWound?.wagnerGrade ?? null,
                avgGlucose7d: avgGlucose,
                riskFlags: flags,
                isHighRisk: flags.length > 0
            };
        }));

        return new Response(JSON.stringify(summaries), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};

// POST — create new patient
export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { doctorId, name, dob, phone, diagnosisDate, notes } = body;

        if (!doctorId || !name) {
            return new Response(JSON.stringify({ error: 'doctorId ve hasta adı zorunludur.' }), { status: 400 });
        }

        const patient = {
            id: randomUUID(),
            doctorId,
            name,
            dob: dob ?? '',
            phone: phone ?? '',
            diagnosisDate: diagnosisDate ?? '',
            accessCode: generateAccessCode(),
            notes: notes ?? '',
            isActive: true,
            createdAt: new Date().toISOString()
        };

        await savePatient(patient);
        return new Response(JSON.stringify(patient), { status: 201 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};
