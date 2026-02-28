import { useState } from 'react';

interface Props {
    patientId: string;
    currentMm: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function MeasurementForm({ patientId, currentMm, onSuccess, onCancel }: Props) {
    const today = new Date().toISOString().split('T')[0];
    const [form, setForm] = useState({
        date: today,
        heightCm: '',
        lengtheningMm: String(currentMm),
        painLevel: '3',
        mobilityScore: '6',
        xrayTaken: false,
        xrayDate: '',
        callus: '',
        notes: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/measurements', {
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
                    <label className={labelClass}>Ölçüm Tarihi *</label>
                    <input type="date" name="date" value={form.date} onChange={handleChange} required className={fieldClass} />
                </div>
                <div>
                    <label className={labelClass}>Boy (cm) *</label>
                    <input type="number" name="heightCm" value={form.heightCm} onChange={handleChange} required placeholder="167.5" min="100" max="230" step="0.1" className={fieldClass} />
                </div>
                <div>
                    <label className={labelClass}>Toplam Uzama (mm) *</label>
                    <input type="number" name="lengtheningMm" value={form.lengtheningMm} onChange={handleChange} required placeholder="12.5" min="0" max="200" step="0.5" className={fieldClass} />
                </div>
                <div>
                    <label className={labelClass}>Ağrı Seviyesi (0-10)</label>
                    <input type="range" name="painLevel" value={form.painLevel} onChange={handleChange} min="0" max="10" className="w-full accent-primary mt-2" />
                    <div className="text-center text-white text-sm mt-1">{form.painLevel}/10</div>
                </div>
                <div>
                    <label className={labelClass}>Hareket Puanı (0-10)</label>
                    <input type="range" name="mobilityScore" value={form.mobilityScore} onChange={handleChange} min="0" max="10" className="w-full accent-blue-400 mt-2" />
                    <div className="text-center text-white text-sm mt-1">{form.mobilityScore}/10</div>
                </div>
                <div>
                    <label className={labelClass}>Kalus Kalitesi</label>
                    <select name="callus" value={form.callus} onChange={handleChange} className={fieldClass}>
                        <option value="">Seçin</option>
                        <option value="none">Yok</option>
                        <option value="minimal">Minimal</option>
                        <option value="moderate">Orta</option>
                        <option value="good">İyi</option>
                        <option value="excellent">Mükemmel</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <input type="checkbox" name="xrayTaken" id="xray" checked={form.xrayTaken} onChange={handleChange} className="w-4 h-4 accent-primary" />
                <label htmlFor="xray" className="text-sm text-gray-300">Röntgen çekildi</label>
                {form.xrayTaken && (
                    <input type="date" name="xrayDate" value={form.xrayDate} onChange={handleChange} className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary" />
                )}
            </div>

            <div>
                <label className={labelClass}>Notlar</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Gözlemler, şikayetler..." className={`${fieldClass} resize-none`} />
            </div>

            <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn flex-1">
                    {submitting ? 'Kaydediliyor...' : 'Ölçüm Kaydet'}
                </button>
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                    İptal
                </button>
            </div>
        </form>
    );
}
