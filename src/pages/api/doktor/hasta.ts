import type { APIRoute } from 'astro';
import {
    getPatientById,
    getGlucoseEntries,
    getWoundEntries,
    getProcedures,
    getMessages,
    getVascularEntries,
    getOsteomyelitisEntries,
    getHBOSessions
} from '../../../utils/storage';

// GET /api/doktor/hasta?id=xxx — full patient detail
export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        if (!id) return new Response(JSON.stringify({ error: 'id gerekli.' }), { status: 400 });

        const patient = await getPatientById(id);
        if (!patient) return new Response(JSON.stringify({ error: 'Hasta bulunamadı.' }), { status: 404 });

        const [glucoseEntries, woundEntries, procedures, messages, vascularEntries, osteomyelitisEntries, hboSessions] = await Promise.all([
            getGlucoseEntries(id),
            getWoundEntries(id),
            getProcedures(id),
            getMessages(id),
            getVascularEntries(id),
            getOsteomyelitisEntries(id),
            getHBOSessions(id)
        ]);

        return new Response(JSON.stringify({
            patient,
            glucoseEntries,
            woundEntries,
            procedures,
            messages,
            vascularEntries,
            osteomyelitisEntries,
            hboSessions
        }), { status: 200 });
    } catch {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};
