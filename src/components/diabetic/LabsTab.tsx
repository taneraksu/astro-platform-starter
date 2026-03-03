import { useState, useEffect } from 'react';

interface Props { patientId: string; doctorId: string; }

const s = {
    card: { background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1rem' } as React.CSSProperties,
    label: { display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.3rem', fontSize: '0.9rem' } as React.CSSProperties,
    inp: { width: '100%', padding: '0.625rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.95rem', boxSizing: 'border-box' as const, marginBottom: '0.625rem' },
    th: { background: '#f8fafc', padding: '0.625rem 0.875rem', textAlign: 'left' as const, fontSize: '0.82rem', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '0.625rem 0.875rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' } as React.CSSProperties,
    sTitle: { fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.875rem', paddingBottom: '0.4rem', borderBottom: '2px solid #e2e8f0' } as React.CSSProperties,
    col3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.75rem' } as React.CSSProperties,
    saveBtn: { width: '100%', padding: '0.875rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' } as React.CSSProperties,
};

const EMPTY = {
    testDate: new Date().toISOString().split('T')[0],
    wbc: '', wbcDiff: '', hgb: '', plt: '',
    crp: '', esr: '', procalcitonin: '',
    creatinine: '', egfr: '', bun: '',
    hba1c: '', fastingGlucose: '',
    imagingOrdered: '', imagingResults: '', notes: '',
};

function flagColor(val: number | undefined, low: number, high: number) {
    if (val === undefined) return '#374151';
    if (val < low || val > high) return '#dc2626';
    return '#16a34a';
}

function LabField({ label, value, onChange, unit, min, max }: { label: string; value: string; onChange: (v: string) => void; unit: string; min?: number; max?: number }) {
    const num = parseFloat(value);
    const isAbnormal = value && min !== undefined && max !== undefined && (num < min || num > max);
    return (
        <div>
            <label style={{ ...s.label, color: isAbnormal ? '#dc2626' : '#374151' }}>{label} {unit && <span style={{ fontWeight: 400, color: '#94a3b8' }}>({unit})</span>}{isAbnormal && ' ⚠️'}</label>
            <input style={{ ...s.inp, borderColor: isAbnormal ? '#fca5a5' : '#e2e8f0', color: isAbnormal ? '#dc2626' : undefined }} type="number" step="0.01" value={value} onChange={e => onChange(e.target.value)} placeholder="—" />
        </div>
    );
}

export default function LabsTab({ patientId, doctorId }: Props) {
    const [form, setForm] = useState<any>(EMPTY);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetch(`/api/lab-testler?patientId=${patientId}`)
            .then(r => r.json())
            .then(d => setHistory(Array.isArray(d) ? d : []))
            .finally(() => setLoading(false));
    }, [patientId]);

    function set(key: string, value: any) {
        setForm((p: any) => ({ ...p, [key]: value }));
    }

    async function handleSave() {
        setSaving(true); setError(''); setSaved(false);
        try {
            const payload: any = { ...form, patientId, doctorId };
            // Convert string values to numbers where applicable
            const numKeys = ['wbc','hgb','plt','crp','esr','procalcitonin','creatinine','egfr','bun','hba1c','fastingGlucose'];
            numKeys.forEach(k => { if (payload[k] !== '') payload[k] = parseFloat(payload[k]); else delete payload[k]; });
            const res = await fetch('/api/lab-testler', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) { const d = await res.json(); setError(d.error); return; }
            const saved_rec = await res.json();
            setHistory([saved_rec, ...history]);
            setSaved(true);
            setShowForm(false);
            setForm({ ...EMPTY, testDate: new Date().toISOString().split('T')[0] });
            setTimeout(() => setSaved(false), 2500);
        } catch { setError('Sunucu hatası.'); }
        finally { setSaving(false); }
    }

    const fmt = (v: any) => v !== undefined && v !== null && v !== '' ? String(v) : '—';
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    if (loading) return <p style={{ color: '#94a3b8', padding: '1rem' }}>Yükleniyor...</p>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Tetkik Kayıtları ({history.length})</h2>
                <button style={{ background: '#7c3aed', color: 'white', border: 'none', borderRadius: '0.625rem', padding: '0.625rem 1rem', cursor: 'pointer', fontWeight: 700 }} onClick={() => { setShowForm(true); setSaved(false); setError(''); }}>+ Yeni Tetkik</button>
            </div>

            {saved && <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '0.5rem', padding: '0.75rem', color: '#15803d', marginBottom: '1rem' }}>✓ Tetkik kaydedildi</div>}

            {/* History table */}
            {!showForm && history.length > 0 && (
                <div style={s.card}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: '0.88rem' }}>
                            <thead>
                                <tr>
                                    {['Tarih','WBC','HGB','CRP','ESR','Kreatinin','eGFR','HbA1c','Açlık Glukoz'].map(h => <th key={h} style={s.th}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((r: any) => (
                                    <tr key={r.id}>
                                        <td style={{ ...s.td, fontWeight: 700, color: '#1e3a8a' }}>{fmtDate(r.testDate)}</td>
                                        <td style={{ ...s.td, color: r.wbc !== undefined && (r.wbc < 4 || r.wbc > 11) ? '#dc2626' : undefined }}>{fmt(r.wbc)}</td>
                                        <td style={{ ...s.td, color: r.hgb !== undefined && r.hgb < 12 ? '#dc2626' : undefined }}>{fmt(r.hgb)}</td>
                                        <td style={{ ...s.td, color: r.crp !== undefined && r.crp > 10 ? '#dc2626' : undefined }}>{fmt(r.crp)}</td>
                                        <td style={s.td}>{fmt(r.esr)}</td>
                                        <td style={{ ...s.td, color: r.creatinine !== undefined && r.creatinine > 1.3 ? '#dc2626' : undefined }}>{fmt(r.creatinine)}</td>
                                        <td style={{ ...s.td, color: r.egfr !== undefined && r.egfr < 60 ? '#dc2626' : undefined }}>{fmt(r.egfr)}</td>
                                        <td style={{ ...s.td, color: r.hba1c !== undefined && r.hba1c > 7 ? '#dc2626' : undefined }}>{fmt(r.hba1c)}</td>
                                        <td style={{ ...s.td, color: r.fastingGlucose !== undefined && r.fastingGlucose > 126 ? '#dc2626' : undefined }}>{fmt(r.fastingGlucose)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {history.some((r: any) => r.imagingOrdered || r.imagingResults) && (
                        <div style={{ marginTop: '1rem' }}>
                            {history.filter((r: any) => r.imagingOrdered || r.imagingResults).map((r: any) => (
                                <div key={`img-${r.id}`} style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                                    <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{fmtDate(r.testDate)}</span>
                                    {r.imagingOrdered && <p style={{ color: '#374151', marginTop: '0.25rem' }}>🔬 İstenen: {r.imagingOrdered}</p>}
                                    {r.imagingResults && <p style={{ color: '#374151', marginTop: '0.25rem' }}>📋 Sonuç: {r.imagingResults}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {history.length === 0 && !showForm && (
                <div style={{ ...s.card, textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                    <p>Henüz tetkik kaydı yok.</p>
                </div>
            )}

            {/* Form */}
            {showForm && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontWeight: 800, color: '#7c3aed', margin: 0 }}>Yeni Tetkik Sonuçları</h3>
                        <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowForm(false)}>✕</button>
                    </div>

                    <div style={s.card}>
                        <p style={s.sTitle}>Tetkik Tarihi</p>
                        <input style={{ ...s.inp, maxWidth: '200px' }} type="date" value={form.testDate} onChange={e => set('testDate', e.target.value)} />
                    </div>

                    <div style={s.card}>
                        <p style={s.sTitle}>Hemogram</p>
                        <div style={s.col3}>
                            <LabField label="WBC" unit="x10³/µL" min={4} max={11} value={form.wbc} onChange={v => set('wbc', v)} />
                            <LabField label="HGB" unit="g/dL" min={12} max={18} value={form.hgb} onChange={v => set('hgb', v)} />
                            <LabField label="PLT" unit="x10³/µL" min={150} max={400} value={form.plt} onChange={v => set('plt', v)} />
                        </div>
                        <div>
                            <label style={s.label}>WBC Diferansiyel</label>
                            <input style={s.inp} value={form.wbcDiff} onChange={e => set('wbcDiff', e.target.value)} placeholder="örn. Nötrofil %80, Lenfosit %15..." />
                        </div>
                    </div>

                    <div style={s.card}>
                        <p style={s.sTitle}>İnflamasyon Belirteçleri</p>
                        <div style={s.col3}>
                            <LabField label="CRP" unit="mg/L" min={0} max={10} value={form.crp} onChange={v => set('crp', v)} />
                            <LabField label="ESR" unit="mm/saat" min={0} max={30} value={form.esr} onChange={v => set('esr', v)} />
                            <LabField label="Prokalsitonin" unit="ng/mL" min={0} max={0.5} value={form.procalcitonin} onChange={v => set('procalcitonin', v)} />
                        </div>
                    </div>

                    <div style={s.card}>
                        <p style={s.sTitle}>Böbrek Fonksiyonları</p>
                        <div style={s.col3}>
                            <LabField label="Kreatinin" unit="mg/dL" min={0.5} max={1.3} value={form.creatinine} onChange={v => set('creatinine', v)} />
                            <LabField label="eGFR" unit="mL/dk/1.73m²" min={60} max={120} value={form.egfr} onChange={v => set('egfr', v)} />
                            <LabField label="BUN" unit="mg/dL" min={7} max={25} value={form.bun} onChange={v => set('bun', v)} />
                        </div>
                    </div>

                    <div style={s.card}>
                        <p style={s.sTitle}>Glikemik Kontrol</p>
                        <div style={s.col3}>
                            <LabField label="HbA1c" unit="%" min={0} max={7} value={form.hba1c} onChange={v => set('hba1c', v)} />
                            <LabField label="Açlık Glukozu" unit="mg/dL" min={70} max={126} value={form.fastingGlucose} onChange={v => set('fastingGlucose', v)} />
                        </div>
                    </div>

                    <div style={s.card}>
                        <p style={s.sTitle}>Görüntüleme</p>
                        <label style={s.label}>İstenen Görüntüleme</label>
                        <input style={s.inp} value={form.imagingOrdered} onChange={e => set('imagingOrdered', e.target.value)} placeholder="örn. Direkt grafi, MR (osteomiyelit?), DUS..." />
                        <label style={s.label}>Görüntüleme Sonucu</label>
                        <textarea style={{ ...s.inp, minHeight: '70px', resize: 'vertical' }} value={form.imagingResults} onChange={e => set('imagingResults', e.target.value)} placeholder="Görüntüleme bulgularını yazın..." />
                    </div>

                    <div style={s.card}>
                        <label style={s.label}>Notlar</label>
                        <textarea style={{ ...s.inp, minHeight: '60px', resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Ek notlar..." />
                    </div>

                    {error && <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem', color: '#b91c1c', marginBottom: '1rem' }}>{error}</div>}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button style={{ flex: 1, padding: '0.875rem', background: '#f1f5f9', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600 }} onClick={() => setShowForm(false)}>İptal</button>
                        <button style={{ flex: 3, ...s.saveBtn }} onClick={handleSave} disabled={saving}>{saving ? 'Kaydediliyor...' : '🧪 Tetkikleri Kaydet'}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
