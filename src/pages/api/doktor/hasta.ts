import type { APIRoute } from 'astro';
import {
    getPatientById,
    getGlucoseEntries,
    getWoundEntries,
    getProcedures,
    getMessages
} from '../../../utils/storage';

// GET /api/doktor/hasta?id=xxx — full patient detail
export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        if (!id) return new Response(JSON.stringify({ error: 'id gerekli.' }), { status: 400 });

        const patient = await getPatientById(id);
        if (!patient) return new Response(JSON.stringify({ error: 'Hasta bulunamadı.' }), { status: 404 });

        const [glucoseEntries, woundEntries, procedures, messages] = await Promise.all([
            getGlucoseEntries(id),
            getWoundEntries(id),
            getProcedures(id),
            getMessages(id)
        ]);

        return new Response(JSON.stringify({
            patient,
            glucoseEntries,
            woundEntries,
            procedures,
            messages
        }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};
