// OrthoSolve - Procedure / Surgery Log
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DoctorNavbar from '../../components/DoctorNavbar';
import { patientStorage, procedureStorage } from '../../storage';
import type { Patient, Procedure } from '../../types';

const PROCEDURE_TYPES = [
  'Debridman — Enzimatik',
  'Debridman — Cerrahi',
  'Debridman — Mekanik',
  'Minor Amputasyon',
  'Major Amputasyon — Transtibial',
  'Major Amputasyon — Transfemoral',
  'Major Amputasyon — Syme',
  'Major Amputasyon — Chopart',
  'Major Amputasyon — Lisfranc',
  'Revaskülarizasyon',
  'VAC (Negatif Basınçlı Yara Tedavisi) — Başlangıç',
  'VAC — Bitiş',
  'Deri Grefti',
  'Flep',
  'Küretaj (Osteomyelit)',
  'Diğer',
];

const CERRAHLAR = ['Op. Dr. Taner Aksu', 'Prof. Dr. Mustafa Gökhan Bilgili', 'Diğer'];

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
  } catch { return iso; }
}

const PROCEDURE_ICONS: Record<string, string> = {
  'Debridman': '🔪',
  'Minor Amputasyon': '✂️',
  'Major Amputasyon': '🏥',
  'Revaskülarizasyon': '🩸',
  'VAC': '💨',
  'Deri Grefti': '🩹',
  'Flep': '🩹',
  'Küretaj': '🔬',
};

function getProcedureIcon(tip: string): string {
  for (const [key, icon] of Object.entries(PROCEDURE_ICONS)) {
    if (tip.includes(key)) return icon;
  }
  return '🏥';
}

export default function Procedures() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    tarih: new Date().toISOString().slice(0, 10),
    tip: PROCEDURE_TYPES[0],
    detay: '',
    cerrah: CERRAHLAR[0],
    notlar: '',
    komplikasyonlar: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    const p = patientStorage.getById(id);
    if (!p) { navigate('/doktor/dashboard'); return; }
    setPatient(p);
    setProcedures(procedureStorage.getByPatient(id));
  }, [id]);

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proc = procedureStorage.save({
      hastaId: id!,
      tarih: new Date(form.tarih).toISOString(),
      tip: form.tip,
      detay: form.detay,
      cerrah: form.cerrah,
      notlar: form.notlar,
      komplikasyonlar: form.komplikasyonlar,
    });
    setProcedures(prev => [proc, ...prev]);
    setShowForm(false);
    setForm({ tarih: new Date().toISOString().slice(0, 10), tip: PROCEDURE_TYPES[0], detay: '', cerrah: CERRAHLAR[0], notlar: '', komplikasyonlar: '' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = (procId: string) => {
    if (!confirm('Bu işlem kaydı silinsin mi?')) return;
    procedureStorage.delete(procId);
    setProcedures(prev => prev.filter(p => p.id !== procId));
  };

  if (!patient) return <div className="min-h-screen bg-gray-50"><DoctorNavbar /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/doktor/hasta/${id}`)} className="text-gray-500 hover:text-gray-700 text-sm">← Geri</button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Prosedür Günlüğü</h1>
              <p className="text-sm text-gray-500">{patient.ad} {patient.soyad}</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-white text-sm font-semibold rounded-xl transition-colors hover:opacity-90"
            style={{ background: '#0d9488' }}
          >
            ➕ İşlem Ekle
          </button>
        </div>

        {/* Add Procedure Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">Yeni Prosedür Kaydı</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Tarih</label>
                  <input type="date" value={form.tarih} onChange={e => set('tarih', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Cerrah</label>
                  <select value={form.cerrah} onChange={e => set('cerrah', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white">
                    {CERRAHLAR.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">İşlem Tipi</label>
                <select value={form.tip} onChange={e => set('tip', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white">
                  {PROCEDURE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Detay / Açıklama</label>
                <input value={form.detay} onChange={e => set('detay', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Hangi bölge, nasıl yapıldı..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Operasyon Notları</label>
                <textarea value={form.notlar} onChange={e => set('notlar', e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Operasyon bulguları, uygulanan teknik..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Komplikasyonlar</label>
                <input value={form.komplikasyonlar} onChange={e => set('komplikasyonlar', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Yok / varsa belirtin..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-5 py-2.5 bg-blue-700 text-white rounded-xl font-semibold text-sm hover:bg-blue-800">Kaydet</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50">İptal</button>
              </div>
            </form>
          </div>
        )}

        {/* Procedures list */}
        {procedures.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">
            <p className="text-4xl mb-2">🏥</p>
            <p className="font-medium">Prosedür kaydı bulunamadı</p>
            <p className="text-sm mt-1">İlk prosedürü eklemek için "İşlem Ekle" butonunu kullanın</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 hidden sm:block" />
            <div className="space-y-4">
              {procedures.map(proc => (
                <div key={proc.id} className="sm:pl-12 relative">
                  {/* Timeline dot */}
                  <div className="absolute left-4.5 top-6 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow hidden sm:block" style={{ left: '18px' }} />
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getProcedureIcon(proc.tip)}</span>
                        <div>
                          <span className="font-semibold text-gray-900 text-sm">{proc.tip}</span>
                          <p className="text-xs text-gray-400">{formatDate(proc.tarih)} — {proc.cerrah}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(proc.id)}
                        className="text-gray-300 hover:text-red-500 text-sm p-1 transition-colors"
                        title="Sil"
                      >
                        🗑
                      </button>
                    </div>
                    {proc.detay && <p className="text-sm text-gray-700 mb-2">{proc.detay}</p>}
                    {proc.notlar && (
                      <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 mb-2">
                        <span className="font-semibold">Not:</span> {proc.notlar}
                      </div>
                    )}
                    {proc.komplikasyonlar && proc.komplikasyonlar !== 'Yok' && (
                      <div className="bg-red-50 rounded-xl p-3 text-xs text-red-700">
                        <span className="font-semibold">⚠️ Komplikasyon:</span> {proc.komplikasyonlar}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
