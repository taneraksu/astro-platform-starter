import { useState, useEffect } from 'react';

interface Props { patientId: string; doctorId: string; }

const s = {
    card: { background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1rem' } as React.CSSProperties,
    sTitle: { fontSize: '1rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e2e8f0' } as React.CSSProperties,
    label: { display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.3rem', fontSize: '0.9rem' } as React.CSSProperties,
    inp: { width: '100%', padding: '0.625rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.95rem', boxSizing: 'border-box' as const, marginBottom: '0.625rem' },
    toggle: (on: boolean, color = '#1d4ed8') => ({ padding: '0.45rem 0.85rem', border: `2px solid ${on ? color : '#e2e8f0'}`, background: on ? `${color}15` : 'white', color: on ? color : '#64748b', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: on ? 700 : 400, fontSize: '0.85rem', transition: 'all 0.15s' }) as React.CSSProperties,
    twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' } as React.CSSProperties,
    threeCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.75rem' } as React.CSSProperties,
    subLabel: { fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.4rem' } as React.CSSProperties,
    saveBtn: { width: '100%', padding: '0.875rem', background: '#0f766e', color: 'white', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' } as React.CSSProperties,
};

type Pulse = 'palpable' | 'doppler_only' | 'absent';
type Sensation = 'normal' | 'reduced' | 'absent';
type CapRef = 'normal' | 'delayed';
type SkinTemp = 'normal' | 'cool' | 'warm';
type ColorChange = 'normal' | 'pallor' | 'rubor' | 'cyanosis';

const EMPTY = {
    examDate: new Date().toISOString().split('T')[0], examiner: '',
    monofilamentLeft: false, monofilamentLeftPoints: '', monofilamentRight: false, monofilamentRightPoints: '',
    vibrationLeft: 'normal', vibrationRight: 'normal',
    pinprickLeft: 'normal', pinprickRight: 'normal',
    temperatureLeft: 'normal', temperatureRight: 'normal',
    lopsLeft: false, lopsRight: false,
    dpPulseLeft: 'palpable', dpPulseRight: 'palpable',
    ptPulseLeft: 'palpable', ptPulseRight: 'palpable',
    abiLeft: '', abiRight: '', tbiLeft: '', tbiRight: '',
    toePressureLeft: '', toePressureRight: '', tcpo2Left: '', tcpo2Right: '',
    capillaryRefillLeft: 'normal', capillaryRefillRight: 'normal',
    skinTempLeft: 'normal', skinTempRight: 'normal',
    colorChangeLeft: 'normal', colorChangeRight: 'normal',
    // Left foot
    leftCallus: false, leftFissure: false, leftTinea: false, leftOnychomycosis: false,
    leftHalluxValgus: false, leftHammerToes: false, leftCharcotDeformity: false,
    leftPesPlanus: false, leftPesCavus: false, leftAnkleEquinus: false,
    // Right foot
    rightCallus: false, rightFissure: false, rightTinea: false, rightOnychomycosis: false,
    rightHalluxValgus: false, rightHammerToes: false, rightCharcotDeformity: false,
    rightPesPlanus: false, rightPesCavus: false, rightAnkleEquinus: false,
    appropriateFootwear: true, orthosis: false, pressurePointsIdentified: false, footwearNotes: '',
    notes: '',
};

function Tog({ label, value, onChange, color }: { label: string; value: boolean; onChange: (v: boolean) => void; color?: string }) {
    return <button type="button" style={s.toggle(value, color ?? '#1d4ed8')} onClick={() => onChange(!value)}>{value ? '✓' : '○'} {label}</button>;
}

function PulseSelector({ label, value, onChange }: { label: string; value: Pulse; onChange: (v: Pulse) => void }) {
    return (
        <div>
            <p style={s.subLabel}>{label}</p>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' as const }}>
                {([['palpable','Palpe'],['doppler_only','Sadece Doppler'],['absent','Yok']] as [Pulse,string][]).map(([v,l]) => (
                    <button key={v} type="button" style={s.toggle(value === v, v === 'absent' ? '#dc2626' : v === 'doppler_only' ? '#ca8a04' : '#16a34a')} onClick={() => onChange(v)}>{l}</button>
                ))}
            </div>
        </div>
    );
}

function SensationSelector({ label, value, onChange }: { label: string; value: Sensation; onChange: (v: Sensation) => void }) {
    return (
        <div>
            <p style={s.subLabel}>{label}</p>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' as const }}>
                {([['normal','Normal'],['reduced','Azalmış'],['absent','Yok']] as [Sensation,string][]).map(([v,l]) => (
                    <button key={v} type="button" style={s.toggle(value === v, v === 'absent' ? '#dc2626' : v === 'reduced' ? '#ca8a04' : '#16a34a')} onClick={() => onChange(v)}>{l}</button>
                ))}
            </div>
        </div>
    );
}

export default function FootExamTab({ patientId, doctorId }: Props) {
    const [form, setForm] = useState<any>(EMPTY);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetch(`/api/ayak-muayenesi?patientId=${patientId}`)
            .then(r => r.json())
            .then(d => { setHistory(Array.isArray(d) ? d : []); })
            .finally(() => setLoading(false));
    }, [patientId]);

    function set(key: string, value: any) {
        setForm((p: any) => ({ ...p, [key]: value }));
    }

    async function handleSave() {
        setSaving(true); setError(''); setSaved(false);
        try {
            const res = await fetch('/api/ayak-muayenesi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, patientId, doctorId }),
            });
            if (!res.ok) { const d = await res.json(); setError(d.error); return; }
            const saved_rec = await res.json();
            setHistory([saved_rec, ...history]);
            setSaved(true);
            setShowForm(false);
            setTimeout(() => setSaved(false), 2500);
        } catch { setError('Sunucu hatası.'); }
        finally { setSaving(false); }
    }

    function startNew() {
        setForm({ ...EMPTY, examDate: new Date().toISOString().split('T')[0] });
        setShowForm(true);
        setSaved(false); setError('');
    }

    const pulseColor = (v: Pulse) => v === 'palpable' ? '#16a34a' : v === 'doppler_only' ? '#ca8a04' : '#dc2626';
    const pulseLabel = (v: Pulse) => ({ palpable: 'Palpe', doppler_only: 'Doppler', absent: 'Yok' }[v]);

    if (loading) return <p style={{ color: '#94a3b8', padding: '1rem' }}>Yükleniyor...</p>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Ayak Muayenesi Kayıtları ({history.length})</h2>
                <button style={{ background: '#0f766e', color: 'white', border: 'none', borderRadius: '0.625rem', padding: '0.625rem 1rem', cursor: 'pointer', fontWeight: 700 }} onClick={startNew}>+ Yeni Muayene</button>
            </div>

            {saved && <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '0.5rem', padding: '0.75rem', color: '#15803d', marginBottom: '1rem' }}>✓ Muayene kaydedildi</div>}

            {/* History */}
            {!showForm && history.map((exam: any) => (
                <div key={exam.id} style={s.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                            <p style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '1.05rem' }}>
                                {new Date(exam.examDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </p>
                            {exam.examiner && <p style={{ color: '#64748b', fontSize: '0.85rem' }}>👨‍⚕️ {exam.examiner}</p>}
                        </div>
                        {exam.iwgdfRiskCategory !== undefined && (
                            <span style={{ background: ['#16a34a15','#65a30d15','#ca8a0415','#dc262615'][exam.iwgdfRiskCategory], color: ['#16a34a','#65a30d','#ca8a04','#dc2626'][exam.iwgdfRiskCategory], border: `1px solid`, borderColor: ['#16a34a','#65a30d','#ca8a04','#dc2626'][exam.iwgdfRiskCategory], borderRadius: '999px', padding: '0.25rem 0.75rem', fontSize: '0.85rem', fontWeight: 700 }}>
                                IWGDF Risk {exam.iwgdfRiskCategory}
                            </span>
                        )}
                    </div>
                    <div style={s.twoCol}>
                        <div>
                            <p style={s.subLabel}>Sol Ayak</p>
                            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' as const }}>
                                <span style={{ background: `${pulseColor(exam.dpPulseLeft)}15`, color: pulseColor(exam.dpPulseLeft), borderRadius: '999px', padding: '0.2rem 0.5rem', fontSize: '0.78rem', fontWeight: 600 }}>DP: {pulseLabel(exam.dpPulseLeft)}</span>
                                <span style={{ background: `${pulseColor(exam.ptPulseLeft)}15`, color: pulseColor(exam.ptPulseLeft), borderRadius: '999px', padding: '0.2rem 0.5rem', fontSize: '0.78rem', fontWeight: 600 }}>PT: {pulseLabel(exam.ptPulseLeft)}</span>
                                {exam.abiLeft && <span style={{ background: '#f0f9ff', color: '#0369a1', borderRadius: '999px', padding: '0.2rem 0.5rem', fontSize: '0.78rem', fontWeight: 600 }}>ABI {exam.abiLeft}</span>}
                                {exam.lopsLeft && <span style={{ background: '#fef2f2', color: '#dc2626', borderRadius: '999px', padding: '0.2rem 0.5rem', fontSize: '0.78rem', fontWeight: 600 }}>LOPS</span>}
                            </div>
                        </div>
                        <div>
                            <p style={s.subLabel}>Sağ Ayak</p>
                            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' as const }}>
                                <span style={{ background: `${pulseColor(exam.dpPulseRight)}15`, color: pulseColor(exam.dpPulseRight), borderRadius: '999px', padding: '0.2rem 0.5rem', fontSize: '0.78rem', fontWeight: 600 }}>DP: {pulseLabel(exam.dpPulseRight)}</span>
                                <span style={{ background: `${pulseColor(exam.ptPulseRight)}15`, color: pulseColor(exam.ptPulseRight), borderRadius: '999px', padding: '0.2rem 0.5rem', fontSize: '0.78rem', fontWeight: 600 }}>PT: {pulseLabel(exam.ptPulseRight)}</span>
                                {exam.abiRight && <span style={{ background: '#f0f9ff', color: '#0369a1', borderRadius: '999px', padding: '0.2rem 0.5rem', fontSize: '0.78rem', fontWeight: 600 }}>ABI {exam.abiRight}</span>}
                                {exam.lopsRight && <span style={{ background: '#fef2f2', color: '#dc2626', borderRadius: '999px', padding: '0.2rem 0.5rem', fontSize: '0.78rem', fontWeight: 600 }}>LOPS</span>}
                            </div>
                        </div>
                    </div>
                    {exam.notes && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>📝 {exam.notes}</p>}
                </div>
            ))}

            {history.length === 0 && !showForm && (
                <div style={{ ...s.card, textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                    <p>Henüz ayak muayenesi kaydı yok.</p>
                    <button style={{ ...s.saveBtn, marginTop: '1rem', width: 'auto', padding: '0.625rem 1.5rem' }} onClick={startNew}>İlk Muayeneyi Kaydet</button>
                </div>
            )}

            {/* Form */}
            {showForm && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontWeight: 800, color: '#0f766e', margin: 0 }}>Yeni Ayak Muayenesi</h3>
                        <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowForm(false)}>✕</button>
                    </div>

                    {/* Basic info */}
                    <div style={s.card}>
                        <p style={s.sTitle}>Genel Bilgi</p>
                        <div style={s.twoCol}>
                            <div>
                                <label style={s.label}>Muayene Tarihi *</label>
                                <input style={s.inp} type="date" value={form.examDate} onChange={e => set('examDate', e.target.value)} />
                            </div>
                            <div>
                                <label style={s.label}>Muayene Eden</label>
                                <input style={s.inp} value={form.examiner} onChange={e => set('examiner', e.target.value)} placeholder="Dr. ..." />
                            </div>
                        </div>
                    </div>

                    {/* Neuropathy */}
                    <div style={s.card}>
                        <p style={s.sTitle}>E1 — Nöropati Değerlendirmesi</p>
                        <div style={s.twoCol}>
                            <div>
                                <p style={s.subLabel}>10 g Monofilament — Sol</p>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <Tog label="Anormal" value={form.monofilamentLeft} onChange={v => set('monofilamentLeft', v)} color="#dc2626" />
                                </div>
                                {form.monofilamentLeft && <input style={s.inp} type="number" min="0" max="10" value={form.monofilamentLeftPoints} onChange={e => set('monofilamentLeftPoints', e.target.value)} placeholder="Anormal nokta sayısı" />}
                            </div>
                            <div>
                                <p style={s.subLabel}>10 g Monofilament — Sağ</p>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <Tog label="Anormal" value={form.monofilamentRight} onChange={v => set('monofilamentRight', v)} color="#dc2626" />
                                </div>
                                {form.monofilamentRight && <input style={s.inp} type="number" min="0" max="10" value={form.monofilamentRightPoints} onChange={e => set('monofilamentRightPoints', e.target.value)} placeholder="Anormal nokta sayısı" />}
                            </div>
                        </div>
                        <div style={s.twoCol}>
                            <SensationSelector label="Vibrasyon (128 Hz) — Sol" value={form.vibrationLeft} onChange={v => set('vibrationLeft', v)} />
                            <SensationSelector label="Vibrasyon (128 Hz) — Sağ" value={form.vibrationRight} onChange={v => set('vibrationRight', v)} />
                            <SensationSelector label="İğne ucu (Pinprick) — Sol" value={form.pinprickLeft} onChange={v => set('pinprickLeft', v)} />
                            <SensationSelector label="İğne ucu (Pinprick) — Sağ" value={form.pinprickRight} onChange={v => set('pinprickRight', v)} />
                            <SensationSelector label="Sıcak-soğuk — Sol" value={form.temperatureLeft} onChange={v => set('temperatureLeft', v)} />
                            <SensationSelector label="Sıcak-soğuk — Sağ" value={form.temperatureRight} onChange={v => set('temperatureRight', v)} />
                        </div>
                        <div style={{ background: '#fef2f2', borderRadius: '0.625rem', padding: '0.875rem', marginTop: '0.75rem' }}>
                            <p style={{ fontWeight: 700, color: '#b91c1c', marginBottom: '0.5rem', fontSize: '0.9rem' }}>LOPS — Koruyucu Duyu Kaybı</p>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <Tog label="Sol ayak LOPS" value={form.lopsLeft} onChange={v => set('lopsLeft', v)} color="#dc2626" />
                                <Tog label="Sağ ayak LOPS" value={form.lopsRight} onChange={v => set('lopsRight', v)} color="#dc2626" />
                            </div>
                        </div>
                    </div>

                    {/* Circulation */}
                    <div style={s.card}>
                        <p style={s.sTitle}>E2 — Dolaşım Değerlendirmesi</p>
                        <div style={s.twoCol}>
                            <PulseSelector label="DP Nabız — Sol" value={form.dpPulseLeft} onChange={v => set('dpPulseLeft', v)} />
                            <PulseSelector label="DP Nabız — Sağ" value={form.dpPulseRight} onChange={v => set('dpPulseRight', v)} />
                            <PulseSelector label="PT Nabız — Sol" value={form.ptPulseLeft} onChange={v => set('ptPulseLeft', v)} />
                            <PulseSelector label="PT Nabız — Sağ" value={form.ptPulseRight} onChange={v => set('ptPulseRight', v)} />
                        </div>

                        <div style={{ ...s.threeCol, marginTop: '0.75rem' }}>
                            <div>
                                <label style={s.label}>ABI Sol</label>
                                <input style={s.inp} type="number" step="0.01" min="0" max="2" value={form.abiLeft} onChange={e => set('abiLeft', e.target.value)} placeholder="0.00–1.50" />
                            </div>
                            <div>
                                <label style={s.label}>ABI Sağ</label>
                                <input style={s.inp} type="number" step="0.01" min="0" max="2" value={form.abiRight} onChange={e => set('abiRight', e.target.value)} placeholder="0.00–1.50" />
                            </div>
                            <div>
                                <label style={s.label}>TBI Sol</label>
                                <input style={s.inp} type="number" step="0.01" min="0" max="1.5" value={form.tbiLeft} onChange={e => set('tbiLeft', e.target.value)} placeholder="0.00–1.00" />
                            </div>
                            <div>
                                <label style={s.label}>TBI Sağ</label>
                                <input style={s.inp} type="number" step="0.01" min="0" max="1.5" value={form.tbiRight} onChange={e => set('tbiRight', e.target.value)} placeholder="0.00–1.00" />
                            </div>
                            <div>
                                <label style={s.label}>Toe Pressure Sol (mmHg)</label>
                                <input style={s.inp} type="number" min="0" value={form.toePressureLeft} onChange={e => set('toePressureLeft', e.target.value)} />
                            </div>
                            <div>
                                <label style={s.label}>Toe Pressure Sağ (mmHg)</label>
                                <input style={s.inp} type="number" min="0" value={form.toePressureRight} onChange={e => set('toePressureRight', e.target.value)} />
                            </div>
                            <div>
                                <label style={s.label}>TcPO₂ Sol (mmHg)</label>
                                <input style={s.inp} type="number" min="0" value={form.tcpo2Left} onChange={e => set('tcpo2Left', e.target.value)} />
                            </div>
                            <div>
                                <label style={s.label}>TcPO₂ Sağ (mmHg)</label>
                                <input style={s.inp} type="number" min="0" value={form.tcpo2Right} onChange={e => set('tcpo2Right', e.target.value)} />
                            </div>
                        </div>

                        {/* Capillary, temp, color */}
                        <div style={{ ...s.twoCol, marginTop: '0.75rem' }}>
                            <div>
                                <p style={s.subLabel}>Kapiller Dolum — Sol</p>
                                <div style={{ display: 'flex', gap: '0.375rem' }}>
                                    {[['normal','Normal'],['delayed','Gecikmeli']].map(([v,l]) => <button key={v} type="button" style={s.toggle(form.capillaryRefillLeft === v, v === 'delayed' ? '#ca8a04' : '#16a34a')} onClick={() => set('capillaryRefillLeft', v)}>{l}</button>)}
                                </div>
                            </div>
                            <div>
                                <p style={s.subLabel}>Kapiller Dolum — Sağ</p>
                                <div style={{ display: 'flex', gap: '0.375rem' }}>
                                    {[['normal','Normal'],['delayed','Gecikmeli']].map(([v,l]) => <button key={v} type="button" style={s.toggle(form.capillaryRefillRight === v, v === 'delayed' ? '#ca8a04' : '#16a34a')} onClick={() => set('capillaryRefillRight', v)}>{l}</button>)}
                                </div>
                            </div>
                            <div>
                                <p style={s.subLabel}>Cilt Isısı — Sol</p>
                                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' as const }}>
                                    {[['cool','Soğuk'],['normal','Normal'],['warm','Sıcak']].map(([v,l]) => <button key={v} type="button" style={s.toggle(form.skinTempLeft === v, v === 'cool' ? '#1d4ed8' : v === 'warm' ? '#dc2626' : '#16a34a')} onClick={() => set('skinTempLeft', v)}>{l}</button>)}
                                </div>
                            </div>
                            <div>
                                <p style={s.subLabel}>Cilt Isısı — Sağ</p>
                                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' as const }}>
                                    {[['cool','Soğuk'],['normal','Normal'],['warm','Sıcak']].map(([v,l]) => <button key={v} type="button" style={s.toggle(form.skinTempRight === v, v === 'cool' ? '#1d4ed8' : v === 'warm' ? '#dc2626' : '#16a34a')} onClick={() => set('skinTempRight', v)}>{l}</button>)}
                                </div>
                            </div>
                            <div>
                                <p style={s.subLabel}>Renk Değişikliği — Sol</p>
                                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' as const }}>
                                    {[['normal','Normal'],['pallor','Soluk'],['rubor','Kırmızı'],['cyanosis','Siyanotik']].map(([v,l]) => <button key={v} type="button" style={s.toggle(form.colorChangeLeft === v)} onClick={() => set('colorChangeLeft', v)}>{l}</button>)}
                                </div>
                            </div>
                            <div>
                                <p style={s.subLabel}>Renk Değişikliği — Sağ</p>
                                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' as const }}>
                                    {[['normal','Normal'],['pallor','Soluk'],['rubor','Kırmızı'],['cyanosis','Siyanotik']].map(([v,l]) => <button key={v} type="button" style={s.toggle(form.colorChangeRight === v)} onClick={() => set('colorChangeRight', v)}>{l}</button>)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skin & Structure */}
                    <div style={s.card}>
                        <p style={s.sTitle}>E3 — Cilt, Yapı ve Deformite</p>
                        <div style={s.twoCol}>
                            {/* Left */}
                            <div>
                                <p style={{ ...s.label, color: '#0f766e', marginBottom: '0.5rem' }}>Sol Ayak</p>
                                <p style={s.subLabel}>Cilt Değişiklikleri</p>
                                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' as const, marginBottom: '0.75rem' }}>
                                    {[['leftCallus','Kallus'],['leftFissure','Fissür'],['leftTinea','Tinea'],['leftOnychomycosis','Onikomikoz']].map(([k,l]) => (
                                        <Tog key={k} label={l} value={form[k]} onChange={v => set(k, v)} />
                                    ))}
                                </div>
                                <p style={s.subLabel}>Deformiteler</p>
                                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' as const }}>
                                    {[['leftHalluxValgus','Hallux Valgus'],['leftHammerToes','Çekiç Parmak'],['leftCharcotDeformity','Charcot Deformitesi'],['leftPesPlanus','Pes Planus'],['leftPesCavus','Pes Cavus'],['leftAnkleEquinus','Ayak Bileği Equinus']].map(([k,l]) => (
                                        <Tog key={k} label={l} value={form[k]} onChange={v => set(k, v)} color="#ea580c" />
                                    ))}
                                </div>
                            </div>
                            {/* Right */}
                            <div>
                                <p style={{ ...s.label, color: '#0f766e', marginBottom: '0.5rem' }}>Sağ Ayak</p>
                                <p style={s.subLabel}>Cilt Değişiklikleri</p>
                                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' as const, marginBottom: '0.75rem' }}>
                                    {[['rightCallus','Kallus'],['rightFissure','Fissür'],['rightTinea','Tinea'],['rightOnychomycosis','Onikomikoz']].map(([k,l]) => (
                                        <Tog key={k} label={l} value={form[k]} onChange={v => set(k, v)} />
                                    ))}
                                </div>
                                <p style={s.subLabel}>Deformiteler</p>
                                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' as const }}>
                                    {[['rightHalluxValgus','Hallux Valgus'],['rightHammerToes','Çekiç Parmak'],['rightCharcotDeformity','Charcot Deformitesi'],['rightPesPlanus','Pes Planus'],['rightPesCavus','Pes Cavus'],['rightAnkleEquinus','Ayak Bileği Equinus']].map(([k,l]) => (
                                        <Tog key={k} label={l} value={form[k]} onChange={v => set(k, v)} color="#ea580c" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footwear */}
                    <div style={s.card}>
                        <p style={s.sTitle}>E4 — Ayakkabı ve Ortez</p>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const, marginBottom: '0.75rem' }}>
                            <Tog label="Uygun ayakkabı" value={form.appropriateFootwear} onChange={v => set('appropriateFootwear', v)} color="#16a34a" />
                            <Tog label="Ortez var" value={form.orthosis} onChange={v => set('orthosis', v)} />
                            <Tog label="Basınç noktaları tespit edildi" value={form.pressurePointsIdentified} onChange={v => set('pressurePointsIdentified', v)} color="#ea580c" />
                        </div>
                        <input style={s.inp} value={form.footwearNotes} onChange={e => set('footwearNotes', e.target.value)} placeholder="Ayakkabı / ortez notu" />
                    </div>

                    {/* IWGDF Risk */}
                    <div style={s.card}>
                        <p style={s.sTitle}>IWGDF Risk Kategorisi (Bu Muayeneye Göre)</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
                            {([0,1,2,3] as const).map(cat => {
                                const colors = ['#16a34a','#65a30d','#ca8a04','#dc2626'];
                                const labels = ['Kat.0 — Yılda 1','Kat.1 — 6 ayda 1','Kat.2 — 3 ayda 1','Kat.3 — 1–3 ayda 1'];
                                return (
                                    <button key={cat} type="button"
                                        style={{ padding: '0.5rem 1rem', border: `2px solid ${form.iwgdfRiskCategory === cat ? colors[cat] : '#e2e8f0'}`, background: form.iwgdfRiskCategory === cat ? `${colors[cat]}15` : 'white', color: form.iwgdfRiskCategory === cat ? colors[cat] : '#64748b', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: form.iwgdfRiskCategory === cat ? 700 : 400, fontSize: '0.85rem' }}
                                        onClick={() => set('iwgdfRiskCategory', cat)}>{labels[cat]}</button>
                                );
                            })}
                        </div>
                    </div>

                    <div style={s.card}>
                        <label style={s.label}>Notlar</label>
                        <textarea style={{ ...s.inp, minHeight: '70px', resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Ek notlar..." />
                    </div>

                    {error && <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem', color: '#b91c1c', marginBottom: '1rem' }}>{error}</div>}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button style={{ flex: 1, padding: '0.875rem', background: '#f1f5f9', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600 }} onClick={() => setShowForm(false)}>İptal</button>
                        <button style={{ flex: 3, ...s.saveBtn }} onClick={handleSave} disabled={saving}>{saving ? 'Kaydediliyor...' : '🦶 Muayeneyi Kaydet'}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
