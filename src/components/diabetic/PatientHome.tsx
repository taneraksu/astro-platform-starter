import { useState, useEffect } from 'react';

interface PatientSession {
    id: string;
    name: string;
    accessCode: string;
    doctorId: string;
    doctor?: { clinicName: string; phone?: string; email: string };
}

export default function PatientHome() {
    const [patient, setPatient] = useState<PatientSession | null>(null);
    const [lastGlucose, setLastGlucose] = useState<{ value: number; datetime: string } | null>(null);
    const [lastWagner, setLastWagner] = useState<{ grade: number; datetime: string } | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const session = localStorage.getItem('patientSession');
        if (!session) { window.location.href = '/hasta/giris'; return; }
        const p: PatientSession = JSON.parse(session);
        setPatient(p);

        // Load last glucose & wound entries
        Promise.all([
            fetch(`/api/kan-sekeri?patientId=${p.id}`).then(r => r.json()),
            fetch(`/api/yara-durumu?patientId=${p.id}`).then(r => r.json()),
            fetch(`/api/mesajlar?patientId=${p.id}&readerType=patient`).then(r => r.json()),
        ]).then(([glucose, wounds, msgs]) => {
            if (Array.isArray(glucose) && glucose.length > 0) {
                setLastGlucose({ value: glucose[0].value, datetime: glucose[0].datetime });
            }
            if (Array.isArray(wounds) && wounds.length > 0) {
                setLastWagner({ grade: wounds[0].wagnerGrade, datetime: wounds[0].datetime });
            }
            if (Array.isArray(msgs)) {
                setUnreadCount(msgs.filter((m: any) => m.senderType === 'doctor' && !m.read).length);
            }
        }).catch(() => {});
    }, []);

    function logout() {
        localStorage.removeItem('patientSession');
        window.location.href = '/';
    }

    if (!patient) return null;

    const glucoseColor = lastGlucose
        ? lastGlucose.value < 140 ? '#16a34a' : lastGlucose.value < 200 ? '#ca8a04' : '#dc2626'
        : '#94a3b8';

    const wagnerColor = lastWagner !== null
        ? ['#16a34a','#22c55e','#ca8a04','#ea580c','#dc2626','#7f1d1d'][lastWagner.grade] ?? '#94a3b8'
        : '#94a3b8';

    const bigBtn = (emoji: string, label: string, href: string, bg: string, badge?: number): React.ReactNode => (
        <a href={href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: bg, borderRadius: '1.25rem', padding: '2rem 1.5rem',
            textDecoration: 'none', color: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            transition: 'transform 0.15s', position: 'relative', minHeight: '140px'
        }}>
            {badge && badge > 0 ? (
                <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: '#dc2626', color: 'white', borderRadius: '999px', width: '1.75rem', height: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800 }}>
                    {badge}
                </span>
            ) : null}
            <span style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{emoji}</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
        </a>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f0f7ff', fontFamily: 'Inter,system-ui,sans-serif' }}>
            {/* Header */}
            <div style={{ background: '#0f4c81', color: 'white', padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <p style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '0.2rem' }}>Hoş geldiniz</p>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{patient.name}</h1>
                        <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.25rem' }}>Kod: {patient.accessCode}</p>
                    </div>
                    <button onClick={logout} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.625rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                        Çıkış
                    </button>
                </div>
            </div>

            <div style={{ padding: '1.5rem', maxWidth: '28rem', margin: '0 auto' }}>
                {/* Last readings summary */}
                {(lastGlucose || lastWagner) && (
                    <div style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', gap: '1rem' }}>
                        {lastGlucose && (
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Son Kan Şekeri</p>
                                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: glucoseColor }}>{lastGlucose.value}</p>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>mg/dL</p>
                            </div>
                        )}
                        {lastGlucose && lastWagner && <div style={{ width: '1px', background: '#e2e8f0' }} />}
                        {lastWagner && (
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Son Wagner</p>
                                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: wagnerColor }}>Grade {lastWagner.grade}</p>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>yara derecesi</p>
                            </div>
                        )}
                    </div>
                )}

                {/* 3 big buttons */}
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {bigBtn('🩸', 'Kan Şekeri Gir', '/hasta/kan-sekeri', '#1d4ed8')}
                    {bigBtn('🦶', 'Yara Durumu Bildir', '/hasta/yara-durumu', '#0f766e')}
                    {bigBtn('📞', 'Doktoruma Ulaş', '/hasta/doktoruma-ulas', '#7c3aed', unreadCount)}
                </div>

                {/* Doctor info */}
                {patient.doctor && (
                    <div style={{ marginTop: '1.5rem', background: '#eff6ff', borderRadius: '1rem', padding: '1.25rem', border: '1.5px solid #bfdbfe' }}>
                        <p style={{ fontSize: '0.9rem', color: '#1e3a8a', fontWeight: 700, marginBottom: '0.5rem' }}>🏥 {patient.doctor.clinicName}</p>
                        {patient.doctor.phone && (
                            <p style={{ fontSize: '1rem', color: '#1d4ed8' }}>📱 {patient.doctor.phone}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
