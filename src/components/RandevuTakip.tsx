import { useState, useEffect } from 'react';

interface Appointment {
    id: string;
    date: string;
    time: string;
    type: string;
    doctor: string;
    location: string;
    notes: string;
    completed: boolean;
}

const APPOINTMENT_TYPES = [
    'Ortopedi Kontrolü',
    'Fizyoterapi Seansı',
    'Pratisyen Hekim',
    'Röntgen / Görüntüleme',
    'Kan Testi',
    'Pansuman / Yara Bakımı',
    'Anestezi Kontrolü',
    'Kardiyoloji',
    'Diş Hekimi',
    'Diğer',
];

const STORAGE_KEY = 'arthrocare-randevular';

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getAppointments(): Appointment[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch { return []; }
}

function saveAppointments(items: Appointment[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
}

function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('tr-TR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
}

function daysUntil(dateStr: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const apptDate = new Date(dateStr + 'T00:00:00');
    return Math.ceil((apptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function RandevuTakip() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
    const [form, setForm] = useState<Omit<Appointment, 'id' | 'completed'>>({
        date: '',
        time: '',
        type: 'Ortopedi Kontrolü',
        doctor: '',
        location: '',
        notes: '',
    });

    useEffect(() => { setAppointments(getAppointments()); }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let updated: Appointment[];
        if (editingId) {
            updated = appointments.map(a => a.id === editingId ? { ...form, id: editingId, completed: a.completed } : a);
        } else {
            updated = [...appointments, { ...form, id: generateId(), completed: false }];
        }
        updated.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
        setAppointments(updated);
        saveAppointments(updated);
        setForm({ date: '', time: '', type: 'Ortopedi Kontrolü', doctor: '', location: '', notes: '' });
        setShowForm(false);
        setEditingId(null);
    };

    const toggleCompleted = (id: string) => {
        const updated = appointments.map(a => a.id === id ? { ...a, completed: !a.completed } : a);
        setAppointments(updated);
        saveAppointments(updated);
    };

    const deleteAppointment = (id: string) => {
        const updated = appointments.filter(a => a.id !== id);
        setAppointments(updated);
        saveAppointments(updated);
        setDeleteConfirm(null);
    };

    const startEdit = (appt: Appointment) => {
        setForm({ date: appt.date, time: appt.time, type: appt.type, doctor: appt.doctor, location: appt.location, notes: appt.notes });
        setEditingId(appt.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const today = new Date().toISOString().split('T')[0];

    const filteredAppointments = appointments.filter(a => {
        if (filter === 'upcoming') return a.date >= today && !a.completed;
        if (filter === 'past') return a.date < today || a.completed;
        return true;
    });

    const upcomingCount = appointments.filter(a => a.date >= today && !a.completed).length;

    return (
        <div>
            {/* Add Button */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    {upcomingCount > 0 && (
                        <span className="badge badge-blue">{upcomingCount} yaklaşan randevu</span>
                    )}
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ date: '', time: '', type: 'Ortopedi Kontrolü', doctor: '', location: '', notes: '' }); }}
                    className="btn btn-primary"
                >
                    {showForm ? '✕ İptal' : '+ Yeni Randevu'}
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="card mb-6 border-2 border-blue-200">
                    <h3 className="font-semibold text-slate-900 mb-4">
                        {editingId ? 'Randevuyu Düzenle' : 'Yeni Randevu Ekle'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="label">Tarih *</label>
                            <input type="date" className="input" required value={form.date}
                                onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                        </div>
                        <div>
                            <label className="label">Saat</label>
                            <input type="time" className="input" value={form.time}
                                onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
                        </div>
                        <div>
                            <label className="label">Randevu Türü *</label>
                            <select className="input" required value={form.type}
                                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                                {APPOINTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Doktor / Klinisyen</label>
                            <input type="text" className="input" placeholder="Örn: Dr. Ahmet Yılmaz" value={form.doctor}
                                onChange={e => setForm(p => ({ ...p, doctor: e.target.value }))} />
                        </div>
                        <div>
                            <label className="label">Yer / Hastane</label>
                            <input type="text" className="input" placeholder="Örn: Acıbadem Hastanesi, 3. Kat" value={form.location}
                                onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="label">Notlar</label>
                        <textarea className="input min-h-20 resize-none" placeholder="Sormak istediğiniz sorular, hazırlık notları..." value={form.notes}
                            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" className="btn btn-primary">{editingId ? 'Güncelle' : 'Randevu Ekle'}</button>
                        <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn btn-ghost">İptal</button>
                    </div>
                </form>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 border-b border-slate-200">
                {([['upcoming', 'Yaklaşan'], ['past', 'Geçmiş'], ['all', 'Tümü']] as const).map(([v, label]) => (
                    <button key={v} onClick={() => setFilter(v)}
                        className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors bg-transparent cursor-pointer ${filter === v ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Appointment List */}
            {filteredAppointments.length === 0 ? (
                <div className="card text-center py-12">
                    <div className="text-4xl mb-3">🗓️</div>
                    <p className="text-slate-500 mb-3">
                        {filter === 'upcoming' ? 'Yaklaşan randevu yok.' : filter === 'past' ? 'Geçmiş randevu yok.' : 'Henüz randevu eklenmedi.'}
                    </p>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
                        İlk Randevuyu Ekle
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredAppointments.map(appt => {
                        const days = daysUntil(appt.date);
                        const isPast = days < 0 || appt.completed;
                        const isToday = days === 0;
                        const isSoon = days > 0 && days <= 3;

                        return (
                            <div key={appt.id} className={`rounded-xl border-2 transition-all ${appt.completed ? 'border-green-200 bg-green-50 opacity-75' : isToday ? 'border-blue-400 bg-blue-50' : isSoon ? 'border-amber-300 bg-amber-50' : isPast ? 'border-slate-200 bg-slate-50 opacity-60' : 'border-slate-200 bg-white'}`}>
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${appt.completed ? 'bg-green-100' : isToday ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                            {appt.completed ? '✓' : isToday ? '📅' : '🗓️'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-slate-900">{appt.type}</h3>
                                                {isToday && !appt.completed && <span className="badge bg-blue-600 text-white text-xs">Bugün!</span>}
                                                {isSoon && !appt.completed && <span className="badge badge-yellow text-xs">{days} gün sonra</span>}
                                                {appt.completed && <span className="badge badge-green text-xs">Tamamlandı</span>}
                                            </div>
                                            <p className="text-sm text-slate-700 font-medium">
                                                {formatDate(appt.date)}{appt.time ? ` — ${appt.time}` : ''}
                                            </p>
                                            {appt.doctor && <p className="text-sm text-slate-500">👨‍⚕️ {appt.doctor}</p>}
                                            {appt.location && <p className="text-sm text-slate-500">📍 {appt.location}</p>}
                                            {appt.notes && <p className="text-xs text-slate-400 mt-1 italic">{appt.notes}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <button
                                            onClick={() => toggleCompleted(appt.id)}
                                            className={`btn btn-sm ${appt.completed ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'btn-success'}`}
                                        >
                                            {appt.completed ? 'Geri Al' : '✓ Tamamlandı'}
                                        </button>
                                        <button onClick={() => startEdit(appt)} className="btn btn-ghost btn-sm">Düzenle</button>
                                        <div className="flex-1" />
                                        {deleteConfirm === appt.id ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => deleteAppointment(appt.id)} className="btn btn-danger btn-sm">Sil</button>
                                                <button onClick={() => setDeleteConfirm(null)} className="btn btn-ghost btn-sm">İptal</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setDeleteConfirm(appt.id)} className="text-slate-300 hover:text-red-400 transition-colors" aria-label="Sil">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
