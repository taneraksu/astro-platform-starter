// OrthoSolve - Blood Glucose Management (Doctor View)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend
} from 'recharts';
import DoctorNavbar from '../../components/DoctorNavbar';
import { patientStorage, glucoseStorage } from '../../storage';
import type { Patient, BloodGlucose } from '../../types';

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}`;
  } catch { return iso; }
}

function formatDateFull(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
  } catch { return iso; }
}

function glucoseColor(val?: number): string {
  if (!val) return 'text-gray-400';
  if (val < 70) return 'text-blue-600 font-bold';
  if (val <= 180) return 'text-green-600';
  if (val <= 250) return 'text-yellow-600';
  return 'text-red-600 font-bold';
}

function glucoseDot(cx: number, cy: number, value: number) {
  const color = value < 70 ? '#2563eb' : value <= 180 ? '#16a34a' : value <= 250 ? '#d97706' : '#dc2626';
  return <circle key={`dot_${cx}_${cy}`} cx={cx} cy={cy} r={4} fill={color} stroke="white" strokeWidth={1.5} />;
}

export default function GlucoseManagement() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<BloodGlucose[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'glucose' | 'hba1c'>('glucose');
  const [form, setForm] = useState({
    aclik: '', tokluk: '', yatmadan: '',
    hba1c: '', hedefHba1c: '7.0', insulinNotu: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    const p = patientStorage.getById(id);
    if (!p) { navigate('/doktor/dashboard'); return; }
    setPatient(p);
    setRecords(glucoseStorage.getByPatient(id));
  }, [id]);

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const rec = glucoseStorage.save({
      hastaId: id!,
      tarih: new Date().toISOString(),
      aclik: form.aclik ? Number(form.aclik) : undefined,
      tokluk: form.tokluk ? Number(form.tokluk) : undefined,
      yatmadan: form.yatmadan ? Number(form.yatmadan) : undefined,
      hba1c: form.hba1c ? Number(form.hba1c) : undefined,
      hedefHba1c: form.hedefHba1c ? Number(form.hedefHba1c) : undefined,
      insulinNotu: form.insulinNotu || undefined,
      girenKisi: 'doktor',
    });
    setRecords(prev => [rec, ...prev]);
    setShowForm(false);
    setForm({ aclik: '', tokluk: '', yatmadan: '', hba1c: '', hedefHba1c: '7.0', insulinNotu: '' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Prepare chart data (last 30 days, daily readings)
  const chartData = records
    .filter(r => r.aclik || r.tokluk)
    .slice(0, 30)
    .reverse()
    .map(r => ({
      date: formatDate(r.tarih),
      aclik: r.aclik,
      tokluk: r.tokluk,
      yatmadan: r.yatmadan,
    }));

  // HbA1c history
  const hba1cData = records
    .filter(r => r.hba1c)
    .slice(0, 10)
    .reverse()
    .map(r => ({
      date: formatDate(r.tarih),
      hba1c: r.hba1c,
      hedef: r.hedefHba1c || 7,
    }));

  const latestHba1c = records.find(r => r.hba1c);
  const avgFasting = records.filter(r => r.aclik).slice(0, 30)
    .reduce((sum, r, _, arr) => sum + (r.aclik || 0) / arr.length, 0);

  if (!patient) return <div className="min-h-screen bg-gray-50"><DoctorNavbar /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/doktor/hasta/${id}`)} className="text-gray-500 hover:text-gray-700 text-sm">← Geri</button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Kan Şekeri Yönetimi</h1>
              <p className="text-sm text-gray-500">{patient.ad} {patient.soyad}</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-white text-sm font-semibold rounded-xl hover:opacity-90"
            style={{ background: '#0d9488' }}
          >
            ➕ Değer Gir
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className={`text-2xl font-bold ${latestHba1c?.hba1c && latestHba1c.hba1c > 8 ? 'text-red-600' : latestHba1c?.hba1c && latestHba1c.hba1c > 7 ? 'text-yellow-600' : 'text-green-600'}`}>
              {latestHba1c?.hba1c ? `${latestHba1c.hba1c}%` : '—'}
            </div>
            <div className="text-xs text-gray-500 mt-1">Son HbA1c</div>
            {latestHba1c?.hedefHba1c && <div className="text-xs text-gray-400">Hedef: {latestHba1c.hedefHba1c}%</div>}
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className={`text-2xl font-bold ${avgFasting > 180 ? 'text-red-600' : avgFasting > 130 ? 'text-yellow-600' : 'text-green-600'}`}>
              {avgFasting > 0 ? Math.round(avgFasting) : '—'}
            </div>
            <div className="text-xs text-gray-500 mt-1">Ort. Açlık KŞ</div>
            <div className="text-xs text-gray-400">mg/dL (30 gün)</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-700">{records.filter(r => r.aclik || r.tokluk).length}</div>
            <div className="text-xs text-gray-500 mt-1">Toplam Ölçüm</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className={`text-2xl font-bold ${records.filter(r => r.aclik && r.aclik < 70).length > 0 ? 'text-blue-600' : 'text-green-600'}`}>
              {records.filter(r => r.aclik && r.aclik < 70).length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Hipoglisemi Sayısı</div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setFormType('glucose')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${formType === 'glucose' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Kan Şekeri Gir
              </button>
              <button
                type="button"
                onClick={() => setFormType('hba1c')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${formType === 'hba1c' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                HbA1c Gir
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              {formType === 'glucose' ? (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Açlık (mg/dL)</label>
                    <input type="number" value={form.aclik} onChange={e => set('aclik', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="120" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Tokluk (mg/dL)</label>
                    <input type="number" value={form.tokluk} onChange={e => set('tokluk', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="160" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Gece (mg/dL)</label>
                    <input type="number" value={form.yatmadan} onChange={e => set('yatmadan', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="140" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">HbA1c (%)</label>
                    <input type="number" step="0.1" value={form.hba1c} onChange={e => set('hba1c', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="7.2" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Hedef HbA1c (%)</label>
                    <input type="number" step="0.1" value={form.hedefHba1c} onChange={e => set('hedefHba1c', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="7.0" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">İnsülin Notu</label>
                    <input value={form.insulinNotu} onChange={e => set('insulinNotu', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Doz değişikliği..." />
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button type="submit" className="px-5 py-2.5 bg-blue-700 text-white rounded-xl font-semibold text-sm hover:bg-blue-800">Kaydet</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50">İptal</button>
              </div>
            </form>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Glucose trend */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">📈 Kan Şekeri Trendi (30 gün)</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[40, 400]} />
                  <Tooltip formatter={(v: number, name: string) => [`${v} mg/dL`, name === 'aclik' ? 'Açlık' : name === 'tokluk' ? 'Tokluk' : 'Gece']} />
                  <ReferenceLine y={70} stroke="#2563eb" strokeDasharray="4 4" label={{ value: '70', fontSize: 9, fill: '#2563eb' }} />
                  <ReferenceLine y={180} stroke="#16a34a" strokeDasharray="4 4" label={{ value: '180', fontSize: 9, fill: '#16a34a' }} />
                  <ReferenceLine y={250} stroke="#d97706" strokeDasharray="4 4" label={{ value: '250', fontSize: 9, fill: '#d97706' }} />
                  <Line type="monotone" dataKey="aclik" stroke="#2563eb" strokeWidth={2} name="aclik" dot={(props) => glucoseDot(props.cx, props.cy, props.value)} />
                  <Line type="monotone" dataKey="tokluk" stroke="#0d9488" strokeWidth={2} name="tokluk" dot={false} />
                  <Line type="monotone" dataKey="yatmadan" stroke="#7c3aed" strokeWidth={1.5} strokeDasharray="3 3" name="yatmadan" dot={false} />
                  <Legend formatter={(value) => value === 'aclik' ? 'Açlık' : value === 'tokluk' ? 'Tokluk' : 'Gece'} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-400 text-sm text-center py-8">Kan şekeri verisi yok</p>}
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-600 inline-block" /> &lt;70 Hipo</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-600 inline-block" /> 70-180 Normal</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-yellow-600 inline-block" /> 180-250</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-600 inline-block" /> &gt;250</span>
            </div>
          </div>

          {/* HbA1c bars */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">📊 HbA1c Geçmişi</h3>
            {hba1cData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={hba1cData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[4, 14]} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'HbA1c']} />
                  <ReferenceLine y={7} stroke="#16a34a" strokeDasharray="4 4" label={{ value: 'Hedef 7%', fontSize: 9, fill: '#16a34a' }} />
                  <ReferenceLine y={8} stroke="#dc2626" strokeDasharray="4 4" label={{ value: '8%', fontSize: 9, fill: '#dc2626' }} />
                  <Bar dataKey="hba1c" name="HbA1c" fill="#1a3c6e" radius={[4, 4, 0, 0]}
                    label={{ position: 'top', fontSize: 10, formatter: (v: number) => `${v}%` }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-400 text-sm text-center py-8">HbA1c kaydı yok</p>}
          </div>
        </div>

        {/* Recent records table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Son Kayıtlar</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Tarih</th>
                  <th className="px-4 py-3 text-right">Açlık</th>
                  <th className="px-4 py-3 text-right">Tokluk</th>
                  <th className="px-4 py-3 text-right">Gece</th>
                  <th className="px-4 py-3 text-right">HbA1c</th>
                  <th className="px-4 py-3 text-center">Kim Girdi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.slice(0, 20).map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{formatDateFull(r.tarih)}</td>
                    <td className={`px-4 py-3 text-right ${glucoseColor(r.aclik)}`}>{r.aclik ? `${r.aclik}` : '—'}</td>
                    <td className={`px-4 py-3 text-right ${glucoseColor(r.tokluk)}`}>{r.tokluk ? `${r.tokluk}` : '—'}</td>
                    <td className={`px-4 py-3 text-right ${glucoseColor(r.yatmadan)}`}>{r.yatmadan ? `${r.yatmadan}` : '—'}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${r.hba1c ? (r.hba1c > 8 ? 'text-red-600' : r.hba1c > 7 ? 'text-yellow-600' : 'text-green-600') : 'text-gray-400'}`}>
                      {r.hba1c ? `${r.hba1c}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.girenKisi === 'doktor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {r.girenKisi === 'doktor' ? '🩺 Doktor' : '👤 Hasta'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
