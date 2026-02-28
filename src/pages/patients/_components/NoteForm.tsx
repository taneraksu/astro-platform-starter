import { useState } from 'react';

interface Props {
    patientId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const NOTE_TYPES = [
    { value: 'general', label: 'Genel Not', icon: '📝' },
    { value: 'complication', label: 'Komplikasyon', icon: '⚠️' },
    { value: 'xray', label: 'Röntgen Raporu', icon: '🩻' },
    { value: 'appointment', label: 'Randevu', icon: '📅' },
    { value: 'physical_therapy', label: 'Fizik Tedavi', icon: '🏃' },
];

export default function NoteForm({ patientId, onSuccess, onCancel }: Props) {
    const today = new Date().toISOString().split('T')[0];
    const [form, setForm] = useState({
        date: today,
        type: 'general',
        title: '',
        content: '',
        createdBy: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, patientId }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Hata oluştu');
                return;
            }

            onSuccess();
        } catch (err) {
            setError('Ağ hatası oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    const fieldClass = 'bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary w-full text-sm';
    const labelClass = 'block text-xs font-medium text-gray-400 mb-1';

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-red-200 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Tarih *</label>
                    <input type="date" name="date" value={form.date} onChange={handleChange} required className={fieldClass} />
                </div>
                <div>
                    <label className={labelClass}>Not Türü</label>
                    <select name="type" value={form.type} onChange={handleChange} className={fieldClass}>
                        {NOTE_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className={labelClass}>Başlık *</label>
                <input type="text" name="title" value={form.title} onChange={handleChange} required placeholder="Not başlığı" className={fieldClass} />
            </div>

            <div>
                <label className={labelClass}>İçerik *</label>
                <textarea name="content" value={form.content} onChange={handleChange} required rows={5} placeholder="Not içeriği..." className={`${fieldClass} resize-none`} />
            </div>

            <div>
                <label className={labelClass}>Yazan</label>
                <input type="text" name="createdBy" value={form.createdBy} onChange={handleChange} placeholder="Dr. Ad Soyad" className={fieldClass} />
            </div>

            <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn flex-1">
                    {submitting ? 'Kaydediliyor...' : 'Not Kaydet'}
                </button>
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                    İptal
                </button>
            </div>
        </form>
    );
}
