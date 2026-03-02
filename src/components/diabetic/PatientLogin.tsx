import { useState } from 'react';

export default function PatientLogin() {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const s = {
        page: { minHeight: '100vh', background: 'linear-gradient(135deg,#0f4c81,#1d6fa5)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '1.5rem' },
        card: { background: 'white', borderRadius: '1.5rem', padding: '2.5rem 2rem', width: '100%', maxWidth: '22rem', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', textAlign: 'center' as const },
        title: { fontSize: '2rem', fontWeight: 800, color: '#0f4c81', marginBottom: '0.5rem' },
        sub: { color: '#64748b', fontSize: '1.15rem', marginBottom: '2rem', lineHeight: 1.4 },
        codeInput: { width: '100%', padding: '1.25rem', border: '3px solid #e2e8f0', borderRadius: '1rem', fontSize: '2rem', textAlign: 'center' as const, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, outline: 'none', boxSizing: 'border-box' as const, marginBottom: '1.25rem', color: '#0f4c81' },
        btn: { width: '100%', padding: '1.25rem', background: '#0f4c81', color: 'white', border: 'none', borderRadius: '1rem', fontSize: '1.35rem', fontWeight: 800, cursor: 'pointer', transition: 'background 0.2s' },
        error: { background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: '0.75rem', padding: '1rem', color: '#b91c1c', fontSize: '1.1rem', marginBottom: '1rem' },
        back: { display: 'block', marginTop: '1.5rem', color: '#64748b', fontSize: '1rem', textDecoration: 'none' },
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (code.trim().length < 7) { setError('Lütfen tam kodu girin (örn: DYK-4A2X)'); return; }
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/hasta/giris', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim().toUpperCase() })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            localStorage.setItem('patientSession', JSON.stringify({ ...data.patient, type: 'patient', doctor: data.doctor }));
            window.location.href = '/hasta';
        } catch { setError('Bağlantı hatası. Lütfen tekrar deneyin.'); }
        finally { setLoading(false); }
    }

    function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
        let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
        // Auto-insert dash after 3 chars
        if (val.length === 3 && !val.includes('-')) val = val + '-';
        if (val.length > 8) val = val.slice(0, 8);
        setCode(val);
    }

    return (
        <div style={s.page}>
            <div style={s.card}>
                <div style={{ fontSize: '4rem', marginBottom: '0.75rem' }}>🏥</div>
                <h1 style={s.title}>Hasta Girişi</h1>
                <p style={s.sub}>Doktorunuzdan aldığınız kodu girin</p>

                {error && <div style={s.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input
                        style={s.codeInput}
                        value={code}
                        onChange={handleCodeChange}
                        placeholder="DYK-4A2X"
                        maxLength={8}
                        autoComplete="off"
                        autoCapitalize="characters"
                    />
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                        Örnek: ABC-1234
                    </p>
                    <button style={s.btn} type="submit" disabled={loading}>
                        {loading ? 'Kontrol ediliyor...' : 'Giriş Yap'}
                    </button>
                </form>

                <a href="/" style={s.back}>← Ana sayfaya dön</a>
            </div>
        </div>
    );
}
