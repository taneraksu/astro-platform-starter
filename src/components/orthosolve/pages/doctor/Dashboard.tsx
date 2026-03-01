// OrthoSolve - Doctor Dashboard
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DoctorNavbar from '../../components/DoctorNavbar';
import {
  patientStorage, glucoseStorage, wagnerStorage,
  alertStorage, appointmentStorage, abiStorage
} from '../../storage';
import type { Patient, Alert, WagnerScore } from '../../types';

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

function AlertBadge({ level }: { level: Alert['seviye'] }) {
  const config = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  };
  const labels = { critical: '⚠️ Kritik', warning: '⚠ Uyarı', info: 'ℹ Bilgi' };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${config[level]}`}>
      {labels[level]}
    </span>
  );
}

function WagnerBadge({ grade }: { grade: number }) {
  const colors = [
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-orange-100 text-orange-800',
    'bg-red-100 text-red-800',
    'bg-red-200 text-red-900',
    'bg-purple-200 text-purple-900',
  ];
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors[grade] || 'bg-gray-100 text-gray-800'}`}>
      W{grade}
    </span>
  );
}

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'ad' | 'tarih' | 'wagner'>('ad');
  const navigate = useNavigate();

  useEffect(() => {
    setAlerts(alertStorage.getAll().slice(0, 20));
    setPatients(patientStorage.getAll());
  }, []);

  const filteredPatients = patients
    .filter(p =>
      `${p.ad} ${p.soyad} ${p.tcKimlikNo}`.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'ad') return `${a.ad} ${a.soyad}`.localeCompare(`${b.ad} ${b.soyad}`);
      if (sortBy === 'tarih') return b.kayitTarihi.localeCompare(a.kayitTarihi);
      if (sortBy === 'wagner') {
        const wa = wagnerStorage.getByPatient(a.id)[0]?.grade ?? -1;
        const wb = wagnerStorage.getByPatient(b.id)[0]?.grade ?? -1;
        return wb - wa;
      }
      return 0;
    });

  // Stats
  const activeCount = patients.filter(p => p.aktif).length;
  const unreadAlerts = alerts.filter(a => !a.okundu).length;
  const criticalAlerts = alerts.filter(a => a.seviye === 'critical' && !a.okundu).length;

  // Wagner distribution
  const wagnerDist = [0, 1, 2, 3, 4, 5].map(g => ({
    grade: g,
    count: patients.filter(p => {
      const latest = wagnerStorage.getByPatient(p.id)[0];
      return latest?.grade === g;
    }).length,
  }));

  const handleMarkAllRead = () => {
    alertStorage.markAllRead();
    setAlerts(prev => prev.map(a => ({ ...a, okundu: true })));
  };

  const handleMarkRead = (id: string) => {
    alertStorage.markRead(id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, okundu: true } : a));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Klinik Dashboard</h1>
            <p className="text-gray-500 text-sm">OrthoSolve Diabetik Ayak Takip Sistemi</p>
          </div>
          <Link
            to="/doktor/yeni-hasta"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm no-underline transition-colors hover:opacity-90"
            style={{ background: '#0d9488' }}
          >
            ➕ Yeni Hasta Kaydet
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-blue-700">{activeCount}</div>
            <div className="text-sm text-gray-500 mt-1">Aktif Hasta</div>
          </div>
          <div className={`rounded-2xl p-5 shadow-sm border ${criticalAlerts > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
            <div className={`text-3xl font-bold ${criticalAlerts > 0 ? 'text-red-600' : 'text-gray-700'}`}>{unreadAlerts}</div>
            <div className={`text-sm mt-1 ${criticalAlerts > 0 ? 'text-red-500' : 'text-gray-500'}`}>
              {criticalAlerts > 0 ? `⚠️ ${criticalAlerts} Kritik Uyarı` : 'Yeni Uyarı'}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-orange-600">
              {patients.filter(p => (wagnerStorage.getByPatient(p.id)[0]?.grade ?? 0) >= 2).length}
            </div>
            <div className="text-sm text-gray-500 mt-1">Wagner ≥2</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold" style={{ color: '#0d9488' }}>
              {appointmentStorage.getAll().filter(a => a.durum === 'beklemede').length}
            </div>
            <div className="text-sm text-gray-500 mt-1">Bekleyen Randevu</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient list */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Hasta ara (ad, soyad, TC)..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
                >
                  <option value="ad">Ada Göre Sırala</option>
                  <option value="tarih">Kayıt Tarihine Göre</option>
                  <option value="wagner">Wagner Grade'e Göre</option>
                </select>
              </div>

              <div className="divide-y divide-gray-50">
                {filteredPatients.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <p className="text-4xl mb-2">🔍</p>
                    <p>Hasta bulunamadı</p>
                  </div>
                ) : (
                  filteredPatients.map(patient => {
                    const latestWagner = wagnerStorage.getByPatient(patient.id)[0];
                    const latestGlucose = glucoseStorage.getByPatient(patient.id).find(g => g.aclik);
                    const latestAbi = abiStorage.getByPatient(patient.id)[0];
                    const patientAlerts = alerts.filter(a => a.hastaId === patient.id && !a.okundu);

                    return (
                      <div
                        key={patient.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/doktor/hasta/${patient.id}`)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900">{patient.ad} {patient.soyad}</span>
                              <span className="text-gray-400 text-xs">({patient.yas} yaş)</span>
                              {latestWagner && <WagnerBadge grade={latestWagner.grade} />}
                              {patientAlerts.length > 0 && (
                                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                  {patientAlerts.length} uyarı
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-3">
                              <span>📱 {patient.telefon}</span>
                              <span>🩺 {patient.diyabetTipi}</span>
                              {latestGlucose?.aclik && (
                                <span className={`font-medium ${latestGlucose.aclik > 180 ? 'text-red-500' : latestGlucose.aclik < 70 ? 'text-blue-500' : 'text-green-600'}`}>
                                  🩸 {latestGlucose.aclik} mg/dL
                                </span>
                              )}
                              {latestAbi && (
                                <span className={`font-medium ${latestAbi.sagABI < 0.5 ? 'text-red-600' : latestAbi.sagABI < 0.9 ? 'text-yellow-600' : 'text-green-600'}`}>
                                  ABI: {latestAbi.sagABI.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-gray-400 text-sm flex-shrink-0">›</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right panel: alerts + Wagner dist */}
          <div className="space-y-6">
            {/* Alerts */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-800">
                  🔔 Uyarılar
                  {unreadAlerts > 0 && (
                    <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadAlerts}</span>
                  )}
                </h3>
                {unreadAlerts > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline cursor-pointer">
                    Tümünü okundu işaretle
                  </button>
                )}
              </div>
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">Uyarı yok</div>
                ) : (
                  alerts.slice(0, 10).map(alert => (
                    <div
                      key={alert.id}
                      className={`p-3 cursor-pointer transition-colors ${alert.okundu ? 'opacity-60' : 'hover:bg-gray-50'}`}
                      onClick={() => { handleMarkRead(alert.id); navigate(`/doktor/hasta/${alert.hastaId}`); }}
                    >
                      <div className="flex items-start gap-2">
                        <AlertBadge level={alert.seviye} />
                        {!alert.okundu && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5"></span>}
                      </div>
                      <p className="text-xs text-gray-700 mt-1 leading-relaxed">{alert.mesaj}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(alert.tarih)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Wagner Distribution */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-bold text-gray-800 mb-3">📊 Wagner Dağılımı</h3>
              <div className="space-y-2">
                {wagnerDist.map(({ grade, count }) => (
                  <div key={grade} className="flex items-center gap-2">
                    <WagnerBadge grade={grade} />
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: activeCount > 0 ? `${(count / activeCount) * 100}%` : '0%',
                          background: grade <= 1 ? '#16a34a' : grade <= 3 ? '#ea580c' : '#dc2626',
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
