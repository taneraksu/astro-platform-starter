import type { APIRoute } from 'astro';
import { getPatientByCode, getDoctorById } from '../../../utils/storage';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { code } = await request.json();
        if (!code) return new Response(JSON.stringify({ error: 'Kod gerekli.' }), { status: 400 });

        const patient = await getPatientByCode(code.trim());
        if (!patient) {
            return new Response(JSON.stringify({ error: 'Kod bulunamadı. Lütfen doktorunuzu arayın.' }), { status: 404 });
        }

        const doctor = await getDoctorById(patient.doctorId);

        return new Response(JSON.stringify({
            patient: {
                id: patient.id,
                name: patient.name,
                accessCode: patient.accessCode,
                doctorId: patient.doctorId
            },
            doctor: doctor ? {
                clinicName: doctor.clinicName,
                phone: doctor.phone,
                email: doctor.email
            } : null
        }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};
