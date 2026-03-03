import { useState, useEffect } from 'react';
import { getWagnerInfo, getGlycemicRisk } from '../../utils/scoring';
import ClinicalProfileTab from './ClinicalProfileTab';
import FootExamTab from './FootExamTab';
import LabsTab from './LabsTab';
import TreatmentPlanTab from './TreatmentPlanTab';
import ClassificationTab from './ClassificationTab';

interface Props { patientId: string; }

type TabId = 'overview' | 'glucose' | 'wounds' | 'procedures' | 'messages' | 'klinik-profil' | 'ayak-muayenesi' | 'tetkikler' | 'tedavi-plani' | 'siniflamalar';

export default function PatientDetail({ patientId }: Props) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<TabId>('overview');
    const [doctor, setDoctor] = useState<any>(null);
    const [showProcedureForm, setShowProcedureForm] = useState(false);
    const [newMsg, setNewMsg] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const session = localStorage.getItem('doctorSession');
        if (!session) { window.location.href = '/doktor/giris'; return; }
        setDoctor(JSON.parse(session));
        loadData();
    }, [patientId]);

    async function loadData() {
        setLoading(true);
        try {
            const res = await fetch(`/api/doktor/hasta?id=${patientId}`);
            const d = await res.json();
            setData(d);
        } finally { setLoading(false); }
    }

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (!newMsg.trim() || !doctor) return;
        setSending(true);
        try {
            await fetch('/api/mesajlar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId, doctorId: doctor.id, senderType: 'doctor', content: newMsg.trim() })
            });
            setNewMsg('');
            await loadData();
        } finally { setSending(false); }
    }

    const s = {
        page: { minHeight: '100vh', background: '#f1f5f9', fontFamily: 'Inter,system-ui,sans-serif' },
        nav: { background: '#1e3a8a', color: 'white', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' },
        body: { padding: '1.5rem', maxWidth: '960px', margin: '0 auto' },
        card: { background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1rem' },
        tabRow: { display: 'flex', gap: '0.5rem', overflowX: 'auto' as const, marginBottom: '1.5rem' },
        tabBtn: (active: boolean) => ({ padding: '0.625rem 1rem', borderRadius: '999px', border: `2px solid ${active ? '#1d4ed8' : '#e2e8f0'}`, background: active ? '#1d4ed8' : 'white', color: active ? 'white' : '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' as const }) as React.CSSProperties,
        label: { fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
        value: { fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginTop: '0.2rem' },
        th: { background: '#f8fafc', padding: '0.75rem 1rem', textAlign: 'left' as const, fontSize: '0.85rem', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' },
        td: { padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem' } as React.CSSProperties,
    };

    if (loading) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#64748b', fontSize: '1.1rem' }}>Yükleniyor...</p></div>;
    if (!data?.patient) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#dc2626', fontSize: '1.1rem' }}>Hasta bulunamadı.</p></div>;

    const { patient, glucoseEntries, woundEntries, procedures, messages } = data;

    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const recentGlucose = (glucoseEntries ?? []).filter((e: any) => new Date(e.datetime).getTime() > sevenDaysAgo);
    const avgGlucose = recentGlucose.length ? Math.round(recentGlucose.reduce((s: number, e: any) => s + e.value, 0) / recentGlucose.length) : null;
    const glycemicInfo = avgGlucose ? getGlycemicRisk(avgGlucose) : null;
    const lastWound = (woundEntries ?? [])[0];
    const wagnerInfo = lastWound ? getWagnerInfo(lastWound.wagnerGrade) : null;
    const unreadFromPatient = (messages ?? []).filter((m: any) => m.senderType === 'patient' && !m.read).length;

    function formatDate(dt: string) {
        return new Date(dt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    function formatDateTime(dt: string) {
        return new Date(dt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    const TABS = [
        { id: 'overview', label: '📋 Özet' },
        { id: 'glucose', label: `🩸 Kan Şekeri (${(glucoseEntries ?? []).length})` },
        { id: 'wounds', label: `🦶 Yara (${(woundEntries ?? []).length})` },
        { id: 'procedures', label: `⚕️ İşlemler (${(procedures ?? []).length})` },
        { id: 'messages', label: `💬 Mesajlar${unreadFromPatient > 0 ? ` (${unreadFromPatient}!)` : ''}` },
        { id: 'klinik-profil', label: '🏥 Hasta Profili' },
        { id: 'ayak-muayenesi', label: '🔬 Ayak Muayenesi' },
        { id: 'tetkikler', label: '🧪 Tetkikler' },
        { id: 'tedavi-plani', label: '💊 Tedavi Planı' },
        { id: 'siniflamalar', label: '📊 Sınıflamalar' },
    ];

    return (
        <div style={s.page}>
            <nav style={s.nav}>
                <a href="/doktor" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem' }}>←</a>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>👤 {patient.name}</h1>
                <code style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', padding: '0.3rem 0.7rem', borderRadius: '0.375rem', fontSize: '0.95rem' }}>{patient.accessCode}</code>
            </nav>

            <div style={s.body}>
                {/* Tabs */}
                <div style={s.tabRow}>
                    {TABS.map(t => (
                        <button key={t.id} style={s.tabBtn(tab === t.id)} onClick={() => setTab(t.id as any)}>{t.label}</button>
                    ))}
                </div>

                {/* OVERVIEW */}
                {tab === 'overview' && (
                    <>
                        {/* Patient info */}
                        <div style={s.card}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '1rem' }}>Hasta Bilgileri</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1rem' }}>
                                <div><p style={s.label}>Doğum Tarihi</p><p style={s.value}>{patient.dob ? formatDate(patient.dob) : '—'}</p></div>
                                <div><p style={s.label}>Telefon</p><p style={s.value}>{patient.phone || '—'}</p></div>
                                <div><p style={s.label}>Tanı Tarihi</p><p style={s.value}>{patient.diagnosisDate ? formatDate(patient.diagnosisDate) : '—'}</p></div>
                                <div><p style={s.label}>Kayıt Tarihi</p><p style={s.value}>{formatDate(patient.createdAt)}</p></div>
                            </div>
                            {patient.notes && <div style={{ marginTop: '1rem', background: '#f8fafc', borderRadius: '0.625rem', padding: '0.875rem' }}><p style={{ ...s.label, marginBottom: '0.25rem' }}>Notlar</p><p style={{ color: '#374151', fontSize: '0.95rem' }}>{patient.notes}</p></div>}
                        </div>

                        {/* Glycemic status */}
                        {glycemicInfo && (
                            <div style={{ ...s.card, background: glycemicInfo.color }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: glycemicInfo.textColor.replace('text-',''), marginBottom: '0.25rem' }}>Glikemik Kontrol (7 günlük ort.)</p>
                                <p style={{ fontSize: '2rem', fontWeight: 800, color: glycemicInfo.textColor.replace('text-','') }}>{avgGlucose} mg/dL</p>
                                <p style={{ fontSize: '0.95rem', color: glycemicInfo.textColor.replace('text-',''), marginTop: '0.25rem' }}>{glycemicInfo.label} — {glycemicInfo.advice}</p>
                            </div>
                        )}

                        {/* Wagner status */}
                        {wagnerInfo && (
                            <div style={{ ...s.card }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Son Yara Durumu</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: wagnerInfo.color, borderRadius: '0.75rem', padding: '0.5rem 1rem', fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>
                                        Grade {lastWound.wagnerGrade}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{wagnerInfo.description}</p>
                                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>{formatDateTime(lastWound.datetime)}</p>
                                    </div>
                                </div>
                                <p style={{ marginTop: '0.75rem', color: '#374151', fontSize: '0.95rem', background: '#f8fafc', borderRadius: '0.5rem', padding: '0.625rem' }}>{wagnerInfo.recommendation}</p>
                            </div>
                        )}
                    </>
                )}

                {/* GLUCOSE */}
                {tab === 'glucose' && (
                    <div style={s.card}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Kan Şekeri Geçmişi</h2>
                        {(glucoseEntries ?? []).length === 0 ? <p style={{ color: '#94a3b8' }}>Henüz kayıt yok.</p> : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                                    <thead><tr>{['Tarih','Değer','Ölçüm','İnsülin','Notlar'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                                    <tbody>
                                        {(glucoseEntries ?? []).map((e: any) => {
                                            const color = e.value < 140 ? '#16a34a' : e.value < 200 ? '#ca8a04' : '#dc2626';
                                            return (
                                                <tr key={e.id}>
                                                    <td style={s.td}>{formatDateTime(e.datetime)}</td>
                                                    <td style={{ ...s.td, fontWeight: 800, color }}>{e.value} mg/dL</td>
                                                    <td style={s.td}>{{ fasting:'Açken', postprandial:'Yemek sonrası', random:'Rastgele' }[e.measurementType as string]}</td>
                                                    <td style={s.td}>{e.insulinUsed ? `${e.insulinType ?? ''} ${e.dose ?? ''}ü` : '—'}</td>
                                                    <td style={s.td}>{e.notes || '—'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* WOUNDS */}
                {tab === 'wounds' && (
                    <div style={s.card}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Yara Kayıtları</h2>
                        {(woundEntries ?? []).length === 0 ? <p style={{ color: '#94a3b8' }}>Henüz kayıt yok.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {(woundEntries ?? []).map((w: any) => {
                                    const wColors = ['#16a34a','#22c55e','#ca8a04','#ea580c','#dc2626','#7f1d1d'];
                                    const wc = wColors[w.wagnerGrade] ?? '#94a3b8';
                                    const footLabels: any = { left: 'Sol', right: 'Sağ', both: 'Her İkisi' };
                                    const walkLabels: any = { normal: 'Normal', limping: 'Topallıyor', cannot: 'Yürüyemiyor' };
                                    const activeSymptoms = Object.entries(w.symptoms ?? {}).filter(([,v]) => v).map(([k]) => ({ redness:'Kızarıklık', swelling:'Şişlik', discharge:'Akıntı', odor:'Koku' })[k]);
                                    return (
                                        <div key={w.id} style={{ border: `2px solid ${wc}20`, borderRadius: '0.875rem', padding: '1rem', background: `${wc}08` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 800, color: wc, fontSize: '1.05rem' }}>Wagner Grade {w.wagnerGrade}</span>
                                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{formatDateTime(w.datetime)}</span>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))', gap: '0.5rem', fontSize: '0.9rem', color: '#374151' }}>
                                                <span>🦶 {footLabels[w.footSide]}</span>
                                                <span>📏 {{ small:'Küçük', medium:'Orta', large:'Büyük' }[w.size as string]}</span>
                                                <span>😣 Ağrı: {w.painScore}/10</span>
                                                <span>🚶 {walkLabels[w.canWalk]}</span>
                                                {w.temperature && <span>🌡️ {w.temperature}°C</span>}
                                            </div>
                                            {activeSymptoms.length > 0 && (
                                                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' as const }}>
                                                    {activeSymptoms.map(sym => <span key={sym} style={{ background: '#fef2f2', color: '#dc2626', borderRadius: '999px', padding: '0.2rem 0.625rem', fontSize: '0.8rem', fontWeight: 600 }}>{sym}</span>)}
                                                </div>
                                            )}
                                            {w.notes && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>📝 {w.notes}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* PROCEDURES */}
                {tab === 'procedures' && (
                    <div>
                        <div style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Prosedür Geçmişi</h2>
                            <button style={{ background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '0.625rem', padding: '0.625rem 1rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }} onClick={() => setShowProcedureForm(true)}>+ Ekle</button>
                        </div>
                        {(procedures ?? []).length === 0 ? <div style={s.card}><p style={{ color: '#94a3b8' }}>Henüz prosedür kaydı yok.</p></div> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                {(procedures ?? []).map((p: any) => (
                                    <div key={p.id} style={s.card}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '1.05rem' }}>{p.type}</span>
                                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{formatDate(p.date)}</span>
                                        </div>
                                        {p.surgeonName && <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.25rem' }}>👨‍⚕️ {p.surgeonName}</p>}
                                        {p.details && <p style={{ fontSize: '0.9rem', color: '#374151', marginBottom: '0.25rem' }}>📋 {p.details}</p>}
                                        {p.outcome && <p style={{ fontSize: '0.9rem', color: '#374151', marginBottom: '0.25rem' }}>✅ Sonuç: {p.outcome}</p>}
                                        {p.followupDate && <p style={{ fontSize: '0.9rem', color: '#1d4ed8' }}>📅 Takip: {formatDate(p.followupDate)}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* MESSAGES */}
                {tab === 'messages' && (
                    <div style={{ ...s.card, display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Mesajlar</h2>
                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px', display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1rem' }}>
                            {(messages ?? []).length === 0 && <p style={{ color: '#94a3b8' }}>Henüz mesaj yok.</p>}
                            {(messages ?? []).map((m: any) => (
                                <div key={m.id} style={{ alignSelf: m.senderType === 'doctor' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                                    <div style={{ background: m.senderType === 'doctor' ? '#1d4ed8' : '#f1f5f9', color: m.senderType === 'doctor' ? 'white' : '#1e293b', borderRadius: '0.875rem', padding: '0.75rem 1rem', fontSize: '0.95rem' }}>
                                        {m.content}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem', textAlign: m.senderType === 'doctor' ? 'right' : 'left' as any }}>
                                        {m.senderType === 'patient' ? '👤 Hasta' : '👨‍⚕️ Doktor'} · {formatDateTime(m.createdAt)}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.625rem' }}>
                            <input
                                style={{ flex: 1, padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '0.625rem', fontSize: '1rem', outline: 'none' }}
                                value={newMsg}
                                onChange={e => setNewMsg(e.target.value)}
                                placeholder="Hastaya mesaj gönderin..."
                            />
                            <button type="submit" disabled={sending || !newMsg.trim()} style={{ background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '0.625rem', padding: '0.75rem 1.25rem', cursor: 'pointer', fontWeight: 700 }}>
                                {sending ? '...' : 'Gönder'}
                            </button>
                        </form>
                    </div>
                )}

                {/* CLINICAL PROFILE */}
                {tab === 'klinik-profil' && doctor && (
                    <ClinicalProfileTab patientId={patientId} doctorId={doctor.id} />
                )}

                {/* FOOT EXAM */}
                {tab === 'ayak-muayenesi' && doctor && (
                    <FootExamTab patientId={patientId} doctorId={doctor.id} />
                )}

                {/* LABS */}
                {tab === 'tetkikler' && doctor && (
                    <LabsTab patientId={patientId} doctorId={doctor.id} />
                )}

                {/* TREATMENT PLAN */}
                {tab === 'tedavi-plani' && doctor && (
                    <TreatmentPlanTab patientId={patientId} doctorId={doctor.id} />
                )}

                {/* CLASSIFICATIONS */}
                {tab === 'siniflamalar' && (
                    <ClassificationTab patientId={patientId} />
                )}
            </div>

            {showProcedureForm && doctor && (
                <ProcedureModal patientId={patientId} doctorId={doctor.id} onClose={() => setShowProcedureForm(false)} onAdded={() => { setShowProcedureForm(false); loadData(); }} />
            )}
        </div>
    );
}

function ProcedureModal({ patientId, doctorId, onClose, onAdded }: { patientId: string; doctorId: string; onClose: () => void; onAdded: () => void }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState('');
    const [surgeonName, setSurgeonName] = useState('');
    const [details, setDetails] = useState('');
    const [outcome, setOutcome] = useState('');
    const [followupDate, setFollowupDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const PROC_TYPES = ['Debridman', 'Amputasyon', 'Vasküler Girişim', 'Deri Grefti', 'Yara Bakımı', 'Diğer'];

    const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' };
    const modal: React.CSSProperties = { background: 'white', borderRadius: '1rem', padding: '1.75rem', width: '100%', maxWidth: '26rem', maxHeight: '90vh', overflowY: 'auto' };
    const inp: React.CSSProperties = { width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '0.625rem', fontSize: '1rem', marginBottom: '0.875rem', boxSizing: 'border-box' };
    const lbl: React.CSSProperties = { display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.35rem', fontSize: '0.95rem' };

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!type) { setError('İşlem türü seçin.'); return; }
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/prosedurler', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId, doctorId, date, type, surgeonName, details, outcome, followupDate })
            });
            if (!res.ok) { const d = await res.json(); setError(d.error); return; }
            onAdded();
        } catch { setError('Sunucu hatası.'); }
        finally { setLoading(false); }
    }

    return (
        <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={modal}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e3a8a' }}>Prosedür Ekle</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
                </div>
                {error && <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem', color: '#b91c1c', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
                <form onSubmit={submit}>
                    <label style={lbl}>Tarih *</label>
                    <input style={inp} type="date" value={date} onChange={e => setDate(e.target.value)} required />
                    <label style={lbl}>İşlem Türü *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.875rem' }}>
                        {PROC_TYPES.map(t => (
                            <button key={t} type="button"
                                style={{ padding: '0.625rem', border: `2px solid ${type === t ? '#1d4ed8' : '#e2e8f0'}`, background: type === t ? '#eff6ff' : 'white', color: type === t ? '#1d4ed8' : '#374151', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: type === t ? 700 : 400, fontSize: '0.9rem' }}
                                onClick={() => setType(t)}>{t}</button>
                        ))}
                    </div>
                    <label style={lbl}>Cerrah Adı</label>
                    <input style={inp} value={surgeonName} onChange={e => setSurgeonName(e.target.value)} placeholder="Op. Dr. ..." />
                    <label style={lbl}>Detaylar</label>
                    <textarea style={{ ...inp, minHeight: '70px', resize: 'vertical' }} value={details} onChange={e => setDetails(e.target.value)} placeholder="İşlem detayları..." />
                    <label style={lbl}>Sonuç</label>
                    <input style={inp} value={outcome} onChange={e => setOutcome(e.target.value)} placeholder="İşlem sonucu..." />
                    <label style={lbl}>Takip Tarihi</label>
                    <input style={inp} type="date" value={followupDate} onChange={e => setFollowupDate(e.target.value)} />
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.875rem', background: '#f1f5f9', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>İptal</button>
                        <button type="submit" disabled={loading} style={{ flex: 2, padding: '0.875rem', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
