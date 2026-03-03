// OrthoSolve - Patient Blood Glucose Log (elderly-friendly)
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import PatientNavbar from '../../components/PatientNavbar';
import { useAuth } from '../../auth';
import { glucoseStorage } from '../../storage';
import type { BloodGlucose } from '../../types';

function formatDateTR(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}`;
  } catch { return iso; }
}

function formatDateFullTR(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  } catch { return iso; }
}

function formatMonthTR(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
  } catch { return iso; }
}

function glucoseColor(v: number) {
  if (v < 70) return 'text-blue-600';
  if (v > 250) return 'text-red-600';
  if (v > 180) return 'text-yellow-600';
  return 'text-green-600';
}

function hba1cColor(v: number) {
  if (v < 7) return 'text-green-600';
  if (v <= 8) return 'text-yellow-600';
  return 'text-red-600';
}

function GlucoseIndicator({ value, label }: { value: number; label: string }) {
  let color = 'bg-green-100 border-green-400 text-green-800';
  let status = '✓ Normal';
  if (value < 70) { color = 'bg-blue-100 border-blue-400 text-blue-800'; status = '⚠️ Düşük'; }
  else if (value > 250) { color = 'bg-red-100 border-red-400 text-red-800'; status = '🔴 Çok Yüksek'; }
  else if (value > 180) { color = 'bg-yellow-100 border-yellow-400 text-yellow-800'; status = '⚠ Yüksek'; }

  return (
    <div className={`rounded-2xl p-4 border-2 ${color} text-center`}>
      <p className="text-sm font-semibold opacity-75">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      <p className="text-xs font-semibold mt-1">mg/dL</p>
      <p className="text-sm font-bold mt-1">{status}</p>
    </div>
  );
}

export default function PatientGlucoseLog() {
  const { user } = useAuth();
  const [records, setRecords] = useState<BloodGlucose[]>([]);
  const [form, setForm] = useState({ aclik: '', tokluk: '', yatmadan: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setRecords(glucoseStorage.getByPatient(user.id));
  }, [user?.id]);

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.aclik && !form.tokluk && !form.yatmadan) return;
    setLoading(true);
    setTimeout(() => {
      const rec = glucoseStorage.save({
        hastaId: user!.id,
        tarih: new Date().toISOString(),
        aclik: form.aclik ? Number(form.aclik) : undefined,
        tokluk: form.tokluk ? Number(form.tokluk) : undefined,
        yatmadan: form.yatmadan ? Number(form.yatmadan) : undefined,
        girenKisi: 'hasta',
      });
      setRecords(prev => [rec, ...prev]);
      setForm({ aclik: '', tokluk: '', yatmadan: '' });
      setSubmitted(true);
      setLoading(false);
      setTimeout(() => setSubmitted(false), 3000);
    }, 300);
  };

  // Açlık/Tokluk chart (son 14 gün)
  const glucoseRecords = records.filter(r => r.aclik || r.tokluk);
  const chartData = glucoseRecords
    .slice(0, 14)
    .reverse()
    .map(r => ({ date: formatDateTR(r.tarih), aclik: r.aclik, tokluk: r.tokluk }));

  // HbA1c chart
  const hba1cRecords = records.filter(r => r.hba1c !== undefined);
  const hba1cChartData = hba1cRecords
    .slice(0, 12)
    .reverse()
    .map(r => ({ date: formatMonthTR(r.tarih), hba1c: r.hba1c, hedef: r.hedefHba1c ?? 7.0 }));

  const latestHba1c = hba1cRecords[0];
  const latest = glucoseRecords[0];

  // History list
  const historyRecords = showAll ? records : records.slice(0, 10);

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f8', paddingBottom: '90px' }}>
      <PatientNavbar />
      <main className="max-w-lg mx-auto px-4 pt-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-5">💉 Kan Şekeri Takibim</h1>

        {/* Latest glucose values */}
        {latest && (
          <div className="mb-5">
            <p className="text-sm text-gray-500 font-semibold mb-3 uppercase tracking-wide">Son Değerlerim</p>
            <div className="grid grid-cols-3 gap-3">
              {latest.aclik && <GlucoseIndicator value={latest.aclik} label="Açlık" />}
              {latest.tokluk && <GlucoseIndicator value={latest.tokluk} label="Tokluk" />}
              {latest.yatmadan && <GlucoseIndicator value={latest.yatmadan} label="Gece" />}
            </div>
          </div>
        )}

        {/* Entry form */}
        <div className="bg-white rounded-3xl p-5 shadow-sm mb-5" style={{ border: '2px solid #e5e7eb' }}>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Değer Gir</h2>
          {submitted ? (
            <div className="text-center py-6">
              <p className="text-5xl mb-3">✅</p>
              <p className="text-xl font-bold text-green-700">Kaydedildi!</p>
              <p className="text-gray-500 mt-1">Değerleriniz başarıyla kaydedildi</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">🌅 Açlık (Sabah ölçümü)</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number" value={form.aclik} onChange={e => set('aclik', e.target.value)}
                    inputMode="numeric" min={20} max={600} placeholder="Örnek: 120"
                    className="flex-1 border-2 border-gray-200 rounded-2xl px-4 text-xl font-bold text-center focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    style={{ minHeight: '56px' }}
                  />
                  <span className="text-gray-500 font-semibold">mg/dL</span>
                </div>
              </div>
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">🍽️ Tokluk (Yemekten 2 saat sonra)</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number" value={form.tokluk} onChange={e => set('tokluk', e.target.value)}
                    inputMode="numeric" min={20} max={600} placeholder="Örnek: 160"
                    className="flex-1 border-2 border-gray-200 rounded-2xl px-4 text-xl font-bold text-center focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    style={{ minHeight: '56px' }}
                  />
                  <span className="text-gray-500 font-semibold">mg/dL</span>
                </div>
              </div>
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">🌙 Gece (Yatmadan önce)</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number" value={form.yatmadan} onChange={e => set('yatmadan', e.target.value)}
                    inputMode="numeric" min={20} max={600} placeholder="Örnek: 140"
                    className="flex-1 border-2 border-gray-200 rounded-2xl px-4 text-xl font-bold text-center focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    style={{ minHeight: '56px' }}
                  />
                  <span className="text-gray-500 font-semibold">mg/dL</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || (!form.aclik && !form.tokluk && !form.yatmadan)}
                className="w-full py-4 text-white font-bold text-lg rounded-2xl transition-colors disabled:opacity-50"
                style={{ background: '#0d9488', minHeight: '60px' }}
              >
                {loading ? 'Kaydediliyor...' : '💾 Değerleri Kaydet'}
              </button>
            </form>
          )}
        </div>

        {/* Glucose trend chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-sm mb-5">
            <h3 className="text-base font-bold text-gray-700 mb-1">📈 Kan Şekeri Trendi</h3>
            <p className="text-xs text-gray-400 mb-3">Son 14 giriş</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[50, 350]} />
                <Tooltip
                  formatter={(v: number, name: string) => [`${v} mg/dL`, name === 'aclik' ? 'Açlık' : 'Tokluk']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend formatter={n => n === 'aclik' ? 'Açlık' : 'Tokluk'} wrapperStyle={{ fontSize: '11px' }} />
                <ReferenceLine y={70} stroke="#2563eb" strokeDasharray="4 4" />
                <ReferenceLine y={180} stroke="#16a34a" strokeDasharray="4 4" label={{ value: '180', position: 'right', fontSize: 9, fill: '#16a34a' }} />
                <Line type="monotone" dataKey="aclik" stroke="#1a3c6e" strokeWidth={2.5} name="aclik" dot={{ fill: '#1a3c6e', r: 4 }} connectNulls />
                <Line type="monotone" dataKey="tokluk" stroke="#0d9488" strokeWidth={2} name="tokluk" dot={false} strokeDasharray="4 4" connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* HbA1c chart */}
        {hba1cChartData.length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-sm mb-5" style={{ border: '2px solid #e9d5ff' }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-gray-700">🧪 HbA1c Geçmişim</h3>
              {latestHba1c?.hba1c && (
                <span className={`text-lg font-bold ${hba1cColor(latestHba1c.hba1c)}`}>
                  {latestHba1c.hba1c}%
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-1">Hedef: &lt;{latestHba1c?.hedefHba1c ?? 7.0}% — Doktorunuzun girdiği değerler</p>
            <p className="text-xs text-gray-400 mb-3">
              {latestHba1c?.hba1c && latestHba1c.hba1c < 7
                ? '✅ Hedefe ulaşıldı!'
                : latestHba1c?.hba1c && latestHba1c.hba1c <= 8
                ? '⚠️ Hedefe yakın, devam edin'
                : '🔴 Hedefin üzerinde, doktorunuzla görüşün'}
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={hba1cChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[4, 12]} tickFormatter={v => `${v}%`} />
                <Tooltip
                  formatter={(v: number, name: string) => [
                    `${v}%`,
                    name === 'hba1c' ? 'HbA1c' : 'Hedef',
                  ]}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <ReferenceLine y={latestHba1c?.hedefHba1c ?? 7.0} stroke="#9333ea" strokeDasharray="5 4"
                  label={{ value: `Hedef ${latestHba1c?.hedefHba1c ?? 7}%`, position: 'insideTopRight', fontSize: 10, fill: '#9333ea' }}
                />
                <Line
                  type="monotone" dataKey="hba1c" stroke="#7c3aed" strokeWidth={2.5}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const color = payload.hba1c < 7 ? '#16a34a' : payload.hba1c <= 8 ? '#d97706' : '#dc2626';
                    return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />;
                  }}
                  name="hba1c"
                />
              </LineChart>
            </ResponsiveContainer>
            {/* HbA1c legend */}
            <div className="flex gap-3 mt-3 text-xs justify-center">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> &lt;7% İyi</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> 7-8% Orta</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> &gt;8% Yüksek</span>
            </div>
          </div>
        )}

        {/* History list */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-700">📋 Kan Şekeri Geçmişi</h3>
            <span className="text-xs text-gray-400 font-semibold">{records.length} kayıt</span>
          </div>

          {records.length === 0 ? (
            <p className="text-center text-gray-400 py-6">Henüz kayıt yok</p>
          ) : (
            <>
              <div className="space-y-2">
                {historyRecords.map(r => (
                  <div key={r.id} className="rounded-2xl p-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400 font-semibold">{formatDateFullTR(r.tarih)}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: r.girenKisi === 'doktor' ? '#f3e8ff' : '#f0fdf4', color: r.girenKisi === 'doktor' ? '#7c3aed' : '#15803d' }}>
                        {r.girenKisi === 'doktor' ? '👨‍⚕️ Doktor' : '🧑 Sen'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {r.aclik !== undefined && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">Açlık:</span>
                          <span className={`text-sm font-bold ${glucoseColor(r.aclik)}`}>{r.aclik} mg/dL</span>
                        </div>
                      )}
                      {r.tokluk !== undefined && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">Tokluk:</span>
                          <span className={`text-sm font-bold ${glucoseColor(r.tokluk)}`}>{r.tokluk} mg/dL</span>
                        </div>
                      )}
                      {r.yatmadan !== undefined && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">Gece:</span>
                          <span className={`text-sm font-bold ${glucoseColor(r.yatmadan)}`}>{r.yatmadan} mg/dL</span>
                        </div>
                      )}
                      {r.hba1c !== undefined && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">HbA1c:</span>
                          <span className={`text-sm font-bold ${hba1cColor(r.hba1c)}`}>{r.hba1c}%</span>
                          {r.hedefHba1c && (
                            <span className="text-xs text-gray-400">(Hedef: {r.hedefHba1c}%)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {records.length > 10 && (
                <button
                  onClick={() => setShowAll(v => !v)}
                  className="w-full mt-4 py-3 text-sm font-bold rounded-2xl transition-colors"
                  style={{ background: '#f1f5f9', color: '#475569' }}
                >
                  {showAll ? '▲ Daha az göster' : `▼ Tümünü gör (${records.length - 10} daha)`}
                </button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
