import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';
import type { Patient } from '../../types/patient';

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new Response(JSON.stringify({ error: 'ID gerekli' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const store = getStore('patients');
        const patient = await store.get(id, { type: 'json' });

        if (!patient) {
            return new Response(JSON.stringify({ error: 'Hasta bulunamadı' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify(patient), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching patient:', error);
        return new Response(JSON.stringify({ error: 'Hasta yüklenemedi' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const PUT: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new Response(JSON.stringify({ error: 'ID gerekli' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const store = getStore('patients');
        const existing = await store.get(id, { type: 'json' }) as Patient | null;

        if (!existing) {
            return new Response(JSON.stringify({ error: 'Hasta bulunamadı' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const body = await request.json();
        const updated: Patient = {
            ...existing,
            ...body,
            id,
            updatedAt: new Date().toISOString(),
        };

        await store.setJSON(id, updated);

        return new Response(JSON.stringify(updated), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating patient:', error);
        return new Response(JSON.stringify({ error: 'Hasta güncellenemedi' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const DELETE: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new Response(JSON.stringify({ error: 'ID gerekli' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const store = getStore('patients');
        await store.delete(id);

        // Also delete related measurements and notes
        const measurementsStore = getStore('measurements');
        const notesStore = getStore('patient-notes');

        const { blobs: measurementBlobs } = await measurementsStore.list();
        for (const blob of measurementBlobs) {
            if (blob.key.startsWith(`${id}-`)) {
                await measurementsStore.delete(blob.key);
            }
        }

        const { blobs: noteBlobs } = await notesStore.list();
        for (const blob of noteBlobs) {
            if (blob.key.startsWith(`${id}-`)) {
                await notesStore.delete(blob.key);
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error deleting patient:', error);
        return new Response(JSON.stringify({ error: 'Hasta silinemedi' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
