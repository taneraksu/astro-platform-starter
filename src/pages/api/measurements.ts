import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';
import type { Measurement } from '../../types/patient';

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const patientId = url.searchParams.get('patientId');

        if (!patientId) {
            return new Response(JSON.stringify({ error: 'patientId gerekli' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const store = getStore('measurements');
        const { blobs } = await store.list();

        const measurements: Measurement[] = [];
        for (const blob of blobs) {
            if (blob.key.startsWith(`${patientId}-`)) {
                const data = await store.get(blob.key, { type: 'json' });
                if (data) {
                    measurements.push(data as Measurement);
                }
            }
        }

        measurements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return new Response(JSON.stringify(measurements), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching measurements:', error);
        return new Response(JSON.stringify({ error: 'Ölçümler yüklenemedi' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        if (!body.patientId) {
            return new Response(JSON.stringify({ error: 'patientId gerekli' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const store = getStore('measurements');
        const patientsStore = getStore('patients');

        const id = generateId();
        const now = new Date().toISOString();

        const measurement: Measurement = {
            id,
            patientId: body.patientId,
            date: body.date || now.split('T')[0],
            heightCm: Number(body.heightCm),
            lengtheningMm: Number(body.lengtheningMm),
            painLevel: Number(body.painLevel) || 0,
            mobilityScore: Number(body.mobilityScore) || 5,
            xrayTaken: Boolean(body.xrayTaken),
            xrayDate: body.xrayDate || undefined,
            callus: body.callus || undefined,
            notes: body.notes || '',
            createdAt: now,
        };

        const key = `${body.patientId}-${id}`;
        await store.setJSON(key, measurement);

        // Update patient's current height and achieved lengthening
        const patient = await patientsStore.get(body.patientId, { type: 'json' }) as any;
        if (patient) {
            patient.currentHeightCm = measurement.heightCm;
            patient.achievedLengtheningMm = measurement.lengtheningMm;
            patient.updatedAt = now;
            await patientsStore.setJSON(body.patientId, patient);
        }

        return new Response(JSON.stringify(measurement), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error creating measurement:', error);
        return new Response(JSON.stringify({ error: 'Ölçüm oluşturulamadı' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
