import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';
import type { PatientNote } from '../../types/patient';

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

        const store = getStore('patient-notes');
        const { blobs } = await store.list();

        const notes: PatientNote[] = [];
        for (const blob of blobs) {
            if (blob.key.startsWith(`${patientId}-`)) {
                const data = await store.get(blob.key, { type: 'json' });
                if (data) {
                    notes.push(data as PatientNote);
                }
            }
        }

        notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return new Response(JSON.stringify(notes), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching notes:', error);
        return new Response(JSON.stringify({ error: 'Notlar yüklenemedi' }), {
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

        const store = getStore('patient-notes');
        const id = generateId();
        const now = new Date().toISOString();

        const note: PatientNote = {
            id,
            patientId: body.patientId,
            date: body.date || now.split('T')[0],
            type: body.type || 'general',
            title: body.title || '',
            content: body.content || '',
            createdBy: body.createdBy || 'Doktor',
            createdAt: now,
        };

        const key = `${body.patientId}-${id}`;
        await store.setJSON(key, note);

        return new Response(JSON.stringify(note), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error creating note:', error);
        return new Response(JSON.stringify({ error: 'Not oluşturulamadı' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const DELETE: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const patientId = url.searchParams.get('patientId');
        const noteId = url.searchParams.get('noteId');

        if (!patientId || !noteId) {
            return new Response(JSON.stringify({ error: 'patientId ve noteId gerekli' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const store = getStore('patient-notes');
        const key = `${patientId}-${noteId}`;
        await store.delete(key);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error deleting note:', error);
        return new Response(JSON.stringify({ error: 'Not silinemedi' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
