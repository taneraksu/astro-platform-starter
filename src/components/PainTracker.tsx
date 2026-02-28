import { useState, useEffect } from 'react';

interface PainEntry {
    id: string;
    date: string;
    time: string;
    painScore: number;
    location: string;
    character: string[];
    swelling: 'yok' | 'hafif' | 'orta' | 'şiddetli';
    warmth: boolean;
    medications: string;
    activities: string;
    notes: string;
}

const PAIN_COLORS = [
    '#22c55e','#4ade80','#a3e635','#d9f99d','#fef08a',
    '#fde047','#fb923c','#f97316','#ef4444','#dc2626','#991b1b',
];

const PAIN_LABELS = [
    'Ağrı yok','Çok hafif','Hafif','Orta','Orta','Orta',
    'Orta-şiddetli','Şiddetli','Çok şiddetli','Dayanılmaz','Dayanılmaz',
];

const PAIN_CHARACTERS = [
    'Sızı','Keskin','Yanma','Zonklama','Bıçak gibi',
    'Sertlik','Hassasiyet','Kramp','Baskı','Uyuşma/karıncalanma',
];

const STORAGE_KEY = 'arthrocare-pain-log';

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getEntries(): PainEntry[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch { return []; }
}

function saveEntries(entries: PainEntry[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch {}
}

export default function PainTracker() {
    const [entries, setEntries] = useState<PainEntry[]>([]);
    const [view, setView] = useState<'log' | 'history' | 'report'>('log');
    const [form, setForm] = useState<Omit<PainEntry, 'id'>>({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        painScore: 3,
        location: 'diz-sag',
        character: [],
        swelling: 'yok',
        warmth: false,
        medications: '',
        activities: '',
        notes: '',
    });
    const [saved, setSaved] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => { setEntries(getEntries()); }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newEntry: PainEntry = { ...form, id: generateId() };
        const updated = [newEntry, ...entries];
        setEntries(updated);
        saveEntries(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setForm(prev => ({
            ...prev,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            notes: '', medications: '', activities: '',
        }));
    };

    const deleteEntry = (id: string) => {
        const updated = entries.filter(e => e.id !== id);
        setEntries(updated);
        saveEntries(updated);
        setDeleteConfirm(null);
    };

    const toggleCharacter = (char: string) => {
        setForm(prev => ({
            ...prev,
            character: prev.character.includes(char)
                ? prev.character.filter(c => c !== char)
                : [...prev.character, char],
        }));
    };

    const last7Days = entries.filter(e => {
        const d = new Date(e.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo;
    });

    const avgPain = last7Days.length > 0
        ? (last7Days.reduce((a, b) => a + b.painScore, 0) / last7Days.length).toFixed(1) : 'Yok';
    const maxPain = last7Days.length > 0 ? Math.max(...last7Days.map(e => e.painScore)) : 'Yok';
    const minPain = last7Days.length > 0 ? Math.min(...last7Days.map(e => e.painScore)) : 'Yok';

    const formatDate = (dateStr: string) =>
        new Date(dateStr + 'T00:00:00').toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            {/* View Toggle */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
                {([['log', '+ Ağrı Kaydet'], ['history', 'Geçmiş'], ['report', 'Rapor']] as const).map(([v, label]) => (
                    <button
                        key={v}
                        onClick={() => setView(v)}
                        className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors bg-transparent cursor-pointer ${view === v ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* LOG VIEW */}
            {view === 'log' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {saved && (
                        <div className="alert alert-success">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            Ağrı kaydı başarıyla eklendi!
                        </div>
                    )}

                    <div className="card">
                        <h3 className="font-semibold text-slate-900 mb-4">Tarih ve Saat</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Tarih</label>
                                <input type="date" className="input" value={form.date}
                                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="label">Saat</label>
                                <input type="time" className="input" value={form.time}
                                    onChange={e => setForm(p => ({ ...p, time: e.target.value }))} required />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="font-semibold text-slate-900 mb-4">
                            Ağrı Skoru: <span style={{ color: PAIN_COLORS[form.painScore] }} className="text-2xl font-bold">{form.painScore}/10</span>
                            <span className="ml-2 text-base font-normal text-slate-500">— {PAIN_LABELS[form.painScore]}</span>
                        </h3>
                        <input type="range" min="0" max="10" step="1" value={form.painScore}
                            onChange={e => setForm(p => ({ ...p, painScore: Number(e.target.value) }))}
                            className="w-full h-3 rounded-full cursor-pointer mb-3"
                            style={{ accentColor: PAIN_COLORS[form.painScore] }}
                        />
                        <div className="flex justify-between text-xs text-slate-500 mb-3">
                            <span>0 — Ağrı yok</span><span>5 — Orta</span><span>10 — Dayanılmaz</span>
                        </div>
                        <div className="flex justify-between">
                            {Array.from({ length: 11 }, (_, i) => (
                                <button key={i} type="button" onClick={() => setForm(p => ({ ...p, painScore: i }))}
                                    className={`w-7 h-7 rounded-full text-xs font-bold border-2 transition-all ${form.painScore === i ? 'scale-125 border-slate-400' : 'border-slate-200 hover:scale-110'}`}
                                    style={{ backgroundColor: PAIN_COLORS[i], color: i > 7 ? 'white' : '#1e293b' }}>
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="font-semibold text-slate-900 mb-4">Ağrı Detayları</h3>
                        <div className="mb-4">
                            <label className="label">Lokasyon</label>
                            <select className="input" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}>
                                <option value="sol-kalca">Sol Kalça</option>
                                <option value="sag-kalca">Sağ Kalça</option>
                                <option value="sol-diz">Sol Diz</option>
                                <option value="sag-diz">Sağ Diz</option>
                                <option value="her-iki-kalca">Her İki Kalça</option>
                                <option value="her-iki-diz">Her İki Diz</option>
                                <option value="bel">Bel</option>
                                <option value="uyluk">Uyluk</option>
                                <option value="baldır">Baldır (Önemli — DVT belirtisi olabilir)</option>
                                <option value="diger">Diğer</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Ağrı Niteliği (Uygun olanları seçin)</label>
                            <div className="flex flex-wrap gap-2">
                                {PAIN_CHARACTERS.map(char => (
                                    <button key={char} type="button" onClick={() => toggleCharacter(char)}
                                        className={`px-3 py-1.5 rounded-full text-sm border-2 transition-colors ${form.character.includes(char) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                                        {char}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="font-semibold text-slate-900 mb-4">Şişlik ve Sıcaklık</h3>
                        <div className="mb-4">
                            <label className="label">Şişlik Düzeyi</label>
                            <div className="flex gap-2">
                                {(['yok', 'hafif', 'orta', 'şiddetli'] as const).map(level => (
                                    <button key={level} type="button" onClick={() => setForm(p => ({ ...p, swelling: level }))}
                                        className={`flex-1 py-2 px-2 rounded-lg text-sm border-2 transition-colors capitalize ${form.swelling === level ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={form.warmth}
                                onChange={e => setForm(p => ({ ...p, warmth: e.target.checked }))}
                                className="w-4 h-4 rounded border-slate-300 accent-blue-600" />
                            <div>
                                <span className="font-medium text-slate-800">Eklem dokunulduğunda ılık veya sıcak hissettiriyor</span>
                                {form.warmth && <p className="text-xs text-amber-600 mt-0.5">⚠ Sıcaklık + ağrı + ateş enfeksiyon belirtisi olabilir — cerrahınıza başvurun</p>}
                            </div>
                        </label>
                    </div>

                    <div className="card">
                        <h3 className="font-semibold text-slate-900 mb-4">Bağlam Bilgisi</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="label">Bugün alınan ilaçlar</label>
                                <input type="text" className="input" placeholder="Örn: Parasetamol 500mg, İbuprofen 400mg"
                                    value={form.medications} onChange={e => setForm(p => ({ ...p, medications: e.target.value }))} />
                            </div>
                            <div>
                                <label className="label">Bugün yapılan aktiviteler</label>
                                <input type="text" className="input" placeholder="Örn: Egzersizler, kısa yürüyüş, fizyoterapi seansı"
                                    value={form.activities} onChange={e => setForm(p => ({ ...p, activities: e.target.value }))} />
                            </div>
                            <div>
                                <label className="label">Ek Notlar</label>
                                <textarea className="input min-h-20 resize-none"
                                    placeholder="Doktorunuza sormak istediğiniz gözlemler veya sorular..."
                                    value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg w-full">
                        Ağrı Kaydını Kaydet
                    </button>
                </form>
            )}

            {/* HISTORY VIEW */}
            {view === 'history' && (
                <div>
                    {entries.length === 0 ? (
                        <div className="card text-center py-12">
                            <div className="text-4xl mb-3">📊</div>
                            <p className="text-slate-500">Henüz kayıt yok. Ağrı Kaydet sekmesinden kayıt eklemeye başlayın.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {entries.map(entry => (
                                <div key={entry.id} className="card">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                                            style={{ backgroundColor: PAIN_COLORS[entry.painScore] + '33', color: PAIN_COLORS[entry.painScore] }}>
                                            {entry.painScore}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="font-semibold text-slate-900">
                                                    {formatDate(entry.date)} — {entry.time}
                                                </span>
                                                <span className="badge badge-blue capitalize">
                                                    {entry.location.replace(/-/g, ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600">
                                                {PAIN_LABELS[entry.painScore]}
                                                {entry.character.length > 0 && ` — ${entry.character.join(', ')}`}
                                            </p>
                                            {entry.swelling !== 'yok' && (
                                                <p className="text-xs text-amber-600 mt-0.5">
                                                    Şişlik: {entry.swelling}{entry.warmth ? ' · Eklem sıcak' : ''}
                                                </p>
                                            )}
                                            {entry.medications && <p className="text-xs text-slate-500 mt-0.5">💊 {entry.medications}</p>}
                                            {entry.notes && <p className="text-xs text-slate-500 mt-1 italic">&ldquo;{entry.notes}&rdquo;</p>}
                                        </div>
                                        <div className="flex-shrink-0">
                                            {deleteConfirm === entry.id ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => deleteEntry(entry.id)} className="btn btn-danger btn-sm">Sil</button>
                                                    <button onClick={() => setDeleteConfirm(null)} className="btn btn-ghost btn-sm">İptal</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setDeleteConfirm(entry.id)} className="text-slate-300 hover:text-red-400 transition-colors" aria-label="Kaydı sil">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* REPORT VIEW */}
            {view === 'report' && (
                <div>
                    <div className="card mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-900">Son 7 Günün Özeti</h3>
                            {last7Days.length > 0 && (
                                <button onClick={handlePrint} className="btn btn-primary btn-sm no-print">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
                                    </svg>
                                    PDF / Yazdır
                                </button>
                            )}
                        </div>
                        {last7Days.length === 0 ? (
                            <p className="text-slate-500 text-sm">Son 7 günde kayıt yok.</p>
                        ) : (
                            <>
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-700">{avgPain}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">Ortalama Ağrı</div>
                                    </div>
                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                        <div className="text-2xl font-bold text-red-600">{maxPain}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">En Yüksek</div>
                                    </div>
                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">{minPain}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">En Düşük</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Ağrı Skoru Trendi</p>
                                    {last7Days.slice(0, 10).map(entry => (
                                        <div key={entry.id} className="flex items-center gap-3">
                                            <span className="text-xs text-slate-500 w-28 flex-shrink-0">{formatDate(entry.date)}</span>
                                            <div className="flex-1 bg-slate-100 rounded-full h-5 relative">
                                                <div className="h-5 rounded-full flex items-center justify-end pr-2 transition-all"
                                                    style={{ width: `${(entry.painScore / 10) * 100}%`, backgroundColor: PAIN_COLORS[entry.painScore], minWidth: '2rem' }}>
                                                    <span className="text-xs font-bold" style={{ color: entry.painScore > 7 ? 'white' : '#1e293b' }}>
                                                        {entry.painScore}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Printable Report */}
                    <div className="card print-section" id="print-report">
                        <h3 className="font-semibold text-slate-900 mb-3">Doktorunuz İçin Rapor</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            Bu raporu bir sonraki randevunuzda cerrahınıza veya pratisyen hekiminize gösterin. Ağrı düzeylerinizi, ilaçlarınızı ve endişelerinizi özetler.
                        </p>
                        {last7Days.length > 0 ? (
                            <div className="bg-slate-50 rounded-lg p-4 font-mono text-xs text-slate-700 space-y-1">
                                <p className="font-bold text-slate-900">Op Dr Taner Aksu Protez Takip Ağrı Raporu — Son 7 Gün</p>
                                <p>Oluşturma tarihi: {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p>Toplam kayıt: {last7Days.length}</p>
                                <p>Ortalama ağrı: {avgPain}/10 | En yüksek: {maxPain}/10 | En düşük: {minPain}/10</p>
                                <p className="pt-2 font-bold">Kayıtlar:</p>
                                {last7Days.slice(0, 14).map(e => (
                                    <p key={e.id}>
                                        {e.date} {e.time} — Skor: {e.painScore}/10 ({e.location.replace(/-/g, ' ')})
                                        {e.character.length > 0 ? ` [${e.character.join(', ')}]` : ''}
                                        {e.medications ? ` İlaç: ${e.medications}` : ''}
                                        {e.notes ? ` Not: ${e.notes}` : ''}
                                    </p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm">Raporlanacak yakın tarihli kayıt yok.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
