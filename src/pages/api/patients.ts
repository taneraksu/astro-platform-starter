import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';
import type { Patient } from '../../types/patient';

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const GET: APIRoute = async ({ request }) => {
    try {
        const store = getStore('patients');
        const { blobs } = await store.list();

        const patients: Patient[] = [];
        for (const blob of blobs) {
            const data = await store.get(blob.key, { type: 'json' });
            if (data) {
                patients.push(data as Patient);
            }
        }

        // Sort by createdAt descending
        patients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const url = new URL(request.url);
        const phase = url.searchParams.get('phase');
        const search = url.searchParams.get('search');

        let filtered = patients;
        if (phase && phase !== 'all') {
            filtered = filtered.filter((p) => p.phase === phase);
        }
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.doctor.toLowerCase().includes(q));
        }

        return new Response(JSON.stringify(filtered), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        return new Response(JSON.stringify({ error: 'Hastalar yüklenemedi' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const store = getStore('patients');

        const id = generateId();
        const now = new Date().toISOString();

        const patient: Patient = {
            id,
            name: body.name,
            dateOfBirth: body.dateOfBirth,
            gender: body.gender,
            phone: body.phone || '',
            email: body.email || '',
            initialHeightCm: Number(body.initialHeightCm),
            targetHeightCm: Number(body.targetHeightCm),
            currentHeightCm: Number(body.initialHeightCm),
            surgeryDate: body.surgeryDate,
            surgeryType: body.surgeryType,
            bone: body.bone,
            targetLengtheningMm: Number(body.targetLengtheningMm),
            achievedLengtheningMm: 0,
            distractionRateMmPerDay: Number(body.distractionRateMmPerDay) || 1.0,
            phase: body.phase || 'pre-op',
            doctor: body.doctor || '',
            hospital: body.hospital || '',
            notes: body.notes || '',
            createdAt: now,
            updatedAt: now,
        };

        await store.setJSON(id, patient);

        return new Response(JSON.stringify(patient), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error creating patient:', error);
        return new Response(JSON.stringify({ error: 'Hasta oluşturulamadı' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
