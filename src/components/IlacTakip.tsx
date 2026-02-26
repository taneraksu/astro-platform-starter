import { useState, useEffect } from 'react';

interface Medication {
    id: string;
    name: string;
    dose: string;
    frequency: string;
    times: string[];
    purpose: string;
    startDate: string;
    endDate: string;
    notes: string;
    active: boolean;
}

interface DoseLog {
    medicationId: string;
    date: string;
    time: string;
    taken: boolean;
}

const STORAGE_KEY_MEDS = 'arthrocare-ilaclar';
const STORAGE_KEY_LOG = 'arthrocare-ilac-log';

const FREQUENCY_OPTIONS = [
    { value: '1x', label: 'Günde 1 kez' },
    { value: '2x', label: 'Günde 2 kez' },
    { value: '3x', label: 'Günde 3 kez' },
    { value: '4x', label: 'Günde 4 kez' },
    { value: 'sabah', label: 'Sadece sabah' },
    { value: 'aksam', label: 'Sadece akşam' },
    { value: 'agri', label: 'Ağrı durumunda (gerektiğinde)' },
    { value: 'diger', label: 'Diğer' },
];

const PURPOSE_OPTIONS = [
    'Ağrı kesici',
    'Antikoagülant (kan sulandırıcı)',
    'Antibiyotik',
    'Anti-inflamatuar (NSAİİ)',
    'Mide koruyucu',
    'Uyku düzenleyici',
    'Tansiyon ilacı',
    'Kan şekeri ilacı',
    'Vitamin / Takviye',
    'Diğer',
];

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getMedications(): Medication[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_MEDS) || '[]'); } catch { return []; }
}

function saveMedications(meds: Medication[]) {
    try { localStorage.setItem(STORAGE_KEY_MEDS, JSON.stringify(meds)); } catch {}
}

function getDoseLog(): DoseLog[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_LOG) || '[]'); } catch { return []; }
}

function saveDoseLog(log: DoseLog[]) {
    try { localStorage.setItem(STORAGE_KEY_LOG, JSON.stringify(log)); } catch {}
}

function getTodayStr() {
    return new Date().toISOString().split('T')[0];
}

function getNowTimeStr() {
    return new Date().toTimeString().slice(0, 5);
}

export default function IlacTakip() {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [doseLog, setDoseLog] = useState<DoseLog[]>([]);
    const [view, setView] = useState<'today' | 'meds' | 'history'>('today');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [form, setForm] = useState<Omit<Medication, 'id'>>({
        name: '', dose: '', frequency: '2x', times: [], purpose: 'Ağrı kesici',
        startDate: getTodayStr(), endDate: '', notes: '', active: true,
    });

    useEffect(() => {
        setMedications(getMedications());
        setDoseLog(getDoseLog());
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let updated: Medication[];
        if (editingId) {
            updated = medications.map(m => m.id === editingId ? { ...form, id: editingId } : m);
        } else {
            updated = [...medications, { ...form, id: generateId() }];
        }
        setMedications(updated);
        saveMedications(updated);
        setForm({ name: '', dose: '', frequency: '2x', times: [], purpose: 'Ağrı kesici', startDate: getTodayStr(), endDate: '', notes: '', active: true });
        setShowForm(false);
        setEditingId(null);
    };

    const logDose = (medicationId: string) => {
        const entry: DoseLog = { medicationId, date: getTodayStr(), time: getNowTimeStr(), taken: true };
        const updated = [...doseLog, entry];
        setDoseLog(updated);
        saveDoseLog(updated);
    };

    const toggleActive = (id: string) => {
        const updated = medications.map(m => m.id === id ? { ...m, active: !m.active } : m);
        setMedications(updated);
        saveMedications(updated);
    };

    const deleteMedication = (id: string) => {
        const updated = medications.filter(m => m.id !== id);
        setMedications(updated);
        saveMedications(updated);
        setDeleteConfirm(null);
    };

    const startEdit = (med: Medication) => {
        setForm({ name: med.name, dose: med.dose, frequency: med.frequency, times: med.times, purpose: med.purpose, startDate: med.startDate, endDate: med.endDate, notes: med.notes, active: med.active });
        setEditingId(med.id);
        setShowForm(true);
        setView('meds');
    };

    const todayStr = getTodayStr();
    const todayDoses = doseLog.filter(d => d.date === todayStr);
    const activeMeds = medications.filter(m => m.active);

    const getTodayDoseCount = (medId: string) => todayDoses.filter(d => d.medicationId === medId).length;

    const freqLabel = (f: string) => FREQUENCY_OPTIONS.find(o => o.value === f)?.label || f;

    const purposeColors: Record<string, string> = {
        'Ağrı kesici': 'bg-blue-100 text-blue-700',
        'Antikoagülant (kan sulandırıcı)': 'bg-red-100 text-red-700',
        'Antibiyotik': 'bg-green-100 text-green-700',
        'Anti-inflamatuar (NSAİİ)': 'bg-orange-100 text-orange-700',
        'Mide koruyucu': 'bg-purple-100 text-purple-700',
        'Vitamin / Takviye': 'bg-teal-100 text-teal-700',
    };

    return (
        <div>
            {/* View Toggle */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
                {([['today', '📋 Bugün'], ['meds', '💊 İlaçlarım'], ['history', '📊 Geçmiş']] as const).map(([v, label]) => (
                    <button key={v} onClick={() => setView(v)}
                        className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors bg-transparent cursor-pointer ${view === v ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* TODAY VIEW */}
            {view === 'today' && (
                <div>
                    <div className="card mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-slate-900">Bugün</h3>
                            <span className="text-sm text-slate-500">
                                {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500">
                            {activeMeds.length === 0
                                ? 'Aktif ilaç yok. İlaçlar sekmesinden ilaç ekleyin.'
                                : `${activeMeds.length} aktif ilaç — bugün aldığınız dozları kaydedin.`}
                        </p>
                    </div>

                    {activeMeds.length === 0 ? (
                        <div className="card text-center py-10">
                            <div className="text-4xl mb-3">💊</div>
                            <p className="text-slate-500 mb-3">Henüz ilaç eklenmedi.</p>
                            <button onClick={() => { setView('meds'); setShowForm(true); }} className="btn btn-primary btn-sm">
                                İlaç Ekle
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeMeds.map(med => {
                                const doseCount = getTodayDoseCount(med.id);
                                return (
                                    <div key={med.id} className="card">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">💊</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-slate-900">{med.name}</h3>
                                                    {med.dose && <span className="badge badge-blue text-xs">{med.dose}</span>}
                                                    <span className={`badge text-xs ${purposeColors[med.purpose] || 'badge-blue'}`}>{med.purpose}</span>
                                                </div>
                                                <p className="text-sm text-slate-500">{freqLabel(med.frequency)}</p>
                                                {med.notes && <p className="text-xs text-slate-400 mt-0.5">{med.notes}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 mt-3">
                                            <div className="text-sm text-slate-600">
                                                Bugün alındı: <strong>{doseCount}</strong> kez
                                            </div>
                                            <div className="flex-1" />
                                            <button onClick={() => logDose(med.id)} className="btn btn-success btn-sm">
                                                ✓ Doz Aldım
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* MEDICATIONS MANAGEMENT VIEW */}
            {view === 'meds' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-slate-500">{medications.length} ilaç kayıtlı</p>
                        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', dose: '', frequency: '2x', times: [], purpose: 'Ağrı kesici', startDate: getTodayStr(), endDate: '', notes: '', active: true }); }}
                            className="btn btn-primary btn-sm">
                            {showForm ? '✕ İptal' : '+ Yeni İlaç'}
                        </button>
                    </div>

                    {showForm && (
                        <form onSubmit={handleSubmit} className="card mb-6 border-2 border-blue-200">
                            <h3 className="font-semibold text-slate-900 mb-4">{editingId ? 'İlacı Düzenle' : 'Yeni İlaç Ekle'}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="label">İlaç Adı *</label>
                                    <input type="text" className="input" required placeholder="Örn: Parasetamol, Oksikodone" value={form.name}
                                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">Doz</label>
                                    <input type="text" className="input" placeholder="Örn: 500mg, 10mg" value={form.dose}
                                        onChange={e => setForm(p => ({ ...p, dose: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">Sıklık</label>
                                    <select className="input" value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}>
                                        {FREQUENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Kullanım Amacı</label>
                                    <select className="input" value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))}>
                                        {PURPOSE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Başlangıç Tarihi</label>
                                    <input type="date" className="input" value={form.startDate}
                                        onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="label">Bitiş Tarihi (opsiyonel)</label>
                                    <input type="date" className="input" value={form.endDate}
                                        onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="label">Notlar</label>
                                <input type="text" className="input" placeholder="Örn: Yemekle al, sabah ve akşam" value={form.notes}
                                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="btn btn-primary">{editingId ? 'Güncelle' : 'İlaç Ekle'}</button>
                                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn btn-ghost">İptal</button>
                            </div>
                        </form>
                    )}

                    {medications.length === 0 ? (
                        <div className="card text-center py-10">
                            <div className="text-4xl mb-3">💊</div>
                            <p className="text-slate-500 mb-3">Henüz ilaç eklenmedi.</p>
                            <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">İlk İlacı Ekle</button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {medications.map(med => (
                                <div key={med.id} className={`card ${!med.active ? 'opacity-60' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${med.active ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                            {med.active ? '💊' : '⬜'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-slate-900">{med.name}</h3>
                                                {med.dose && <span className="badge badge-blue text-xs">{med.dose}</span>}
                                                <span className={`badge text-xs ${purposeColors[med.purpose] || 'badge-blue'}`}>{med.purpose}</span>
                                                {!med.active && <span className="badge bg-slate-100 text-slate-500 text-xs">Pasif</span>}
                                            </div>
                                            <p className="text-sm text-slate-500">{freqLabel(med.frequency)}</p>
                                            {med.startDate && (
                                                <p className="text-xs text-slate-400">
                                                    {new Date(med.startDate + 'T00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    {med.endDate ? ` — ${new Date(med.endDate + 'T00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}` : ' — devam ediyor'}
                                                </p>
                                            )}
                                            {med.notes && <p className="text-xs text-slate-400 mt-0.5">{med.notes}</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3 flex-wrap">
                                        <button onClick={() => toggleActive(med.id)} className={`btn btn-sm ${med.active ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'btn-primary'}`}>
                                            {med.active ? 'Pasif Et' : 'Aktif Et'}
                                        </button>
                                        <button onClick={() => startEdit(med)} className="btn btn-ghost btn-sm">Düzenle</button>
                                        <div className="flex-1" />
                                        {deleteConfirm === med.id ? (
                                            <>
                                                <button onClick={() => deleteMedication(med.id)} className="btn btn-danger btn-sm">Sil</button>
                                                <button onClick={() => setDeleteConfirm(null)} className="btn btn-ghost btn-sm">İptal</button>
                                            </>
                                        ) : (
                                            <button onClick={() => setDeleteConfirm(med.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* HISTORY VIEW */}
            {view === 'history' && (
                <div>
                    <div className="card">
                        <h3 className="font-semibold text-slate-900 mb-4">Son 7 Günün Doz Geçmişi</h3>
                        {doseLog.length === 0 ? (
                            <p className="text-slate-500 text-sm">Henüz doz kaydı yok. Bugün sekmesinden doz alındığını işaretleyin.</p>
                        ) : (
                            (() => {
                                const last7 = [...new Set(doseLog.map(d => d.date))]
                                    .sort((a, b) => b.localeCompare(a))
                                    .slice(0, 7);
                                return (
                                    <div className="space-y-4">
                                        {last7.map(date => {
                                            const dayDoses = doseLog.filter(d => d.date === date);
                                            return (
                                                <div key={date}>
                                                    <p className="text-sm font-semibold text-slate-600 mb-2">
                                                        {new Date(date + 'T00:00').toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                    </p>
                                                    <div className="space-y-1.5 pl-3 border-l-2 border-slate-200">
                                                        {dayDoses.map((dose, i) => {
                                                            const med = medications.find(m => m.id === dose.medicationId);
                                                            return (
                                                                <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                                                    <span className="text-green-500">✓</span>
                                                                    <span className="font-medium">{med?.name || 'Bilinmeyen ilaç'}</span>
                                                                    {med?.dose && <span className="text-slate-400">{med.dose}</span>}
                                                                    <span className="text-slate-400">{dose.time}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
