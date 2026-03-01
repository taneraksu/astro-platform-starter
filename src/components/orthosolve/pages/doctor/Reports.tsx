// OrthoSolve - Reports & Statistics (Doctor View)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import DoctorNavbar from '../../components/DoctorNavbar';
import {
  patientStorage, glucoseStorage, wagnerStorage,
  procedureStorage, appointmentStorage, woundStorage
} from '../../storage';
import type { Patient } from '../../types';

const COLORS = ['#16a34a', '#d97706', '#ea580c', '#dc2626', '#991b1b', '#7c3aed'];

function StatCard({ title, value, subtitle, color }: { title: string; value: string | number; subtitle?: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className={`text-3xl font-bold ${color || 'text-gray-800'}`}>{value}</div>
      <div className="text-sm font-semibold text-gray-700 mt-1">{title}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
    </div>
  );
}

export default function Reports() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState({
    activePatients: 0,
    avgHba1c: 0,
    highHba1cCount: 0,
    amputationCount: 0,
    avgAge: 0,
    wagnerDist: [] as { grade: string; count: number }[],
    diyabetDist: [] as { type: string; count: number }[],
    comorbidity: [] as { name: string; count: number }[],
    recentProcedures: 0,
    pendingAppointments: 0,
  });

  useEffect(() => {
    const pList = patientStorage.getAll();
    setPatients(pList);
    computeStats(pList);
  }, []);

  const computeStats = (pList: Patient[]) => {
    const active = pList.filter(p => p.aktif);

    // HbA1c stats
    let totalHba1c = 0;
    let hba1cCount = 0;
    let highHba1c = 0;
    active.forEach(p => {
      const records = glucoseStorage.getByPatient(p.id);
      const latest = records.find(r => r.hba1c);
      if (latest?.hba1c) {
        totalHba1c += latest.hba1c;
        hba1cCount++;
        if (latest.hba1c > 8) highHba1c++;
      }
    });

    // Wagner distribution
    const wagnerCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    active.forEach(p => {
      const latest = wagnerStorage.getByPatient(p.id)[0];
      if (latest !== undefined) wagnerCounts[latest.grade] = (wagnerCounts[latest.grade] || 0) + 1;
    });

    // Diabetes type distribution
    const diabTypes: Record<string, number> = {};
    active.forEach(p => { diabTypes[p.diyabetTipi] = (diabTypes[p.diyabetTipi] || 0) + 1; });

    // Comorbidity
    const comorbCounts: Record<string, number> = {};
    active.forEach(p => p.komorbidite.forEach(k => { comorbCounts[k] = (comorbCounts[k] || 0) + 1; }));

    const totalAge = active.reduce((s, p) => s + p.yas, 0);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    setStats({
      activePatients: active.length,
      avgHba1c: hba1cCount > 0 ? Math.round((totalHba1c / hba1cCount) * 10) / 10 : 0,
      highHba1cCount: highHba1c,
      amputationCount: active.filter(p => p.amputasyonHikayesi).length,
      avgAge: active.length > 0 ? Math.round(totalAge / active.length) : 0,
      wagnerDist: Object.entries(wagnerCounts).map(([g, c]) => ({ grade: `Grade ${g}`, count: c })),
      diyabetDist: Object.entries(diabTypes).map(([t, c]) => ({ type: t, count: c })),
      comorbidity: Object.entries(comorbCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, count]) => ({ name, count })),
      recentProcedures: procedureStorage.getByPatient ? 0 : 0, // approximate
      pendingAppointments: appointmentStorage.getAll().filter(a => a.durum === 'beklemede').length,
    });
  };

  const handlePrint = () => window.print();

  const handleExportPatient = (patient: Patient) => {
    const wounds = woundStorage.getByPatient(patient.id);
    const glucose = glucoseStorage.getByPatient(patient.id).slice(0, 10);
    const wagner = wagnerStorage.getByPatient(patient.id).slice(0, 5);

    const content = `
ORTHOSOLVE DİABETİK AYAK TAKİP SİSTEMİ
========================================
Op. Dr. Taner Aksu | Prof. Dr. Mustafa Gökhan Bilgili
Tel: 0532 151 87 97 | taneraksu@gmail.com

HASTA ÖZET RAPORU
Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}

KİŞİSEL BİLGİLER
-----------------
Ad Soyad: ${patient.ad} ${patient.soyad}
Doğum Tarihi: ${patient.dogumTarihi} (${patient.yas} yaş)
TC Kimlik: ${patient.tcKimlikNo}
Telefon: ${patient.telefon}
Adres: ${patient.adres}
Acil İletişim: ${patient.acilKisi} - ${patient.acilTelefon}
Boy/Kilo/BMI: ${patient.boy} cm / ${patient.kilo} kg / ${patient.bmi.toFixed(1)}

TIBBİ GEÇMİŞ
-------------
Diyabet Tipi: ${patient.diyabetTipi} (${patient.diyabetBaslangicYili}'den beri)
İlaçlar: ${patient.ilaclar.join(', ') || 'Belirtilmemiş'}
Komorbidite: ${patient.komorbidite.join(', ') || 'Yok'}
Sigara: ${patient.sigara ? 'Evet' : 'Hayır'} | Alkol: ${patient.alkol ? 'Evet' : 'Hayır'}
Amputasyon: ${patient.amputasyonHikayesi ? patient.amputasyonSeviye || 'Var' : 'Yok'}

WAGNER KAYITLARI
----------------
${wagner.map(w => `${new Date(w.tarih).toLocaleDateString('tr-TR')}: Grade ${w.grade} — ${w.notlar || ''}`).join('\n') || 'Kayıt yok'}

YARA KAYITLARI
--------------
${wounds.slice(0, 5).map(w => `${new Date(w.tarih).toLocaleDateString('tr-TR')}: ${w.lokalizasyon[0]?.label || '?'} — ${w.uzunluk}x${w.genislik}x${w.derinlik}cm, Nekroz:%${w.nekroz}`).join('\n') || 'Kayıt yok'}

SON KAN ŞEKERİ DEĞERLERİ
--------------------------
${glucose.map(g => `${new Date(g.tarih).toLocaleDateString('tr-TR')}: Açlık:${g.aclik||'—'} Tokluk:${g.tokluk||'—'} HbA1c:${g.hba1c||'—'}`).join('\n') || 'Kayıt yok'}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${patient.ad}_${patient.soyad}_rapor_${new Date().toLocaleDateString('tr-TR').replace(/\./g,'-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Raporlar & İstatistikler</h1>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800"
          >
            🖨️ Sayfayı Yazdır
          </button>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard title="Aktif Hasta" value={stats.activePatients} color="text-blue-700" />
          <StatCard title="Ortalama Yaş" value={stats.avgAge} subtitle="yıl" color="text-gray-700" />
          <StatCard title="Ort. HbA1c" value={stats.avgHba1c > 0 ? `${stats.avgHba1c}%` : '—'} subtitle={stats.highHba1cCount > 0 ? `${stats.highHba1cCount} hasta >8%` : ''} color={stats.avgHba1c > 8 ? 'text-red-600' : stats.avgHba1c > 7 ? 'text-yellow-600' : 'text-green-600'} />
          <StatCard title="Amputasyon Hx" value={stats.amputationCount} subtitle="hasta" color="text-orange-600" />
          <StatCard title="Bekleyen Randevu" value={stats.pendingAppointments} color={stats.pendingAppointments > 0 ? 'text-yellow-600' : 'text-green-600'} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Wagner distribution */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Wagner Dağılımı</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.wagnerDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="grade" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Hasta">
                  {stats.wagnerDist.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Diabetes type pie */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Diyabet Tipi Dağılımı</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.diyabetDist}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ type, count }) => `${type}: ${count}`}
                  labelLine={false}
                >
                  {stats.diyabetDist.map((_, index) => (
                    <Cell key={index} fill={['#1a3c6e', '#0d9488', '#f59e0b', '#ef4444'][index] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Comorbidity bar */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Komorbidite Dağılımı</h3>
            <div className="space-y-2">
              {stats.comorbidity.map(({ name, count }) => (
                <div key={name} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-24 flex-shrink-0">{name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: stats.activePatients > 0 ? `${(count / stats.activePatients) * 100}%` : '0%',
                        background: '#1a3c6e',
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-6 text-right">{count}</span>
                </div>
              ))}
              {stats.comorbidity.length === 0 && <p className="text-gray-400 text-sm">Veri yok</p>}
            </div>
          </div>
        </div>

        {/* Patient report export */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Hasta Bazlı Rapor Çıkart</h3>
            <p className="text-xs text-gray-500 mt-1">Her hasta için özet rapor TXT formatında indirebilirsiniz</p>
          </div>
          <div className="divide-y divide-gray-50">
            {patients.map(p => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <span className="font-semibold text-gray-900">{p.ad} {p.soyad}</span>
                  <span className="ml-2 text-xs text-gray-400">{p.yas} yaş · {p.diyabetTipi}</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/doktor/hasta/${p.id}`}
                    className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg no-underline hover:bg-gray-200"
                  >
                    Dosya Görüntüle
                  </Link>
                  <button
                    onClick={() => handleExportPatient(p)}
                    className="px-3 py-1.5 text-xs font-semibold bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                  >
                    📥 TXT Rapor
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
