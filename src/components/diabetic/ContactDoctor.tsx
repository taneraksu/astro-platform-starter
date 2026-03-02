import { useState, useEffect, useRef } from 'react';

interface Message {
    id: string;
    senderType: 'doctor' | 'patient';
    content: string;
    createdAt: string;
    read: boolean;
}

interface PatientSession {
    id: string;
    name: string;
    doctorId: string;
    doctor?: { clinicName: string; phone?: string; email: string };
}

export default function ContactDoctor() {
    const [patient, setPatient] = useState<PatientSession | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMsg, setNewMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const session = localStorage.getItem('patientSession');
        if (!session) { window.location.href = '/hasta/giris'; return; }
        const p = JSON.parse(session);
        setPatient(p);
        loadMessages(p.id);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function loadMessages(patientId: string) {
        setLoading(true);
        try {
            const res = await fetch(`/api/mesajlar?patientId=${patientId}&readerType=patient`);
            const data = await res.json();
            if (Array.isArray(data)) setMessages(data);
        } finally { setLoading(false); }
    }

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (!newMsg.trim() || !patient) return;
        setSending(true);
        try {
            const res = await fetch('/api/mesajlar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId: patient.id, doctorId: patient.doctorId, senderType: 'patient', content: newMsg.trim() })
            });
            if (res.ok) {
                setNewMsg('');
                await loadMessages(patient.id);
            }
        } finally { setSending(false); }
    }

    const s = {
        page: { minHeight: '100vh', background: '#faf5ff', display: 'flex', flexDirection: 'column' as const, fontFamily: 'Inter,system-ui,sans-serif' },
        header: { background: '#7c3aed', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' },
        doctorCard: { background: 'white', margin: '1rem', borderRadius: '1rem', padding: '1.25rem', border: '2px solid #ede9fe', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
        msgArea: { flex: 1, overflowY: 'auto' as const, padding: '0 1rem 1rem' },
        msgDoctor: { background: '#ede9fe', borderRadius: '1rem 1rem 1rem 0.25rem', padding: '0.875rem 1rem', maxWidth: '80%', marginBottom: '0.75rem' } as React.CSSProperties,
        msgPatient: { background: '#7c3aed', color: 'white', borderRadius: '1rem 1rem 0.25rem 1rem', padding: '0.875rem 1rem', maxWidth: '80%', marginLeft: 'auto', marginBottom: '0.75rem' } as React.CSSProperties,
        inputArea: { background: 'white', borderTop: '1px solid #ede9fe', padding: '1rem' },
        inputRow: { display: 'flex', gap: '0.625rem', alignItems: 'flex-end' },
        textarea: { flex: 1, padding: '0.875rem', border: '2px solid #ede9fe', borderRadius: '0.875rem', fontSize: '1.05rem', resize: 'none' as const, outline: 'none', minHeight: '52px', maxHeight: '120px' },
        sendBtn: { background: '#7c3aed', color: 'white', border: 'none', borderRadius: '0.875rem', padding: '0.875rem 1.25rem', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700 },
    };

    if (!patient) return null;

    function formatTime(dt: string) {
        return new Date(dt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }

    return (
        <div style={s.page}>
            <div style={s.header}>
                <a href="/hasta" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem' }}>←</a>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>📞 Doktoruma Ulaş</h1>
            </div>

            {/* Doctor info */}
            {patient.doctor && (
                <div style={s.doctorCard}>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#7c3aed', marginBottom: '0.75rem' }}>🏥 {patient.doctor.clinicName}</p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const }}>
                        {patient.doctor.phone && (
                            <a href={`tel:${patient.doctor.phone}`}
                               style={{ background: '#7c3aed', color: 'white', borderRadius: '0.625rem', padding: '0.625rem 1rem', textDecoration: 'none', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                📱 Ara
                            </a>
                        )}
                        {patient.doctor.phone && (
                            <a href={`https://wa.me/${patient.doctor.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener"
                               style={{ background: '#16a34a', color: 'white', borderRadius: '0.625rem', padding: '0.625rem 1rem', textDecoration: 'none', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                💬 WhatsApp
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Messages */}
            <div style={s.msgArea}>
                {loading && <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Mesajlar yükleniyor...</p>}
                {!loading && messages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                        <p style={{ fontSize: '1.05rem' }}>Henüz mesaj yok. Doktorunuza mesaj gönderin.</p>
                    </div>
                )}
                {messages.map(m => (
                    <div key={m.id} style={m.senderType === 'doctor' ? {} : { display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={m.senderType === 'doctor' ? s.msgDoctor : s.msgPatient}>
                            {m.senderType === 'doctor' && <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed', marginBottom: '0.25rem' }}>👨‍⚕️ Doktor</p>}
                            <p style={{ fontSize: '1.05rem', lineHeight: 1.5 }}>{m.content}</p>
                            <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.25rem' }}>{formatTime(m.createdAt)}</p>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={s.inputArea}>
                <form onSubmit={sendMessage} style={s.inputRow}>
                    <textarea
                        style={s.textarea}
                        value={newMsg}
                        onChange={e => setNewMsg(e.target.value)}
                        placeholder="Mesajınızı yazın..."
                        rows={1}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                    />
                    <button style={s.sendBtn} type="submit" disabled={sending || !newMsg.trim()}>
                        {sending ? '...' : '➤'}
                    </button>
                </form>
            </div>
        </div>
    );
}
