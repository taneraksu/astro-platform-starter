// OrthoSolve - Patient Blood Glucose Log (elderly-friendly)
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
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

  const chartData = records
    .filter(r => r.aclik)
    .slice(0, 14)
    .reverse()
    .map(r => ({ date: formatDateTR(r.tarih), aclik: r.aclik, tokluk: r.tokluk }));

  const latest = records[0];

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f8', paddingBottom: '90px' }}>
      <PatientNavbar />
      <main className="max-w-lg mx-auto px-4 pt-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-5">💉 Kan Şekeri Takibim</h1>

        {/* Latest values */}
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
                <label className="block text-base font-bold text-gray-700 mb-2">
                  🌅 Açlık (Sabah ölçümü)
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    value={form.aclik}
                    onChange={e => set('aclik', e.target.value)}
                    inputMode="numeric"
                    min={20}
                    max={600}
                    placeholder="Örnek: 120"
                    className="flex-1 border-2 border-gray-200 rounded-2xl px-4 text-xl font-bold text-center focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    style={{ minHeight: '56px' }}
                  />
                  <span className="text-gray-500 font-semibold">mg/dL</span>
                </div>
              </div>
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">
                  🍽️ Tokluk (Yemekten 2 saat sonra)
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    value={form.tokluk}
                    onChange={e => set('tokluk', e.target.value)}
                    inputMode="numeric"
                    min={20}
                    max={600}
                    placeholder="Örnek: 160"
                    className="flex-1 border-2 border-gray-200 rounded-2xl px-4 text-xl font-bold text-center focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    style={{ minHeight: '56px' }}
                  />
                  <span className="text-gray-500 font-semibold">mg/dL</span>
                </div>
              </div>
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">
                  🌙 Gece (Yatmadan önce)
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    value={form.yatmadan}
                    onChange={e => set('yatmadan', e.target.value)}
                    inputMode="numeric"
                    min={20}
                    max={600}
                    placeholder="Örnek: 140"
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

        {/* Color guide */}
        <div className="bg-white rounded-3xl p-4 shadow-sm mb-5">
          <h3 className="text-base font-bold text-gray-700 mb-3">Renk Kılavuzu</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <span className="w-5 h-5 rounded-full bg-blue-400 flex-shrink-0" />
              <span><strong>Mavi:</strong> &lt;70 mg/dL — Düşük kan şekeri, hemen tatlı bir şey yeyin</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="w-5 h-5 rounded-full bg-green-400 flex-shrink-0" />
              <span><strong>Yeşil:</strong> 70-180 mg/dL — Normal, sürdürmeye devam edin</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="w-5 h-5 rounded-full bg-yellow-400 flex-shrink-0" />
              <span><strong>Sarı:</strong> 180-250 mg/dL — Yüksek, dikkatli olun</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="w-5 h-5 rounded-full bg-red-500 flex-shrink-0" />
              <span><strong>Kırmızı:</strong> &gt;250 mg/dL — Doktorunuzu arayın</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 1 && (
          <div className="bg-white rounded-3xl p-5 shadow-sm mb-5">
            <h3 className="text-base font-bold text-gray-700 mb-3">📈 Son 14 Günüm</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[50, 350]} />
                <Tooltip formatter={(v: number) => [`${v} mg/dL`]} />
                <ReferenceLine y={70} stroke="#2563eb" strokeDasharray="4 4" />
                <ReferenceLine y={180} stroke="#16a34a" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="aclik" stroke="#1a3c6e" strokeWidth={2.5} name="Açlık" dot={{ fill: '#1a3c6e', r: 4 }} />
                <Line type="monotone" dataKey="tokluk" stroke="#0d9488" strokeWidth={2} name="Tokluk" dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent records */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h3 className="text-base font-bold text-gray-700 mb-3">Son Kayıtlarım</h3>
          <div className="space-y-3">
            {records.slice(0, 7).map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                <span className="text-sm text-gray-500">{formatDateFullTR(r.tarih)}</span>
                <div className="flex gap-3">
                  {r.aclik && (
                    <span className={`text-sm font-bold ${r.aclik < 70 ? 'text-blue-600' : r.aclik > 250 ? 'text-red-600' : r.aclik > 180 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {r.aclik}
                    </span>
                  )}
                  {r.tokluk && (
                    <span className={`text-sm font-bold ${r.tokluk > 250 ? 'text-red-600' : r.tokluk > 180 ? 'text-yellow-600' : 'text-green-600'}`}>
                      / {r.tokluk}
                    </span>
                  )}
                  {r.hba1c && <span className="text-sm font-bold text-purple-600">HbA1c: {r.hba1c}%</span>}
                </div>
              </div>
            ))}
            {records.length === 0 && (
              <p className="text-center text-gray-400 py-4">Henüz kayıt yok</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
