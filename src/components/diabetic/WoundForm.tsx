import { useState, useEffect } from 'react';
import { WAGNER_GRADES } from '../../utils/scoring';

const WAGNER_DESCRIPTIONS = [
    { emoji: '🟢', desc: 'Yara yok, risk faktörleri mevcut' },
    { emoji: '🟡', desc: 'Yüzeysel ülser' },
    { emoji: '🟡', desc: 'Derin ülser (tendon/kapsül)' },
    { emoji: '🟠', desc: 'Derin ülser + enfeksiyon/apse' },
    { emoji: '🔴', desc: 'Kısmi gangren (parmak/ön ayak)' },
    { emoji: '🔴', desc: 'Tüm ayakta gangren' },
];

export default function WoundForm() {
    const [patientId, setPatientId] = useState('');
    const [footSide, setFootSide] = useState<'left' | 'right' | 'both'>('right');
    const [wagnerGrade, setWagnerGrade] = useState(0);
    const [size, setSize] = useState<'small' | 'medium' | 'large'>('small');
    const [symptoms, setSymptoms] = useState({ redness: false, swelling: false, discharge: false, odor: false });
    const [painScore, setPainScore] = useState(1);
    const [canWalk, setCanWalk] = useState<'normal' | 'limping' | 'cannot'>('normal');
    const [temperature, setTemperature] = useState('');
    const [notes, setNotes] = useState('');
    const [datetime, setDatetime] = useState('');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const session = localStorage.getItem('patientSession');
        if (!session) { window.location.href = '/hasta/giris'; return; }
        const p = JSON.parse(session);
        setPatientId(p.id);
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setDatetime(now.toISOString().slice(0, 16));
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/yara-durumu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId, footSide, wagnerGrade, size, symptoms, painScore, canWalk, temperature: temperature ? parseFloat(temperature) : undefined, notes, datetime })
            });
            if (!res.ok) { const d = await res.json(); setError(d.error); return; }
            setSaved(true);
        } catch { setError('Bağlantı hatası.'); }
        finally { setLoading(false); }
    }

    const s = {
        page: { minHeight: '100vh', background: '#f0fdf4', fontFamily: 'Inter,system-ui,sans-serif' },
        header: { background: '#0f766e', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' },
        body: { padding: '1.5rem', maxWidth: '26rem', margin: '0 auto' },
        card: { background: 'white', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginBottom: '1rem' },
        label: { display: 'block', fontSize: '1.05rem', fontWeight: 700, color: '#374151', marginBottom: '0.625rem' } as React.CSSProperties,
        choiceBtn: (active: boolean, color = '#0f766e') => ({ flex: 1, padding: '0.875rem 0.5rem', border: `2px solid ${active ? color : '#e2e8f0'}`, background: active ? color : 'white', color: active ? 'white' : '#64748b', borderRadius: '0.75rem', cursor: 'pointer', fontSize: '1rem', fontWeight: active ? 700 : 400, transition: 'all 0.15s', textAlign: 'center' as const }) as React.CSSProperties,
        submitBtn: { width: '100%', padding: '1.25rem', background: '#0f766e', color: 'white', border: 'none', borderRadius: '1rem', fontSize: '1.35rem', fontWeight: 800, cursor: 'pointer' } as React.CSSProperties,
        inp: { width: '100%', padding: '0.875rem', border: '2px solid #e2e8f0', borderRadius: '0.75rem', fontSize: '1.05rem', outline: 'none', boxSizing: 'border-box' as const },
    };

    if (saved) {
        const wInfo = WAGNER_GRADES[wagnerGrade];
        return (
            <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '24rem' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✅</div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a', marginBottom: '0.5rem' }}>Kaydedildi ✓</h2>
                    <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
                        <p style={{ fontWeight: 700, color: '#166534', fontSize: '1.05rem', marginBottom: '0.5rem' }}>Wagner Grade {wagnerGrade}</p>
                        <p style={{ color: '#166534', fontSize: '1rem', lineHeight: 1.5 }}>{wInfo?.recommendation}</p>
                    </div>
                    <a href="/hasta" style={{ display: 'block', background: '#0f766e', color: 'white', borderRadius: '1rem', padding: '1rem', textDecoration: 'none', fontWeight: 800, fontSize: '1.2rem' }}>
                        Ana Ekrana Dön
                    </a>
                </div>
            </div>
        );
    }

    const PAIN_EMOJIS = ['😊','😊','🙂','😐','😕','😟','😟','😣','😣','😰','😭'];

    return (
        <div style={s.page}>
            <div style={s.header}>
                <a href="/hasta" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem' }}>←</a>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>🦶 Yara Durumu Bildir</h1>
            </div>

            <div style={s.body}>
                {error && <div style={{ background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: '0.75rem', padding: '1rem', color: '#dc2626', marginBottom: '1rem', fontSize: '1.05rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Foot side */}
                    <div style={s.card}>
                        <label style={s.label}>Hangi Ayak?</label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {([['left','Sol Ayak','🦶'], ['right','Sağ Ayak','🦶'], ['both','Her İkisi','🦶🦶']] as const).map(([v, l, e]) => (
                                <button key={v} type="button" style={s.choiceBtn(footSide === v)} onClick={() => setFootSide(v)}>
                                    <div style={{ fontSize: '1.5rem' }}>{e}</div>
                                    <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>{l}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Wagner Grade */}
                    <div style={s.card}>
                        <label style={s.label}>Wagner Yara Sınıflaması</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            {[0,1,2,3,4,5].map(g => {
                                const colors = ['#16a34a','#22c55e','#ca8a04','#ea580c','#dc2626','#7f1d1d'];
                                return (
                                    <button key={g} type="button"
                                        style={{ padding: '0.75rem', border: `2px solid ${wagnerGrade === g ? colors[g] : '#e2e8f0'}`, background: wagnerGrade === g ? colors[g] : 'white', color: wagnerGrade === g ? 'white' : '#374151', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', transition: 'all 0.15s' }}
                                        onClick={() => setWagnerGrade(g)}>
                                        Grade {g}
                                    </button>
                                );
                            })}
                        </div>
                        {/* Description */}
                        <div style={{ background: '#f8fafc', borderRadius: '0.625rem', padding: '0.875rem', fontSize: '0.95rem', color: '#475569' }}>
                            <strong>Grade {wagnerGrade}:</strong> {WAGNER_DESCRIPTIONS[wagnerGrade]?.emoji} {WAGNER_DESCRIPTIONS[wagnerGrade]?.desc}
                        </div>
                    </div>

                    {/* Size */}
                    <div style={s.card}>
                        <label style={s.label}>Yara Büyüklüğü</label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {([['small','Küçük','●'], ['medium','Orta','⬤'], ['large','Büyük','⬛']] as const).map(([v, l, e]) => (
                                <button key={v} type="button" style={s.choiceBtn(size === v)} onClick={() => setSize(v)}>
                                    <div>{e}</div><div style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>{l}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Symptoms */}
                    <div style={s.card}>
                        <label style={s.label}>Belirtiler (uygun olanları seçin)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                            {([
                                ['redness', 'Kızarıklık', '🔴'],
                                ['swelling', 'Şişlik', '💧'],
                                ['discharge', 'Akıntı', '💦'],
                                ['odor', 'Koku', '👃'],
                            ] as const).map(([k, label, emoji]) => (
                                <button key={k} type="button"
                                    style={{ padding: '0.875rem', border: `2px solid ${symptoms[k] ? '#dc2626' : '#e2e8f0'}`, background: symptoms[k] ? '#fef2f2' : 'white', color: symptoms[k] ? '#dc2626' : '#374151', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: symptoms[k] ? 700 : 400, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                                    onClick={() => setSymptoms(prev => ({ ...prev, [k]: !prev[k] }))}>
                                    {emoji} {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pain score */}
                    <div style={s.card}>
                        <label style={s.label}>Ağrı Skoru: {painScore}/10 {PAIN_EMOJIS[painScore]}</label>
                        <input type="range" min={1} max={10} value={painScore} onChange={e => setPainScore(parseInt(e.target.value))}
                            style={{ width: '100%', accentColor: '#0f766e' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                            <span>1 - Az</span><span>10 - Çok fazla</span>
                        </div>
                    </div>

                    {/* Walking ability */}
                    <div style={s.card}>
                        <label style={s.label}>Yürüme Durumu</label>
                        <div style={{ display: 'flex', gap: '0.625rem' }}>
                            {([['normal','Normal 🚶','#16a34a'], ['limping','Topallıyor 🚶‍♂️','#ca8a04'], ['cannot','Yürüyemiyor ❌','#dc2626']] as const).map(([v, l, c]) => (
                                <button key={v} type="button" style={s.choiceBtn(canWalk === v, c)} onClick={() => setCanWalk(v)}>
                                    <div style={{ fontSize: '0.9rem' }}>{l}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Temperature & datetime */}
                    <div style={s.card}>
                        <label style={s.label}>Vücut Sıcaklığı (opsiyonel)</label>
                        <input style={{ ...s.inp, marginBottom: '1rem' }} type="number" value={temperature} onChange={e => setTemperature(e.target.value)} placeholder="36.5" step={0.1} min={35} max={42} />
                        <label style={s.label}>Tarih / Saat</label>
                        <input style={{ ...s.inp, marginBottom: '1rem' }} type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} />
                        <label style={s.label}>Notlar (opsiyonel)</label>
                        <textarea style={{ ...s.inp, minHeight: '80px', resize: 'vertical' as const }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ek notlar..." />
                    </div>

                    <button style={s.submitBtn} type="submit" disabled={loading}>
                        {loading ? 'Kaydediliyor...' : '💾 Kaydet'}
                    </button>
                </form>
            </div>
        </div>
    );
}
