import { useState, useEffect, useCallback } from 'react';

interface PatientSummary {
    id: string;
    name: string;
    accessCode: string;
    phone: string;
    lastEntryDate: string | null;
    lastGlucoseValue: number | null;
    lastWagnerGrade: number | null;
    avgGlucose7d: number | null;
    riskFlags: string[];
    isHighRisk: boolean;
    createdAt: string;
}

interface DoctorSession {
    id: string;
    email: string;
    clinicName: string;
    phone?: string;
}

const WAGNER_COLORS = ['#16a34a','#22c55e','#ca8a04','#ea580c','#dc2626','#7f1d1d'];

function glucoseColor(v: number | null) {
    if (!v) return '#94a3b8';
    if (v < 140) return '#16a34a';
    if (v < 200) return '#ca8a04';
    return '#dc2626';
}

const s = {
    page: { minHeight: '100vh', background: '#f1f5f9', fontFamily: 'Inter,system-ui,sans-serif' } as React.CSSProperties,
    nav: { background: '#1e3a8a', color: 'white', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } as React.CSSProperties,
    navTitle: { fontSize: '1.3rem', fontWeight: 800 } as React.CSSProperties,
    navBtn: { background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' } as React.CSSProperties,
    body: { padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' } as React.CSSProperties,
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '1.5rem' } as React.CSSProperties,
    statCard: (color: string) => ({ background: 'white', borderRadius: '0.875rem', padding: '1.25rem', borderLeft: `4px solid ${color}`, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }) as React.CSSProperties,
    statVal: { fontSize: '2rem', fontWeight: 800, color: '#1e293b' } as React.CSSProperties,
    statLabel: { fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' } as React.CSSProperties,
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' } as React.CSSProperties,
    addBtn: { background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 1.25rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' } as React.CSSProperties,
    table: { width: '100%', borderCollapse: 'collapse' as const, background: 'white', borderRadius: '0.875rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
    th: { background: '#f8fafc', padding: '0.875rem 1rem', textAlign: 'left' as const, fontSize: '0.85rem', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem', color: '#1e293b' } as React.CSSProperties,
    badge: (color: string) => ({ display: 'inline-block', background: color, color: 'white', borderRadius: '999px', padding: '0.2rem 0.6rem', fontSize: '0.8rem', fontWeight: 700 }) as React.CSSProperties,
    alertCell: { display: 'flex', flexWrap: 'wrap' as const, gap: '0.3rem' },
    viewBtn: { background: '#eff6ff', color: '#1d4ed8', border: '1.5px solid #bfdbfe', borderRadius: '0.5rem', padding: '0.4rem 0.85rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 } as React.CSSProperties,
    filterRow: { display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' as const } as React.CSSProperties,
    filterBtn: (active: boolean) => ({ padding: '0.5rem 1rem', borderRadius: '999px', border: '2px solid #e2e8f0', background: active ? '#1d4ed8' : 'white', color: active ? 'white' : '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }) as React.CSSProperties,
};

export default function DoctorDashboard() {
    const [doctor, setDoctor] = useState<DoctorSession | null>(null);
    const [patients, setPatients] = useState<PatientSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'high-risk' | 'no-entry'>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(Date.now());

    useEffect(() => {
        const session = localStorage.getItem('doctorSession');
        if (!session) { window.location.href = '/doktor/giris'; return; }
        const doc = JSON.parse(session);
        setDoctor(doc);
    }, []);

    const loadPatients = useCallback(async () => {
        if (!doctor) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/doktor/hastalar?doctorId=${doctor.id}`);
            const data = await res.json();
            setPatients(Array.isArray(data) ? data : []);
        } finally { setLoading(false); }
    }, [doctor]);

    useEffect(() => { loadPatients(); }, [loadPatients, lastRefresh]);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const t = setInterval(() => setLastRefresh(Date.now()), 5 * 60 * 1000);
        return () => clearInterval(t);
    }, []);

    function logout() {
        localStorage.removeItem('doctorSession');
        window.location.href = '/';
    }

    const filtered = patients.filter(p => {
        if (filter === 'high-risk') return p.isHighRisk;
        if (filter === 'no-entry') {
            if (!p.lastEntryDate) return true;
            return (Date.now() - new Date(p.lastEntryDate).getTime()) > 3 * 86400000;
        }
        return true;
    });

    const highRiskCount = patients.filter(p => p.isHighRisk).length;
    const noEntryCount = patients.filter(p => !p.lastEntryDate || (Date.now() - new Date(p.lastEntryDate).getTime()) > 3 * 86400000).length;

    function formatDate(d: string | null) {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    if (!doctor) return null;

    return (
        <div style={s.page}>
            {/* Navbar */}
            <nav style={s.nav}>
                <span style={s.navTitle}>🦶 DiyabetikAyak — {doctor.clinicName}</span>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{doctor.email}</span>
                    <button style={s.navBtn} onClick={logout}>Çıkış</button>
                </div>
            </nav>

            <div style={s.body}>
                {/* Stats */}
                <div style={s.statsRow}>
                    <div style={s.statCard('#1d4ed8')}>
                        <div style={s.statVal}>{patients.length}</div>
                        <div style={s.statLabel}>Toplam Hasta</div>
                    </div>
                    <div style={s.statCard('#dc2626')}>
                        <div style={s.statVal}>{highRiskCount}</div>
                        <div style={s.statLabel}>Yüksek Riskli</div>
                    </div>
                    <div style={s.statCard('#ca8a04')}>
                        <div style={s.statVal}>{noEntryCount}</div>
                        <div style={s.statLabel}>3+ Gün Giriş Yok</div>
                    </div>
                    <div style={s.statCard('#16a34a')}>
                        <div style={s.statVal}>{patients.filter(p => {
                            const today = new Date().toDateString();
                            return p.lastEntryDate && new Date(p.lastEntryDate).toDateString() === today;
                        }).length}</div>
                        <div style={s.statLabel}>Bugün Giriş</div>
                    </div>
                </div>

                {/* Header + Add button */}
                <div style={s.header}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b' }}>Hasta Listesi</h2>
                    <button style={s.addBtn} onClick={() => setShowAddModal(true)}>
                        + Yeni Hasta
                    </button>
                </div>

                {/* Filters */}
                <div style={s.filterRow}>
                    {(['all', 'high-risk', 'no-entry'] as const).map(f => (
                        <button key={f} style={s.filterBtn(filter === f)} onClick={() => setFilter(f)}>
                            {f === 'all' ? 'Tümü' : f === 'high-risk' ? '🔴 Yüksek Risk' : '⚠️ Giriş Yok'}
                        </button>
                    ))}
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '1.1rem' }}>Yükleniyor...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: 'white', borderRadius: '0.875rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                        <p style={{ fontSize: '1.15rem' }}>{filter === 'all' ? 'Henüz hasta eklenmedi.' : 'Bu kritere uyan hasta yok.'}</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    {['Hasta Adı', 'Kod', 'Son Giriş', 'Kan Şekeri', 'Wagner', 'Risk', 'Uyarılar', ''].map(h => (
                                        <th key={h} style={s.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(p => (
                                    <tr key={p.id} style={{ background: p.isHighRisk ? '#fff5f5' : 'white' }}>
                                        <td style={{ ...s.td, fontWeight: 600 }}>{p.name}</td>
                                        <td style={s.td}>
                                            <code style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                                                {p.accessCode}
                                            </code>
                                        </td>
                                        <td style={s.td}>{formatDate(p.lastEntryDate)}</td>
                                        <td style={s.td}>
                                            {p.lastGlucoseValue ? (
                                                <span style={{ color: glucoseColor(p.lastGlucoseValue), fontWeight: 700 }}>
                                                    {p.lastGlucoseValue} mg/dL
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td style={s.td}>
                                            {p.lastWagnerGrade !== null ? (
                                                <span style={{ ...s.badge(WAGNER_COLORS[p.lastWagnerGrade] ?? '#94a3b8') }}>
                                                    G{p.lastWagnerGrade}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td style={s.td}>
                                            <span style={s.badge(p.isHighRisk ? '#dc2626' : '#16a34a')}>
                                                {p.isHighRisk ? '⚠ Yüksek' : 'Normal'}
                                            </span>
                                        </td>
                                        <td style={s.td}>
                                            <div style={s.alertCell}>
                                                {p.riskFlags.map(f => (
                                                    <span key={f} style={{ ...s.badge('#dc2626'), fontSize: '0.72rem' }}>{f}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={s.td}>
                                            <button style={s.viewBtn} onClick={() => window.location.href = `/doktor/hasta/${p.id}`}>
                                                Detay →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showAddModal && (
                <AddPatientModal
                    doctorId={doctor.id}
                    onClose={() => setShowAddModal(false)}
                    onAdded={() => { setShowAddModal(false); setLastRefresh(Date.now()); }}
                />
            )}
        </div>
    );
}

function AddPatientModal({ doctorId, onClose, onAdded }: { doctorId: string; onClose: () => void; onAdded: () => void }) {
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [phone, setPhone] = useState('');
    const [diagnosisDate, setDiagnosisDate] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [created, setCreated] = useState<{ name: string; accessCode: string } | null>(null);

    const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' };
    const modal: React.CSSProperties = { background: 'white', borderRadius: '1.25rem', padding: '2rem', width: '100%', maxWidth: '26rem', maxHeight: '90vh', overflowY: 'auto' };
    const inp: React.CSSProperties = { width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '0.625rem', fontSize: '1rem', marginBottom: '0.875rem', boxSizing: 'border-box' };
    const lbl: React.CSSProperties = { display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.35rem', fontSize: '0.95rem' };

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/doktor/hastalar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorId, name, dob, phone, diagnosisDate, notes })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            setCreated({ name: data.name, accessCode: data.accessCode });
        } catch { setError('Sunucu hatası.'); }
        finally { setLoading(false); }
    }

    return (
        <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={modal}>
                {created ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#166534', marginBottom: '0.5rem' }}>Hasta Oluşturuldu!</h2>
                        <p style={{ color: '#374151', marginBottom: '1.25rem' }}><strong>{created.name}</strong> başarıyla sisteme eklendi.</p>
                        <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
                            <p style={{ color: '#166534', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Hasta Erişim Kodu:</p>
                            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#166534', fontFamily: 'monospace', letterSpacing: '0.1em' }}>{created.accessCode}</p>
                            <p style={{ color: '#166534', fontSize: '0.85rem', marginTop: '0.5rem' }}>Bu kodu hastanıza iletmeyi unutmayın!</p>
                        </div>
                        <button
                            style={{ background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', width: '100%' }}
                            onClick={onAdded}
                        >
                            Tamam
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e3a8a' }}>Yeni Hasta Ekle</h2>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
                        </div>
                        {error && <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem', color: '#b91c1c', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
                        <form onSubmit={submit}>
                            <label style={lbl}>Hasta Adı Soyadı *</label>
                            <input style={inp} value={name} onChange={e => setName(e.target.value)} required placeholder="Ahmet Yılmaz" />
                            <label style={lbl}>Doğum Tarihi</label>
                            <input style={inp} type="date" value={dob} onChange={e => setDob(e.target.value)} />
                            <label style={lbl}>Telefon</label>
                            <input style={inp} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0555 XXX XX XX" />
                            <label style={lbl}>Tanı Tarihi</label>
                            <input style={inp} type="date" value={diagnosisDate} onChange={e => setDiagnosisDate(e.target.value)} />
                            <label style={lbl}>Notlar</label>
                            <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ek bilgiler..." />
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.875rem', background: '#f1f5f9', border: 'none', borderRadius: '0.75rem', fontSize: '1rem', cursor: 'pointer', fontWeight: 600 }}>İptal</button>
                                <button type="submit" disabled={loading} style={{ flex: 2, padding: '0.875rem', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                                    {loading ? 'Ekleniyor...' : '✓ Hasta Ekle'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
