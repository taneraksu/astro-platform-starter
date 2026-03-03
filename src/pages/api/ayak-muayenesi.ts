import type { APIRoute } from 'astro';
import { getFootExams, saveFootExam } from '../../utils/storage';
import { randomUUID } from 'crypto';

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const patientId = url.searchParams.get('patientId');
        if (!patientId) return new Response(JSON.stringify({ error: 'patientId gerekli.' }), { status: 400 });
        const exams = await getFootExams(patientId);
        return new Response(JSON.stringify(exams), { status: 200 });
    } catch {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { patientId, doctorId, examDate } = body;
        if (!patientId || !doctorId || !examDate) {
            return new Response(JSON.stringify({ error: 'patientId, doctorId ve examDate gerekli.' }), { status: 400 });
        }
        const exam = {
            ...body,
            id: body.id ?? randomUUID(),
            createdAt: body.createdAt ?? new Date().toISOString(),
        };
        await saveFootExam(exam);
        return new Response(JSON.stringify(exam), { status: 200 });
    } catch {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};
