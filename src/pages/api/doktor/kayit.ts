import type { APIRoute } from 'astro';
import { getDoctorByEmail, saveDoctor } from '../../../utils/storage';
import { hashPassword } from '../../../utils/codeGenerator';
import { randomUUID } from 'crypto';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { email, password, clinicName, phone } = await request.json();
        if (!email || !password || !clinicName) {
            return new Response(JSON.stringify({ error: 'Tüm alanlar zorunludur.' }), { status: 400 });
        }

        const existing = await getDoctorByEmail(email);
        if (existing) {
            return new Response(JSON.stringify({ error: 'Bu e-posta zaten kayıtlı.' }), { status: 409 });
        }

        const passwordHash = await hashPassword(password);
        const doctor = {
            id: randomUUID(),
            email: email.toLowerCase().trim(),
            passwordHash,
            clinicName,
            phone: phone ?? '',
            createdAt: new Date().toISOString()
        };

        await saveDoctor(doctor);

        return new Response(JSON.stringify({
            id: doctor.id,
            email: doctor.email,
            clinicName: doctor.clinicName
        }), { status: 201 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), { status: 500 });
    }
};
