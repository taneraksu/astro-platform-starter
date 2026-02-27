import { useState } from 'react';

const SURGERY_TYPES = ['Ilizarov', 'LON', 'PRECICE', 'Holyfix', 'Other'];
const BONE_TYPES = [
    { value: 'femur', label: 'Femur' },
    { value: 'tibia', label: 'Tibia' },
    { value: 'both', label: 'Femur + Tibia' },
    { value: 'humerus', label: 'Humerus' },
];
const PHASES = [
    { value: 'pre-op', label: 'Pre-op (Ameliyat Öncesi)' },
    { value: 'latency', label: 'Latent Faz' },
    { value: 'distraction', label: 'Distraksiyon Fazı' },
    { value: 'consolidation', label: 'Konsolidasyon Fazı' },
    { value: 'rehabilitation', label: 'Rehabilitasyon' },
    { value: 'completed', label: 'Tamamlandı' },
];

interface FormData {
    name: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    email: string;
    initialHeightCm: string;
    targetHeightCm: string;
    targetLengtheningMm: string;
    surgeryDate: string;
    surgeryType: string;
    bone: string;
    distractionRateMmPerDay: string;
    phase: string;
    doctor: string;
    hospital: string;
    notes: string;
}

export default function PatientForm() {
    const [form, setForm] = useState<FormData>({
        name: '',
        dateOfBirth: '',
        gender: 'male',
        phone: '',
        email: '',
        initialHeightCm: '',
        targetHeightCm: '',
        targetLengtheningMm: '',
        surgeryDate: '',
        surgeryType: 'PRECICE',
        bone: 'femur',
        distractionRateMmPerDay: '1.0',
        phase: 'pre-op',
        doctor: '',
        hospital: '',
        notes: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        // Auto-calculate target lengthening
        if (name === 'initialHeightCm' || name === 'targetHeightCm') {
            const initial = name === 'initialHeightCm' ? Number(value) : Number(form.initialHeightCm);
            const target = name === 'targetHeightCm' ? Number(value) : Number(form.targetHeightCm);
            if (initial && target && target > initial) {
                setForm((prev) => ({
                    ...prev,
                    [name]: value,
                    targetLengtheningMm: String(Math.round((target - initial) * 10)),
                }));
                return;
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Hata oluştu');
                return;
            }

            const patient = await res.json();
            window.location.href = `/patients/${patient.id}`;
        } catch (err) {
            setError('Ağ hatası oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    const fieldClass = 'bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary w-full';
    const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-200">
                    {error}
                </div>
            )}

            {/* Personal Info */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                    <span className="text-primary">01</span> Kişisel Bilgiler
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label className={labelClass}>Ad Soyad *</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Ahmet Yılmaz" className={fieldClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Doğum Tarihi *</label>
                        <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required className={fieldClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Cinsiyet</label>
                        <select name="gender" value={form.gender} onChange={handleChange} className={fieldClass}>
                            <option value="male">Erkek</option>
                            <option value="female">Kadın</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Telefon</label>
                        <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+90 555 123 4567" className={fieldClass} />
                    </div>
                    <div>
                        <label className={labelClass}>E-posta</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="ornek@email.com" className={fieldClass} />
                    </div>
                </div>
            </div>

            {/* Height Info */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                    <span className="text-primary">02</span> Boy Bilgileri
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div>
                        <label className={labelClass}>Mevcut Boy (cm) *</label>
                        <input type="number" name="initialHeightCm" value={form.initialHeightCm} onChange={handleChange} required placeholder="165" min="100" max="220" step="0.1" className={fieldClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Hedef Boy (cm) *</label>
                        <input type="number" name="targetHeightCm" value={form.targetHeightCm} onChange={handleChange} required placeholder="175" min="100" max="230" step="0.1" className={fieldClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Hedef Uzama (mm)</label>
                        <input type="number" name="targetLengtheningMm" value={form.targetLengtheningMm} onChange={handleChange} required placeholder="60" min="10" max="200" className={fieldClass} />
                        <p className="text-xs text-gray-500 mt-1">Boy farkından otomatik hesaplanır</p>
                    </div>
                </div>
            </div>

            {/* Surgery Info */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                    <span className="text-primary">03</span> Ameliyat Bilgileri
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>Ameliyat Tarihi *</label>
                        <input type="date" name="surgeryDate" value={form.surgeryDate} onChange={handleChange} required className={fieldClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Ameliyat Yöntemi</label>
                        <select name="surgeryType" value={form.surgeryType} onChange={handleChange} className={fieldClass}>
                            {SURGERY_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Kemik</label>
                        <select name="bone" value={form.bone} onChange={handleChange} className={fieldClass}>
                            {BONE_TYPES.map((b) => (
                                <option key={b.value} value={b.value}>{b.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Distraksiyon Hızı (mm/gün)</label>
                        <input type="number" name="distractionRateMmPerDay" value={form.distractionRateMmPerDay} onChange={handleChange} placeholder="1.0" min="0.25" max="2" step="0.25" className={fieldClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Mevcut Faz</label>
                        <select name="phase" value={form.phase} onChange={handleChange} className={fieldClass}>
                            {PHASES.map((p) => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Doctor Info */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                    <span className="text-primary">04</span> Doktor ve Hastane
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>Sorumlu Doktor</label>
                        <input type="text" name="doctor" value={form.doctor} onChange={handleChange} placeholder="Prof. Dr. Ali Kaya" className={fieldClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Hastane / Klinik</label>
                        <input type="text" name="hospital" value={form.hospital} onChange={handleChange} placeholder="Ankara Şehir Hastanesi" className={fieldClass} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className={labelClass}>Ek Notlar</label>
                        <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Ek bilgiler, medikal geçmiş vb." className={`${fieldClass} resize-none`} />
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button type="submit" disabled={submitting} className="btn btn-lg flex-1">
                    {submitting ? 'Kaydediliyor...' : 'Hasta Kaydet'}
                </button>
                <a href="/patients" className="btn btn-lg bg-gray-700 hover:bg-gray-600 text-white">
                    İptal
                </a>
            </div>
        </form>
    );
}
