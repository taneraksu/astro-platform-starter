import { useState, useEffect } from 'react';
import type { Patient, LimiteningPhase } from '../../../types/patient';

const PHASE_LABELS: Record<LimiteningPhase, string> = {
    'pre-op': 'Pre-op',
    latency: 'Latent',
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

function getProgressPercent(patient: Patient): number {
    if (patient.targetLengtheningMm === 0) return 0;
    return Math.min(100, Math.round((patient.achievedLengtheningMm / patient.targetLengtheningMm) * 100));
}

function getDaysSinceSurgery(surgeryDate: string): number {
    const surgery = new Date(surgeryDate);
    const now = new Date();
    return Math.floor((now.getTime() - surgery.getTime()) / (1000 * 60 * 60 * 24));
}

export default function PatientList() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [phaseFilter, setPhaseFilter] = useState('all');
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (phaseFilter !== 'all') params.set('phase', phaseFilter);
            if (search) params.set('search', search);
            const res = await fetch(`/api/patients?${params}`);
            const data = await res.json();
            setPatients(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, [phaseFilter, search]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`"${name}" hastasını silmek istediğinizden emin misiniz? Tüm ölçüm ve notlar da silinecektir.`)) return;
        setDeleting(id);
        try {
            await fetch(`/api/patient?id=${id}`, { method: 'DELETE' });
            setPatients((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(null);
        }
    };

    const stats = {
        total: patients.length,
        active: patients.filter((p) => !['pre-op', 'completed'].includes(p.phase)).length,
        distraction: patients.filter((p) => p.phase === 'distraction').length,
        completed: patients.filter((p) => p.phase === 'completed').length,
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { label: 'Toplam Hasta', value: stats.total, color: 'border-blue-500' },
                    { label: 'Aktif Tedavi', value: stats.active, color: 'border-primary' },
                    { label: 'Distraksiyon', value: stats.distraction, color: 'border-yellow-500' },
                    { label: 'Tamamlandı', value: stats.completed, color: 'border-green-500' },
                ].map((stat) => (
                    <div key={stat.label} className={`bg-gray-800 rounded-lg p-4 border-l-4 ${stat.color}`}>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <input
                    type="text"
                    placeholder="Hasta veya doktor ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
                <select
                    value={phaseFilter}
                    onChange={(e) => setPhaseFilter(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                >
                    <option value="all">Tüm Fazlar</option>
                    <option value="pre-op">Pre-op</option>
                    <option value="latency">Latent</option>
                    <option value="distraction">Distraksiyon</option>
                    <option value="consolidation">Konsolidasyon</option>
                    <option value="rehabilitation">Rehabilitasyon</option>
                    <option value="completed">Tamamlandı</option>
                </select>
                <a href="/patients/new" className="btn whitespace-nowrap">
                    + Yeni Hasta
                </a>
            </div>

            {/* Patient List */}
            {loading ? (
                <div className="text-center py-12 text-gray-400">Yükleniyor...</div>
            ) : patients.length === 0 ? (
                <div className="text-center py-16 bg-gray-800 rounded-xl">
                    <div className="text-5xl mb-4">🏥</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Henüz hasta yok</h3>
                    <p className="text-gray-400 mb-6">İlk hastayı ekleyerek başlayın</p>
                    <a href="/patients/new" className="btn btn-lg">
                        + İlk Hastayı Ekle
                    </a>
                </div>
            ) : (
                <div className="space-y-3">
                    {patients.map((patient) => {
                        const progress = getProgressPercent(patient);
                        const daysSince = getDaysSinceSurgery(patient.surgeryDate);
                        return (
                            <div key={patient.id} className="bg-gray-800 rounded-xl p-5 hover:bg-gray-750 transition-colors border border-gray-700">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="text-lg font-semibold text-white">{patient.name}</h3>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PHASE_COLORS[patient.phase]}`}>
                                                {PHASE_LABELS[patient.phase]}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-sm text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                                            <span>{patient.surgeryType} • {patient.bone === 'both' ? 'Femur + Tibia' : patient.bone.charAt(0).toUpperCase() + patient.bone.slice(1)}</span>
                                            {patient.doctor && <span>Dr. {patient.doctor}</span>}
                                            <span>{daysSince} gün</span>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="mt-3">
                                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                <span>Uzama: {patient.achievedLengtheningMm.toFixed(1)} / {patient.targetLengtheningMm} mm</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <a
                                            href={`/patients/${patient.id}`}
                                            className="btn text-sm py-2 px-4"
                                        >
                                            Detay
                                        </a>
                                        <button
                                            onClick={() => handleDelete(patient.id, patient.name)}
                                            disabled={deleting === patient.id}
                                            className="px-3 py-2 text-sm rounded bg-red-900 text-red-200 hover:bg-red-800 transition-colors disabled:opacity-50"
                                        >
                                            {deleting === patient.id ? '...' : 'Sil'}
                                        </button>
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
