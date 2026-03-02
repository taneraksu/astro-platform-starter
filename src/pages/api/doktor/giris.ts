import type { APIRoute } from 'astro';
import { getDoctorByEmail } from '../../../utils/storage';
import { verifyPassword } from '../../../utils/codeGenerator';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return new Response(JSON.stringify({ error: 'E-posta ve şifre gerekli.' }), { status: 400 });
        }

        const doctor = await getDoctorByEmail(email);
        if (!doctor) {
            return new Response(JSON.stringify({ error: 'E-posta veya şifre hatalı.' }), { status: 401 });
        }

        const valid = await verifyPassword(password, doctor.passwordHash);
        if (!valid) {
            return new Response(JSON.stringify({ error: 'E-posta veya şifre hatalı.' }), { status: 401 });
        }

        return new Response(JSON.stringify({
            id: doctor.id,
            email: doctor.email,
            clinicName: doctor.clinicName,
            phone: doctor.phone
        }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};
