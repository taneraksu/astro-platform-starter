import { useState, useEffect } from 'react';
import type { Patient, Measurement, PatientNote, LimiteningPhase } from '../../../types/patient';
import ProgressChart from './ProgressChart';
import MeasurementForm from './MeasurementForm';
import NoteForm from './NoteForm';

interface Props {
    patientId: string;
}

const PHASE_LABELS: Record<LimiteningPhase, string> = {
    'pre-op': 'Pre-op',
    latency: 'Latent Faz',
    distraction: 'Distraksiyon',
    consolidation: 'Konsolidasyon',
    rehabilitation: 'Rehabilitasyon',
    completed: 'Tamamlandı',
};

const PHASE_COLORS: Record<LimiteningPhase, string> = {
    'pre-op': 'bg-gray-600 text-gray-200',
    latency: 'bg-yellow-800 text-yellow-200',
    distraction: 'bg-blue-800 text-blue-200',
    consolidation: 'bg-orange-800 text-orange-200',
    rehabilitation: 'bg-purple-800 text-purple-200',
    completed: 'bg-green-800 text-green-200',
};

const PHASE_ORDER: LimiteningPhase[] = ['pre-op', 'latency', 'distraction', 'consolidation', 'rehabilitation', 'completed'];

const NOTE_TYPE_ICONS: Record<string, string> = {
    general: '📝',
    complication: '⚠️',
    xray: '🩻',
    appointment: '📅',
    physical_therapy: '🏃',
};

const NOTE_TYPE_LABELS: Record<string, string> = {
    general: 'Genel',
    complication: 'Komplikasyon',
    xray: 'Röntgen',
    appointment: 'Randevu',
    physical_therapy: 'Fizik Tedavi',
};

type Tab = 'overview' | 'measurements' | 'chart' | 'notes' | 'edit';

export default function PatientDashboard({ patientId }: Props) {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [notes, setNotes] = useState<PatientNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<Tab>('overview');
    const [showMeasurementForm, setShowMeasurementForm] = useState(false);
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [editPhase, setEditPhase] = useState<LimiteningPhase | null>(null);
    const [editRate, setEditRate] = useState('');
    const [savingPhase, setSavingPhase] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [pRes, mRes, nRes] = await Promise.all([
                fetch(`/api/patient?id=${patientId}`),
                fetch(`/api/measurements?patientId=${patientId}`),
                fetch(`/api/notes?patientId=${patientId}`),
            ]);
            const [p, m, n] = await Promise.all([pRes.json(), mRes.json(), nRes.json()]);
            setPatient(p);
            setMeasurements(Array.isArray(m) ? m : []);
            setNotes(Array.isArray(n) ? n : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [patientId]);

    const savePhase = async () => {
        if (!patient || !editPhase) return;
        setSavingPhase(true);
        try {
            await fetch(`/api/patient?id=${patientId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phase: editPhase,
                    distractionRateMmPerDay: editRate ? Number(editRate) : patient.distractionRateMmPerDay,
                }),
            });
            setPatient((prev) => prev ? { ...prev, phase: editPhase, distractionRateMmPerDay: editRate ? Number(editRate) : prev.distractionRateMmPerDay } : null);
            setEditPhase(null);
        } catch (err) {
            console.error(err);
        } finally {
            setSavingPhase(false);
        }
    };

    const deleteNote = async (noteId: string) => {
        if (!confirm('Bu notu silmek istediğinizden emin misiniz?')) return;
        await fetch(`/api/notes?patientId=${patientId}&noteId=${noteId}`, { method: 'DELETE' });
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>;
    }

    if (!patient || (patient as any).error) {
        return (
            <div className="text-center py-20">
                <p className="text-red-400 mb-4">Hasta bulunamadı</p>
                <a href="/patients" className="btn">Geri Dön</a>
            </div>
        );
    }

    const progressPct = patient.targetLengtheningMm > 0
        ? Math.min(100, Math.round((patient.achievedLengtheningMm / patient.targetLengtheningMm) * 100))
        : 0;

    const daysSinceSurgery = Math.floor((Date.now() - new Date(patient.surgeryDate).getTime()) / 86400000);
    const remainingMm = patient.targetLengtheningMm - patient.achievedLengtheningMm;
    const estimatedDays = patient.distractionRateMmPerDay > 0 ? Math.ceil(remainingMm / patient.distractionRateMmPerDay) : 0;

    const latestMeasurement = measurements.length > 0
        ? [...measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
        : null;

    const currentPhaseIndex = PHASE_ORDER.indexOf(patient.phase);

    const tabs: { id: Tab; label: string; count?: number }[] = [
        { id: 'overview', label: 'Genel Bakış' },
        { id: 'measurements', label: 'Ölçümler', count: measurements.length },
        { id: 'chart', label: 'Grafik' },
        { id: 'notes', label: 'Notlar', count: notes.length },
        { id: 'edit', label: 'Düzenle' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-white">{patient.name}</h1>
                            <span className={`text-sm font-medium px-3 py-1 rounded-full ${PHASE_COLORS[patient.phase]}`}>
                                {PHASE_LABELS[patient.phase]}
                            </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                            <span>{patient.surgeryType} • {patient.bone === 'both' ? 'Femur + Tibia' : patient.bone.charAt(0).toUpperCase() + patient.bone.slice(1)}</span>
                            {patient.doctor && <span>Dr. {patient.doctor}</span>}
                            {patient.hospital && <span>{patient.hospital}</span>}
                            <span>Ameliyat: {new Date(patient.surgeryDate).toLocaleDateString('tr-TR')}</span>
                        </div>
                    </div>
                    <a href="/patients" className="text-gray-400 hover:text-white text-sm no-underline">
                        ← Hasta Listesi
                    </a>
                </div>

                {/* Progress */}
                <div className="mt-5">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Uzama Progresyonu</span>
                        <span className="text-white font-semibold">{patient.achievedLengtheningMm.toFixed(1)} / {patient.targetLengtheningMm} mm ({progressPct}%)</span>
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>

                {/* Phase steps */}
                <div className="mt-5 flex items-center gap-1 overflow-x-auto pb-1">
                    {PHASE_ORDER.map((phase, idx) => (
                        <div key={phase} className="flex items-center shrink-0">
                            <div className={`text-xs px-2 py-1 rounded ${idx <= currentPhaseIndex ? PHASE_COLORS[patient.phase] : 'bg-gray-700 text-gray-500'} ${phase === patient.phase ? 'ring-2 ring-white/30' : ''}`}>
                                {PHASE_LABELS[phase]}
                            </div>
                            {idx < PHASE_ORDER.length - 1 && (
                                <div className={`w-4 h-0.5 mx-0.5 ${idx < currentPhaseIndex ? 'bg-primary' : 'bg-gray-700'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { label: 'Mevcut Boy', value: `${patient.currentHeightCm} cm`, sub: `${patient.initialHeightCm} cm başlangıç` },
                    { label: 'Hedef Boy', value: `${patient.targetHeightCm} cm`, sub: `+${patient.targetLengtheningMm} mm hedef` },
                    { label: 'Gün', value: daysSince >= 0 ? String(daysSinceSurgery) : '—', sub: 'ameliyattan bu yana' },
                    {
                        label: 'Kalan',
                        value: patient.phase === 'distraction' ? `~${estimatedDays} gün` : `${remainingMm.toFixed(1)} mm`,
                        sub: patient.distractionRateMmPerDay + ' mm/gün hız',
                    },
                ].map((s) => (
                    <div key={s.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="text-xs text-gray-400 mb-1">{s.label}</div>
                        <div className="text-xl font-bold text-white">{s.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-700">
                <div className="flex gap-1 overflow-x-auto">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                                tab === t.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                        >
                            {t.label}
                            {t.count !== undefined && (
                                <span className="ml-1.5 text-xs bg-gray-700 px-1.5 py-0.5 rounded-full">{t.count}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            {tab === 'overview' && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Latest measurement */}
                    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-white">Son Ölçüm</h3>
                            <button onClick={() => { setTab('measurements'); setShowMeasurementForm(true); }} className="text-xs text-primary hover:underline">
                                + Yeni Ölçüm
                            </button>
                        </div>
                        {latestMeasurement ? (
                            <div className="space-y-3">
                                <div className="text-sm text-gray-400">{new Date(latestMeasurement.date).toLocaleDateString('tr-TR', { dateStyle: 'long' })}</div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-gray-700 rounded-lg p-3">
                                        <div className="text-gray-400 text-xs">Boy</div>
                                        <div className="text-white font-semibold mt-1">{latestMeasurement.heightCm} cm</div>
                                    </div>
                                    <div className="bg-gray-700 rounded-lg p-3">
                                        <div className="text-gray-400 text-xs">Uzama</div>
                                        <div className="text-white font-semibold mt-1">{latestMeasurement.lengtheningMm.toFixed(1)} mm</div>
                                    </div>
                                    <div className="bg-gray-700 rounded-lg p-3">
                                        <div className="text-gray-400 text-xs">Ağrı</div>
                                        <div className={`font-semibold mt-1 ${latestMeasurement.painLevel >= 7 ? 'text-red-400' : latestMeasurement.painLevel >= 4 ? 'text-orange-400' : 'text-green-400'}`}>
                                            {latestMeasurement.painLevel}/10
                                        </div>
                                    </div>
                                    <div className="bg-gray-700 rounded-lg p-3">
                                        <div className="text-gray-400 text-xs">Hareket</div>
                                        <div className="text-blue-400 font-semibold mt-1">{latestMeasurement.mobilityScore}/10</div>
                                    </div>
                                </div>
                                {latestMeasurement.callus && (
                                    <div className="text-sm text-gray-400">Kalus: <span className="text-white">{latestMeasurement.callus}</span></div>
                                )}
                                {latestMeasurement.notes && (
                                    <p className="text-sm text-gray-300 bg-gray-700 rounded-lg p-3">{latestMeasurement.notes}</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">Henüz ölçüm yok</p>
                        )}
                    </div>

                    {/* Patient info */}
                    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                        <h3 className="font-semibold text-white mb-4">Hasta Bilgileri</h3>
                        <div className="space-y-2 text-sm">
                            {[
                                { label: 'Doğum Tarihi', value: new Date(patient.dateOfBirth).toLocaleDateString('tr-TR') },
                                { label: 'Cinsiyet', value: patient.gender === 'male' ? 'Erkek' : 'Kadın' },
                                { label: 'Telefon', value: patient.phone || '—' },
                                { label: 'E-posta', value: patient.email || '—' },
                                { label: 'Distraksiyon Hızı', value: `${patient.distractionRateMmPerDay} mm/gün` },
                                { label: 'Ameliyat Yöntemi', value: patient.surgeryType },
                                { label: 'Toplam Ölçüm', value: String(measurements.length) },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between">
                                    <span className="text-gray-400">{label}</span>
                                    <span className="text-white">{value}</span>
                                </div>
                            ))}
                        </div>
                        {patient.notes && (
                            <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Notlar</div>
                                <p className="text-sm text-gray-300">{patient.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Phase update */}
                    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 sm:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-white">Faz Güncelle</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {PHASE_ORDER.map((phase) => (
                                <button
                                    key={phase}
                                    onClick={() => setEditPhase(phase)}
                                    className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                                        (editPhase || patient.phase) === phase
                                            ? PHASE_COLORS[phase] + ' ring-2 ring-white/20'
                                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                    }`}
                                >
                                    {PHASE_LABELS[phase]}
                                </button>
                            ))}
                        </div>
                        {editPhase && (
                            <div className="flex items-center gap-3 flex-wrap">
                                <div>
                                    <label className="text-xs text-gray-400 mr-2">Distraksiyon hızı (mm/gün):</label>
                                    <input
                                        type="number"
                                        value={editRate || patient.distractionRateMmPerDay}
                                        onChange={(e) => setEditRate(e.target.value)}
                                        step="0.25"
                                        min="0.25"
                                        max="2"
                                        className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-white text-sm w-24 focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <button onClick={savePhase} disabled={savingPhase} className="btn text-sm py-1.5 px-4">
                                    {savingPhase ? 'Kaydediliyor...' : 'Güncelle'}
                                </button>
                                <button onClick={() => setEditPhase(null)} className="text-sm text-gray-400 hover:text-white">
                                    İptal
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Recent notes */}
                    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 sm:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-white">Son Notlar</h3>
                            <button onClick={() => { setTab('notes'); setShowNoteForm(true); }} className="text-xs text-primary hover:underline">
                                + Not Ekle
                            </button>
                        </div>
                        {notes.length === 0 ? (
                            <p className="text-gray-500 text-sm">Henüz not yok</p>
                        ) : (
                            <div className="space-y-3">
                                {notes.slice(0, 3).map((note) => (
                                    <div key={note.id} className="flex gap-3 p-3 bg-gray-700 rounded-lg">
                                        <span className="text-xl shrink-0">{NOTE_TYPE_ICONS[note.type] || '📝'}</span>
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-white">{note.title}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">{new Date(note.date).toLocaleDateString('tr-TR')} • {NOTE_TYPE_LABELS[note.type]}</div>
                                            <p className="text-sm text-gray-300 mt-1 line-clamp-2">{note.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {tab === 'measurements' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-white">{measurements.length} Ölçüm</h2>
                        <button onClick={() => setShowMeasurementForm(true)} className="btn text-sm py-2">
                            + Yeni Ölçüm
                        </button>
                    </div>

                    {showMeasurementForm && (
                        <div className="bg-gray-800 rounded-xl p-5 border border-primary/30">
                            <h3 className="font-semibold text-white mb-4">Yeni Ölçüm Ekle</h3>
                            <MeasurementForm
                                patientId={patientId}
                                currentMm={patient.achievedLengtheningMm}
                                onSuccess={() => { setShowMeasurementForm(false); fetchAll(); }}
                                onCancel={() => setShowMeasurementForm(false)}
                            />
                        </div>
                    )}

                    {measurements.length === 0 ? (
                        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
                            <div className="text-4xl mb-3">📏</div>
                            <p className="text-gray-400">Henüz ölçüm kaydı yok</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {[...measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((m) => (
                                <div key={m.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium text-white">{new Date(m.date).toLocaleDateString('tr-TR', { dateStyle: 'long' })}</div>
                                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                                <span className="text-gray-400">Boy: <span className="text-white font-medium">{m.heightCm} cm</span></span>
                                                <span className="text-gray-400">Uzama: <span className="text-white font-medium">{m.lengtheningMm.toFixed(1)} mm</span></span>
                                                <span className="text-gray-400">Ağrı: <span className={`font-medium ${m.painLevel >= 7 ? 'text-red-400' : m.painLevel >= 4 ? 'text-orange-400' : 'text-green-400'}`}>{m.painLevel}/10</span></span>
                                                <span className="text-gray-400">Hareket: <span className="text-blue-400 font-medium">{m.mobilityScore}/10</span></span>
                                            </div>
                                            {m.xrayTaken && <div className="mt-1 text-xs text-cyan-400">🩻 Röntgen çekildi {m.xrayDate ? `(${new Date(m.xrayDate).toLocaleDateString('tr-TR')})` : ''}</div>}
                                            {m.callus && <div className="mt-1 text-xs text-gray-400">Kalus: {m.callus}</div>}
                                            {m.notes && <p className="mt-2 text-sm text-gray-300">{m.notes}</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {tab === 'chart' && (
                <ProgressChart measurements={measurements} targetMm={patient.targetLengtheningMm} />
            )}

            {tab === 'notes' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-white">{notes.length} Not</h2>
                        <button onClick={() => setShowNoteForm(true)} className="btn text-sm py-2">
                            + Not Ekle
                        </button>
                    </div>

                    {showNoteForm && (
                        <div className="bg-gray-800 rounded-xl p-5 border border-primary/30">
                            <h3 className="font-semibold text-white mb-4">Yeni Not Ekle</h3>
                            <NoteForm
                                patientId={patientId}
                                onSuccess={() => { setShowNoteForm(false); fetchAll(); }}
                                onCancel={() => setShowNoteForm(false)}
                            />
                        </div>
                    )}

                    {notes.length === 0 ? (
                        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
                            <div className="text-4xl mb-3">📋</div>
                            <p className="text-gray-400">Henüz not yok</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notes.map((note) => (
                                <div key={note.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex gap-3 min-w-0">
                                            <span className="text-2xl shrink-0">{NOTE_TYPE_ICONS[note.type] || '📝'}</span>
                                            <div className="min-w-0">
                                                <div className="font-semibold text-white">{note.title}</div>
                                                <div className="text-xs text-gray-400 mt-0.5 flex flex-wrap gap-2">
                                                    <span>{new Date(note.date).toLocaleDateString('tr-TR', { dateStyle: 'long' })}</span>
                                                    <span className="bg-gray-700 px-1.5 py-0.5 rounded">{NOTE_TYPE_LABELS[note.type] || note.type}</span>
                                                    {note.createdBy && <span>— {note.createdBy}</span>}
                                                </div>
                                                <p className="mt-3 text-sm text-gray-300 whitespace-pre-line">{note.content}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => deleteNote(note.id)} className="shrink-0 text-xs text-red-400 hover:text-red-300">
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {tab === 'edit' && (
                <EditPatientForm patient={patient} onSave={(updated) => { setPatient(updated); setTab('overview'); }} />
            )}
        </div>
    );
}

function EditPatientForm({ patient, onSave }: { patient: Patient; onSave: (p: Patient) => void }) {
    const [form, setForm] = useState({
        name: patient.name,
        phone: patient.phone,
        email: patient.email,
        doctor: patient.doctor,
        hospital: patient.hospital,
        distractionRateMmPerDay: String(patient.distractionRateMmPerDay),
        phase: patient.phase,
        targetHeightCm: String(patient.targetHeightCm),
        targetLengtheningMm: String(patient.targetLengtheningMm),
        notes: patient.notes,
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/patient?id=${patient.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const updated = await res.json();
            onSave(updated);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const fieldClass = 'bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary w-full';
    const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

    return (
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-5">
            <h2 className="text-lg font-semibold text-white">Hasta Bilgilerini Düzenle</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label className={labelClass}>Ad Soyad</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} className={fieldClass} />
                </div>
                <div>
                    <label className={labelClass}>Telefon</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} className={fieldClass} />
                </div>
                <div>
                    <label className={labelClass}>E-posta</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} className={fieldClass} />
                </div>
                <div>
                    <label className={labelClass}>Doktor</label>
                    <input type="text" name="doctor" value={form.doctor} onChange={handleChange} className={fieldClass} />
                </div>
                <div>
                    <label className={labelClass}>Hastane</label>
                    <input type="text" name="hospital" value={form.hospital} onChange={handleChange} className={fieldClass} />
                </div>
                <div>
                    <label className={labelClass}>Distraksiyon Hızı (mm/gün)</label>
                    <input type="number" name="distractionRateMmPerDay" value={form.distractionRateMmPerDay} onChange={handleChange} step="0.25" min="0.25" max="2" className={fieldClass} />
                </div>
                <div>
                    <label className={labelClass}>Hedef Boy (cm)</label>
                    <input type="number" name="targetHeightCm" value={form.targetHeightCm} onChange={handleChange} className={fieldClass} />
                </div>
                <div>
                    <label className={labelClass}>Hedef Uzama (mm)</label>
                    <input type="number" name="targetLengtheningMm" value={form.targetLengtheningMm} onChange={handleChange} className={fieldClass} />
                </div>
                <div>
                    <label className={labelClass}>Faz</label>
                    <select name="phase" value={form.phase} onChange={handleChange} className={fieldClass}>
                        {PHASE_ORDER.map((p) => <option key={p} value={p}>{PHASE_LABELS[p]}</option>)}
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label className={labelClass}>Notlar</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} className={`${fieldClass} resize-none`} />
                </div>
            </div>
            <button type="submit" disabled={saving} className="btn w-full">
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
        </form>
    );
}
