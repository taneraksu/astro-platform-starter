import { useState, useEffect } from 'react';

const MEASUREMENT_TYPES = [
    { value: 'fasting', label: 'Açken (Sabah)' },
    { value: 'postprandial', label: 'Yemek Sonrası' },
    { value: 'random', label: 'Rastgele' },
];

export default function BloodSugarForm() {
    const [patientId, setPatientId] = useState('');
    const [doctorId, setDoctorId] = useState('');
    const [datetime, setDatetime] = useState('');
    const [value, setValue] = useState('');
    const [measurementType, setMeasurementType] = useState('fasting');
    const [insulinUsed, setInsulinUsed] = useState(false);
    const [insulinType, setInsulinType] = useState('');
    const [dose, setDose] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const session = localStorage.getItem('patientSession');
        if (!session) { window.location.href = '/hasta/giris'; return; }
        const p = JSON.parse(session);
        setPatientId(p.id);
        setDoctorId(p.doctorId);
        // Set current datetime
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setDatetime(now.toISOString().slice(0, 16));
    }, []);

    const glucoseWarning = () => {
        const v = parseInt(value);
        if (!v) return null;
        if (v > 300) return { msg: '⚠️ Kan şekeriniz çok yüksek! Lütfen doktorunuzu arayın.', color: '#dc2626' };
        if (v > 200) return { msg: 'Kan şekeriniz yüksek. Doktorunuzu bilgilendirin.', color: '#ea580c' };
        if (v < 70) return { msg: '⚠️ Kan şekeriniz düşük! Hemen bir şeyler yiyin ve doktorunuzu arayın.', color: '#dc2626' };
        return null;
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/kan-sekeri', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId, value: parseInt(value), measurementType, insulinUsed, insulinType, dose: dose ? parseFloat(dose) : undefined, notes, datetime })
            });
            if (!res.ok) { const d = await res.json(); setError(d.error); return; }
            setSaved(true);
        } catch { setError('Bağlantı hatası.'); }
        finally { setLoading(false); }
    }

    const s = {
        page: { minHeight: '100vh', background: '#f0f7ff', fontFamily: 'Inter,system-ui,sans-serif' },
        header: { background: '#1d4ed8', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' },
        body: { padding: '1.5rem', maxWidth: '26rem', margin: '0 auto' },
        card: { background: 'white', borderRadius: '1.25rem', padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginBottom: '1rem' },
        label: { display: 'block', fontSize: '1.05rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' } as React.CSSProperties,
        input: { width: '100%', padding: '0.9rem 1rem', border: '2px solid #e2e8f0', borderRadius: '0.75rem', fontSize: '1.1rem', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '1.25rem' },
        bigInput: { width: '100%', padding: '1rem', border: '3px solid #1d4ed8', borderRadius: '0.875rem', fontSize: '2.5rem', fontWeight: 800, textAlign: 'center' as const, color: '#1d4ed8', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '0.5rem' },
        typeBtn: (active: boolean) => ({ flex: 1, padding: '0.875rem 0.5rem', border: `2px solid ${active ? '#1d4ed8' : '#e2e8f0'}`, background: active ? '#eff6ff' : 'white', color: active ? '#1d4ed8' : '#64748b', borderRadius: '0.625rem', cursor: 'pointer', fontSize: '0.95rem', fontWeight: active ? 700 : 400, transition: 'all 0.15s' }) as React.CSSProperties,
        submitBtn: { width: '100%', padding: '1.25rem', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '1rem', fontSize: '1.35rem', fontWeight: 800, cursor: 'pointer' } as React.CSSProperties,
        toggleRow: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' },
    };

    if (saved) {
        return (
            <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✅</div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a', marginBottom: '0.5rem' }}>Kaydedildi ✓</h2>
                    <p style={{ color: '#64748b', fontSize: '1.15rem', marginBottom: '2rem' }}>Kan şekeri değeriniz başarıyla kaydedildi.</p>
                    {glucoseWarning() && (
                        <div style={{ background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: '1rem', padding: '1rem', marginBottom: '1.5rem', color: '#dc2626', fontSize: '1.05rem' }}>
                            {glucoseWarning()!.msg}
                        </div>
                    )}
                    <a href="/hasta" style={{ display: 'block', background: '#1d4ed8', color: 'white', borderRadius: '1rem', padding: '1rem', textDecoration: 'none', fontWeight: 800, fontSize: '1.2rem' }}>
                        Ana Ekrana Dön
                    </a>
                </div>
            </div>
        );
    }

    const warning = glucoseWarning();

    return (
        <div style={s.page}>
            <div style={s.header}>
                <a href="/hasta" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem' }}>←</a>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>🩸 Kan Şekeri Gir</h1>
            </div>

            <div style={s.body}>
                {error && <div style={{ background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: '0.75rem', padding: '1rem', color: '#dc2626', marginBottom: '1rem', fontSize: '1.05rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Value */}
                    <div style={s.card}>
                        <label style={{ ...s.label, fontSize: '1.15rem' }}>Kan Şekeri Değeri (mg/dL)</label>
                        <input
                            style={s.bigInput}
                            type="number"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            min={20} max={800}
                            placeholder="120"
                            required
                        />
                        {warning && <div style={{ color: warning.color, fontSize: '1rem', fontWeight: 600, textAlign: 'center', marginBottom: '0.5rem' }}>{warning.msg}</div>}
                    </div>

                    {/* Measurement type */}
                    <div style={s.card}>
                        <label style={s.label}>Ne Zaman Ölçtünüz?</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {MEASUREMENT_TYPES.map(t => (
                                <button key={t.value} type="button" style={s.typeBtn(measurementType === t.value)} onClick={() => setMeasurementType(t.value)}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Insulin */}
                    <div style={s.card}>
                        <div style={s.toggleRow}>
                            <label style={{ ...s.label, marginBottom: 0, flex: 1 }}>İnsülin Kullandınız Mı?</label>
                            <button type="button" onClick={() => setInsulinUsed(!insulinUsed)} style={{ background: insulinUsed ? '#1d4ed8' : '#e2e8f0', border: 'none', borderRadius: '999px', width: '3.5rem', height: '2rem', cursor: 'pointer', transition: 'background 0.2s', position: 'relative' }}>
                                <span style={{ position: 'absolute', top: '0.2rem', left: insulinUsed ? '1.6rem' : '0.2rem', width: '1.6rem', height: '1.6rem', background: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                            </button>
                        </div>
                        {insulinUsed && (
                            <>
                                <label style={s.label}>İnsülin Türü</label>
                                <input style={s.input} value={insulinType} onChange={e => setInsulinType(e.target.value)} placeholder="Örn: Lantus, NovoRapid..." />
                                <label style={s.label}>Doz (ünite)</label>
                                <input style={s.input} type="number" value={dose} onChange={e => setDose(e.target.value)} placeholder="10" min={0} step={0.5} />
                            </>
                        )}
                    </div>

                    {/* Datetime & notes */}
                    <div style={s.card}>
                        <label style={s.label}>Tarih / Saat</label>
                        <input style={s.input} type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} />
                        <label style={s.label}>Notlar (opsiyonel)</label>
                        <textarea style={{ ...s.input, minHeight: '80px', resize: 'vertical' as const }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ek notlarınız..." />
                    </div>

                    <button style={s.submitBtn} type="submit" disabled={loading}>
                        {loading ? 'Kaydediliyor...' : '💾 Kaydet'}
                    </button>
                </form>
            </div>
        </div>
    );
}
