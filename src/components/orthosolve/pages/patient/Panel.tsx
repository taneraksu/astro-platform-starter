// OrthoSolve - Patient Home Panel (elderly-friendly: large fonts, simple navigation)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PatientNavbar from '../../components/PatientNavbar';
import { useAuth } from '../../auth';
import { glucoseStorage, appointmentStorage, alertStorage, wagnerStorage } from '../../storage';
import type { BloodGlucose, Appointment, Alert } from '../../types';

function formatDateTR(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
  } catch { return iso; }
}

function GlucoseStatus({ value }: { value?: number }) {
  if (!value) return null;
  if (value < 70) return <span className="text-blue-700 font-bold text-sm">⚠️ Düşük ({value})</span>;
  if (value <= 180) return <span className="text-green-700 font-bold text-sm">✓ Normal ({value})</span>;
  if (value <= 250) return <span className="text-yellow-700 font-bold text-sm">⚠ Yüksek ({value})</span>;
  return <span className="text-red-700 font-bold text-sm">🔴 Çok Yüksek ({value})</span>;
}

export default function PatientPanel() {
  const { user } = useAuth();
  const [latestGlucose, setLatestGlucose] = useState<BloodGlucose | null>(null);
  const [nextAppt, setNextAppt] = useState<Appointment | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [latestWagner, setLatestWagner] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const glucose = glucoseStorage.getByPatient(user.id);
    setLatestGlucose(glucose[0] || null);

    const today = new Date().toISOString().slice(0, 10);
    const appts = appointmentStorage.getByPatient(user.id)
      .filter(a => a.tarih >= today && a.durum === 'onaylandi')
      .sort((a, b) => a.tarih.localeCompare(b.tarih));
    setNextAppt(appts[0] || null);

    const wagnerRecords = wagnerStorage.getByPatient(user.id);
    setLatestWagner(wagnerRecords[0]?.grade ?? null);

    setAlerts(alertStorage.getAll().filter(a => a.hastaId === user.id && !a.okundu));
  }, [user?.id]);

  const glucoseToday = latestGlucose && new Date(latestGlucose.tarih).toDateString() === new Date().toDateString();

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f8', paddingBottom: '80px' }}>
      <PatientNavbar />

      <main className="max-w-lg mx-auto px-4 pt-4">
        {/* Greeting */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Merhaba, {user?.ad}! 👋</h1>
          <p className="text-gray-500 text-base mt-1">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2 mb-5">
            {alerts.slice(0, 2).map(alert => (
              <div
                key={alert.id}
                className={`rounded-2xl p-4 border-2 ${alert.seviye === 'critical' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'}`}
              >
                <p className={`font-bold text-base ${alert.seviye === 'critical' ? 'text-red-800' : 'text-yellow-800'}`}>
                  {alert.seviye === 'critical' ? '🚨 Önemli Uyarı' : '⚠️ Uyarı'}
                </p>
                <p className={`text-sm mt-1 ${alert.seviye === 'critical' ? 'text-red-700' : 'text-yellow-700'}`}>
                  {alert.mesaj}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Today's glucose status card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm mb-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">💉 Bugünkü Kan Şekerim</h2>
            {glucoseToday && <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-semibold">Girildi ✓</span>}
          </div>
          {glucoseToday && latestGlucose ? (
            <div className="space-y-2">
              {latestGlucose.aclik && (
                <div className="flex justify-between items-center">
                  <span className="text-base text-gray-600">Açlık:</span>
                  <GlucoseStatus value={latestGlucose.aclik} />
                </div>
              )}
              {latestGlucose.tokluk && (
                <div className="flex justify-between items-center">
                  <span className="text-base text-gray-600">Tokluk:</span>
                  <GlucoseStatus value={latestGlucose.tokluk} />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-gray-500 text-base mb-3">Bugün henüz girilmedi</p>
              <Link
                to="/hasta/kan-sekeri"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-white font-bold text-base rounded-2xl no-underline transition-colors"
                style={{ background: '#0d9488', minHeight: '52px' }}
              >
                💉 Kan Şekeri Gir
              </Link>
            </div>
          )}
          {!glucoseToday && (
            <Link to="/hasta/kan-sekeri" className="block mt-3 text-center text-sm font-semibold no-underline" style={{ color: '#0d9488' }}>
              Geçmiş değerlerimi göster →
            </Link>
          )}
        </div>

        {/* Quick actions */}
        <h3 className="text-base font-bold text-gray-600 uppercase tracking-wide mb-3">Hızlı Erişim</h3>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <Link
            to="/hasta/kan-sekeri"
            className="flex flex-col items-center justify-center gap-2 p-5 bg-white rounded-3xl shadow-sm no-underline transition-all active:scale-95"
            style={{ minHeight: '110px', border: '2px solid #e5e7eb' }}
          >
            <span className="text-4xl">💉</span>
            <span className="text-base font-bold text-gray-800 text-center">Kan Şekeri</span>
          </Link>
          <Link
            to="/hasta/yaralar"
            className="flex flex-col items-center justify-center gap-2 p-5 bg-white rounded-3xl shadow-sm no-underline transition-all active:scale-95"
            style={{ minHeight: '110px', border: '2px solid #e5e7eb' }}
          >
            <span className="text-4xl">🩹</span>
            <span className="text-base font-bold text-gray-800 text-center">Yara Takibi</span>
          </Link>
          <Link
            to="/hasta/iletisim"
            className="flex flex-col items-center justify-center gap-2 p-5 text-white rounded-3xl shadow-sm no-underline transition-all active:scale-95"
            style={{ minHeight: '110px', background: '#1a3c6e' }}
          >
            <span className="text-4xl">📞</span>
            <span className="text-base font-bold text-center">Doktorum ile İletişim</span>
          </Link>
          <a
            href="tel:05321518797"
            className="flex flex-col items-center justify-center gap-2 p-5 text-white rounded-3xl shadow-sm no-underline transition-all active:scale-95"
            style={{ minHeight: '110px', background: '#dc2626' }}
          >
            <span className="text-4xl">🆘</span>
            <span className="text-base font-bold text-center">ACİL ARA</span>
          </a>
        </div>

        {/* Next appointment */}
        {nextAppt && (
          <div className="bg-white rounded-3xl p-5 shadow-sm mb-4 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-2">📅 Yaklaşan Randevunuz</h3>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-bold" style={{ background: '#1a3c6e' }}>
                <span className="text-xl">{new Date(nextAppt.tarih).getDate()}</span>
                <span className="text-xs">{new Date(nextAppt.tarih).toLocaleDateString('tr-TR', { month: 'short' })}</span>
              </div>
              <div>
                <p className="font-bold text-gray-800 text-base">{nextAppt.saat}</p>
                <p className="text-gray-600 text-sm">{nextAppt.sikayet}</p>
              </div>
            </div>
          </div>
        )}

        {/* Latest wound info */}
        {latestWagner !== null && (
          <div className={`rounded-3xl p-5 shadow-sm mb-4 border-2 ${latestWagner >= 3 ? 'bg-red-50 border-red-300' : latestWagner >= 1 ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300'}`}>
            <h3 className="text-lg font-bold mb-1" style={{ color: latestWagner >= 3 ? '#991b1b' : latestWagner >= 1 ? '#92400e' : '#14532d' }}>
              🩺 Son Yara Değerlendirmesi
            </h3>
            <p className="text-base font-semibold" style={{ color: latestWagner >= 3 ? '#dc2626' : latestWagner >= 1 ? '#d97706' : '#16a34a' }}>
              Wagner Grade {latestWagner}
              {latestWagner === 0 ? ' — Yara yok ✓' : latestWagner <= 2 ? ' — Takip gerekiyor' : ' — Acil takip!'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Doktorunuzun son değerlendirmesi</p>
          </div>
        )}

        {/* Info card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
          <h3 className="text-base font-bold text-gray-800 mb-3">📌 Günlük Hatırlatmalar</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2"><span className="text-green-500 font-bold">✓</span> Her sabah açlık kan şekerinizi ölçün</li>
            <li className="flex items-start gap-2"><span className="text-green-500 font-bold">✓</span> Ayaklarınızı her gün kontrol edin</li>
            <li className="flex items-start gap-2"><span className="text-green-500 font-bold">✓</span> Yaralarınızdaki değişiklikleri fotoğraflayın</li>
            <li className="flex items-start gap-2"><span className="text-green-500 font-bold">✓</span> İlaçlarınızı düzenli kullanın</li>
            <li className="flex items-start gap-2"><span className="text-red-500 font-bold">!</span> Yeni yara veya kızarıklık görürseniz hemen arayın</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
