import { useState } from 'react';

type Tab = 'login' | 'register';

export default function DoctorLogin() {
    const [tab, setTab] = useState<Tab>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [clinicName, setClinicName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const s = {
        page: { minHeight: '100vh', background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' } as React.CSSProperties,
        card: { background: 'white', borderRadius: '1.25rem', padding: '2.5rem', width: '100%', maxWidth: '26rem', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' } as React.CSSProperties,
        title: { fontSize: '1.75rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.25rem', textAlign: 'center' } as React.CSSProperties,
        sub: { color: '#64748b', fontSize: '1rem', textAlign: 'center', marginBottom: '1.75rem' } as React.CSSProperties,
        tabRow: { display: 'flex', borderRadius: '0.75rem', overflow: 'hidden', border: '2px solid #e2e8f0', marginBottom: '1.75rem' } as React.CSSProperties,
        tabBtn: (active: boolean) => ({ flex: 1, padding: '0.75rem', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', background: active ? '#1d4ed8' : 'white', color: active ? 'white' : '#64748b', transition: 'all 0.15s' }) as React.CSSProperties,
        label: { display: 'block', fontWeight: 600, fontSize: '1rem', color: '#374151', marginBottom: '0.4rem' } as React.CSSProperties,
        input: { width: '100%', padding: '0.85rem 1rem', border: '2px solid #e2e8f0', borderRadius: '0.75rem', fontSize: '1.05rem', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' } as React.CSSProperties,
        btn: { width: '100%', padding: '1rem', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '0.75rem', fontSize: '1.15rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' } as React.CSSProperties,
        error: { background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '0.6rem', padding: '0.75rem 1rem', color: '#b91c1c', fontSize: '0.95rem', marginBottom: '1rem' } as React.CSSProperties,
        back: { display: 'block', textAlign: 'center', marginTop: '1.25rem', color: '#64748b', fontSize: '0.95rem', textDecoration: 'none' } as React.CSSProperties
    };

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/doktor/giris', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            localStorage.setItem('doctorSession', JSON.stringify({ ...data, type: 'doctor' }));
            window.location.href = '/doktor';
        } catch { setError('Bağlantı hatası. Lütfen tekrar deneyin.'); }
        finally { setLoading(false); }
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/doktor/kayit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, clinicName, phone })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            localStorage.setItem('doctorSession', JSON.stringify({ ...data, type: 'doctor' }));
            window.location.href = '/doktor';
        } catch { setError('Bağlantı hatası. Lütfen tekrar deneyin.'); }
        finally { setLoading(false); }
    }

    return (
        <div style={s.page}>
            <div style={s.card}>
                <div style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '0.75rem' }}>👨‍⚕️</div>
                <h1 style={s.title}>Doktor Paneli</h1>
                <p style={s.sub}>DiyabetikAyak Takip Sistemi</p>

                <div style={s.tabRow}>
                    <button style={s.tabBtn(tab === 'login')} onClick={() => { setTab('login'); setError(''); }}>Giriş Yap</button>
                    <button style={s.tabBtn(tab === 'register')} onClick={() => { setTab('register'); setError(''); }}>Kayıt Ol</button>
                </div>

                {error && <div style={s.error}>{error}</div>}

                {tab === 'login' ? (
                    <form onSubmit={handleLogin}>
                        <label style={s.label}>E-posta</label>
                        <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="doktor@klinik.com" />
                        <label style={s.label}>Şifre</label>
                        <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                        <button style={s.btn} type="submit" disabled={loading}>
                            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister}>
                        <label style={s.label}>Klinik / Hastane Adı</label>
                        <input style={s.input} type="text" value={clinicName} onChange={e => setClinicName(e.target.value)} required placeholder="Orthosolve Kliniği" />
                        <label style={s.label}>E-posta</label>
                        <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="doktor@klinik.com" />
                        <label style={s.label}>Şifre</label>
                        <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="En az 6 karakter" minLength={6} />
                        <label style={s.label}>Telefon (opsiyonel)</label>
                        <input style={s.input} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0212 XXX XX XX" />
                        <button style={s.btn} type="submit" disabled={loading}>
                            {loading ? 'Kaydediliyor...' : 'Hesap Oluştur'}
                        </button>
                    </form>
                )}

                <a href="/" style={s.back}>← Ana sayfaya dön</a>
            </div>
        </div>
    );
}
