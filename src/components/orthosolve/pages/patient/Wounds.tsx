// OrthoSolve - Patient Wound Diary (simplified, elderly-friendly)
import React, { useState, useEffect } from 'react';
import PatientNavbar from '../../components/PatientNavbar';
import FootDiagram from '../../components/FootDiagram';
import { useAuth } from '../../auth';
import { woundStorage } from '../../storage';
import type { WoundRecord, WoundLocation } from '../../types';

function formatDateTR(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
  } catch { return iso; }
}

function NekrozBar({ granulasyon, fibrin, nekroz }: { granulasyon: number; fibrin: number; nekroz: number }) {
  return (
    <div className="flex rounded-full overflow-hidden h-3 mt-1">
      <div className="bg-green-400 transition-all" style={{ width: `${granulasyon}%` }} title={`Granülasyon %${granulasyon}`} />
      <div className="bg-yellow-400 transition-all" style={{ width: `${fibrin}%` }} title={`Fibrin %${fibrin}`} />
      <div className="bg-red-500 transition-all" style={{ width: `${nekroz}%` }} title={`Nekroz %${nekroz}`} />
    </div>
  );
}

export default function PatientWounds() {
  const { user } = useAuth();
  const [wounds, setWounds] = useState<WoundRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [locs, setLocs] = useState<WoundLocation[]>([]);
  const [form, setForm] = useState({
    notlar: '',
    koku: 'yok' as 'yok' | 'var' | 'şiddetli',
    kizariklik: false,
    odem: false,
    pansumanTipi: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setWounds(woundStorage.getByPatient(user.id));
  }, [user?.id]);

  const handleToggleLoc = (loc: WoundLocation) => {
    setLocs(prev => {
      const exists = prev.some(l => l.zone === loc.zone);
      return exists ? prev.filter(l => l.zone !== loc.zone) : [...prev, loc];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rec = woundStorage.save({
      hastaId: user!.id,
      tarih: new Date().toISOString(),
      lokalizasyon: locs,
      uzunluk: 0, genislik: 0, derinlik: 0,
      granulasyon: 0, fibrin: 0, nekroz: 0,
      yaraKenari: 'duzgun',
      kizariklik: form.kizariklik,
      isiArtisi: false,
      odem: form.odem,
      sekresyonTipi: 'yok',
      koku: form.koku,
      pansumanTipi: form.pansumanTipi,
      tedaviPlani: form.notlar,
    });
    setWounds(prev => [rec, ...prev]);
    setShowForm(false);
    setForm({ notlar: '', koku: 'yok', kizariklik: false, odem: false, pansumanTipi: '' });
    setLocs([]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f8', paddingBottom: '90px' }}>
      <PatientNavbar />
      <main className="max-w-lg mx-auto px-4 pt-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">🩹 Yara Takibim</h1>
        <p className="text-gray-500 text-sm mb-5">Yaranızdaki değişiklikleri kaydedin, doktorunuz görebilsin</p>

        {submitted && (
          <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-4 mb-4 text-center">
            <p className="text-xl font-bold text-green-700">✅ Kaydedildi!</p>
            <p className="text-green-600 text-sm">Notunuz başarıyla iletildi</p>
          </div>
        )}

        {/* Add new entry */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-3 py-5 text-white font-bold text-lg rounded-3xl mb-5 transition-colors active:scale-95"
            style={{ background: '#0d9488', minHeight: '64px' }}
          >
            ➕ Yeni Yara Notu Ekle
          </button>
        ) : (
          <div className="bg-white rounded-3xl p-5 shadow-sm mb-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Yeni Yara Notu</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Foot diagram */}
              <div>
                <p className="text-base font-bold text-gray-700 mb-3">📍 Yaranız nerede?</p>
                <FootDiagram selected={locs} onToggle={handleToggleLoc} />
              </div>

              {/* Simple symptoms */}
              <div>
                <p className="text-base font-bold text-gray-700 mb-3">Belirtiler</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer" style={{ minHeight: '56px' }}>
                    <input type="checkbox" checked={form.kizariklik} onChange={e => setForm(p => ({ ...p, kizariklik: e.target.checked }))} className="w-6 h-6 rounded" />
                    <span className="text-base font-semibold text-gray-700">🔴 Kızarıklık var</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer" style={{ minHeight: '56px' }}>
                    <input type="checkbox" checked={form.odem} onChange={e => setForm(p => ({ ...p, odem: e.target.checked }))} className="w-6 h-6 rounded" />
                    <span className="text-base font-semibold text-gray-700">💧 Şişlik / Ödem var</span>
                  </label>
                </div>
              </div>

              {/* Odor */}
              <div>
                <p className="text-base font-bold text-gray-700 mb-3">Koku</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['yok','var','şiddetli'] as const).map((val) => {
                    const labels: Record<string,string> = { 'yok':'😊 Koku Yok', 'var':'😟 Koku Var', 'şiddetli':'😣 Şiddetli' };
                    return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, koku: val }))}
                      className={`py-3 px-2 rounded-2xl text-sm font-semibold border-2 transition-colors ${form.koku === val ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      style={{ minHeight: '52px' }}
                    >
                      {labels[val]}
                    </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">📝 Notlarınız</label>
                <textarea
                  value={form.notlar}
                  onChange={e => setForm(p => ({ ...p, notlar: e.target.value }))}
                  rows={3}
                  placeholder="Yaranızdaki değişiklikler, ağrı durumu..."
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold text-base"
                  style={{ minHeight: '56px' }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="py-4 text-white rounded-2xl font-bold text-base transition-colors"
                  style={{ background: '#0d9488', minHeight: '56px' }}
                >
                  💾 Kaydet
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Wound history */}
        <h3 className="text-base font-bold text-gray-600 uppercase tracking-wide mb-3">Geçmiş Kayıtlar</h3>
        {wounds.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
            <p className="text-5xl mb-3">🩹</p>
            <p className="text-lg font-bold text-gray-700">Henüz kayıt yok</p>
            <p className="text-gray-400 text-sm mt-1">İlk yaranızı kaydetmek için yukarıdaki butonu kullanın</p>
          </div>
        ) : (
          <div className="space-y-4">
            {wounds.map(w => (
              <div key={w.id} className="bg-white rounded-3xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-800 text-base">
                      {w.lokalizasyon[0]?.label || 'Lokalizasyon belirtilmemiş'}
                    </p>
                    {w.lokalizasyon.length > 1 && (
                      <p className="text-xs text-gray-400">+{w.lokalizasyon.length - 1} daha</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-400 font-medium">{formatDateTR(w.tarih)}</span>
                </div>

                {/* Wagner grade if available */}
                {w.wagnerGrade !== undefined && (
                  <div className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full mb-3 ${
                    w.wagnerGrade <= 1 ? 'bg-green-100 text-green-800' :
                    w.wagnerGrade <= 3 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    🩺 Wagner Grade {w.wagnerGrade}
                  </div>
                )}

                {/* Symptoms */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {w.kizariklik && <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full font-semibold">🔴 Kızarıklık</span>}
                  {w.odem && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-semibold">💧 Ödem</span>}
                  {w.isiArtisi && <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full font-semibold">🌡 Isı Artışı</span>}
                  {w.koku !== 'yok' && <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full font-semibold">👃 Koku: {w.koku}</span>}
                </div>

                {/* Wound composition bar */}
                {(w.granulasyon + w.fibrin + w.nekroz) > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Yara Tabanı</p>
                    <NekrozBar granulasyon={w.granulasyon} fibrin={w.fibrin} nekroz={w.nekroz} />
                    <div className="flex gap-3 mt-1 text-xs">
                      <span className="text-green-600">▪ Gran. %{w.granulasyon}</span>
                      <span className="text-yellow-600">▪ Fibrin %{w.fibrin}</span>
                      <span className="text-red-600">▪ Nekroz %{w.nekroz}</span>
                    </div>
                  </div>
                )}

                {w.tedaviPlani && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                    📋 {w.tedaviPlani}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Emergency note */}
        <div className="mt-5 bg-red-50 border-2 border-red-300 rounded-3xl p-4">
          <p className="text-base font-bold text-red-800">⚠️ Dikkat!</p>
          <p className="text-sm text-red-700 mt-1">
            Yaranızda ani kötüleşme, ateş, şiddetli koku veya yeni kızarıklık görürseniz hemen doktorunuzu arayın.
          </p>
          <a
            href="tel:05321518797"
            className="inline-flex items-center gap-2 mt-3 px-5 py-3 bg-red-600 text-white font-bold rounded-2xl text-base no-underline"
          >
            📞 0532 151 87 97
          </a>
        </div>
      </main>
    </div>
  );
}
