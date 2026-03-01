// OrthoSolve - Full Patient Detail Page
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DoctorNavbar from '../../components/DoctorNavbar';
import {
  patientStorage, woundStorage, glucoseStorage,
  procedureStorage, wagnerStorage, abiStorage, appointmentStorage
} from '../../storage';
import type { Patient, WoundRecord, WagnerScore, ABIScore } from '../../types';

function formatDate(iso: string) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
  } catch { return iso; }
}

function ABIBadge({ abi }: { abi: number }) {
  if (abi < 0.5) return <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">ABI {abi.toFixed(2)} ⚠️ KRİTİK</span>;
  if (abi < 0.9) return <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">ABI {abi.toFixed(2)} ⚠</span>;
  return <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">ABI {abi.toFixed(2)} ✓</span>;
}

function WagnerBadge({ grade }: { grade: number }) {
  const colors = ['bg-green-100 text-green-800','bg-yellow-100 text-yellow-800','bg-orange-100 text-orange-800','bg-red-100 text-red-800','bg-red-200 text-red-900','bg-purple-200 text-purple-900'];
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors[grade]||'bg-gray-100 text-gray-800'}`}>Wagner {grade}</span>;
}

type TabId = 'ozet' | 'yaralar' | 'kan-sekeri' | 'islemler' | 'skorlama';

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('ozet');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [wounds, setWounds] = useState<WoundRecord[]>([]);
  const [latestWagner, setLatestWagner] = useState<WagnerScore | null>(null);
  const [latestAbi, setLatestAbi] = useState<ABIScore | null>(null);

  useEffect(() => {
    if (!id) return;
    const p = patientStorage.getById(id);
    if (!p) { navigate('/doktor/dashboard'); return; }
    setPatient(p);
    setWounds(woundStorage.getByPatient(id));
    setLatestWagner(wagnerStorage.getByPatient(id)[0] || null);
    setLatestAbi(abiStorage.getByPatient(id)[0] || null);
  }, [id]);

  if (!patient) return <div className="min-h-screen bg-gray-50"><DoctorNavbar /><div className="flex items-center justify-center h-64 text-gray-400">Yükleniyor...</div></div>;

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'ozet', label: 'Özet', icon: '📋' },
    { id: 'yaralar', label: 'Yaralar', icon: '🩹' },
    { id: 'kan-sekeri', label: 'Kan Şekeri', icon: '💉' },
    { id: 'islemler', label: 'İşlemler', icon: '🔪' },
    { id: 'skorlama', label: 'Skorlama', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <main className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/doktor/dashboard')} className="text-gray-500 hover:text-gray-700 text-sm p-2 hover:bg-gray-100 rounded-lg">← Geri</button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.ad} {patient.soyad}</h1>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <span className="text-gray-500 text-sm">{patient.yas} yaş • {patient.diyabetTipi}</span>
                {latestWagner && <WagnerBadge grade={latestWagner.grade} />}
                {latestAbi && <ABIBadge abi={Math.min(latestAbi.sagABI, latestAbi.solABI)} />}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <Link to={`/doktor/hasta/${id}/skorlama`} className="px-3 py-1.5 text-xs font-semibold bg-blue-700 text-white rounded-lg no-underline hover:bg-blue-800">📊 Skorlama</Link>
            <Link to={`/doktor/hasta/${id}/islemler`} className="px-3 py-1.5 text-xs font-semibold bg-orange-600 text-white rounded-lg no-underline hover:bg-orange-700">🔪 İşlem Ekle</Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 flex-wrap">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                tab === t.id ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* TAB: Özet */}
        {tab === 'ozet' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal info */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">👤 Kişisel Bilgiler</h3>
              <dl className="space-y-2 text-sm">
                {[
                  ['TC Kimlik', patient.tcKimlikNo],
                  ['Doğum Tarihi', patient.dogumTarihi],
                  ['Yaş', `${patient.yas} yaş`],
                  ['Telefon', patient.telefon],
                  ['Adres', patient.adres],
                  ['Acil İletişim', `${patient.acilKisi} — ${patient.acilTelefon}`],
                  ['Boy / Kilo', `${patient.boy} cm / ${patient.kilo} kg`],
                  ['BMI', patient.bmi.toFixed(1)],
                  ['Kayıt Tarihi', formatDate(patient.kayitTarihi)],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <dt className="text-gray-500 w-32 flex-shrink-0">{k}:</dt>
                    <dd className="font-medium text-gray-800">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Medical history */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">🩺 Tıbbi Geçmiş</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <dt className="text-gray-500 w-32">Diyabet:</dt>
                  <dd className="font-medium">{patient.diyabetTipi} ({patient.diyabetBaslangicYili}'den beri)</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-500 w-32">İlaçlar:</dt>
                  <dd>
                    <div className="flex flex-wrap gap-1">
                      {patient.ilaclar.map(i => <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{i}</span>)}
                      {patient.ilaclar.length === 0 && <span className="text-gray-400">Belirtilmemiş</span>}
                    </div>
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-500 w-32">Komorbidite:</dt>
                  <dd>
                    <div className="flex flex-wrap gap-1">
                      {patient.komorbidite.map(k => <span key={k} className="bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-full">{k}</span>)}
                      {patient.komorbidite.length === 0 && <span className="text-gray-400">Yok</span>}
                    </div>
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-500 w-32">Sigara:</dt>
                  <dd className={`font-medium ${patient.sigara ? 'text-red-600' : 'text-green-600'}`}>{patient.sigara ? 'Evet' : 'Hayır'}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-500 w-32">Alkol:</dt>
                  <dd className={`font-medium ${patient.alkol ? 'text-yellow-600' : 'text-green-600'}`}>{patient.alkol ? 'Evet' : 'Hayır'}</dd>
                </div>
                {patient.amputasyonHikayesi && (
                  <div className="flex gap-2">
                    <dt className="text-gray-500 w-32">Amputasyon:</dt>
                    <dd className="font-medium text-red-700">⚠️ {patient.amputasyonSeviye || 'Var'}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Latest scores summary */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">📊 Son Değerlendirmeler</h3>
              <div className="space-y-3 text-sm">
                {latestWagner ? (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Son Wagner</span>
                    <div className="flex items-center gap-2">
                      <WagnerBadge grade={latestWagner.grade} />
                      <span className="text-xs text-gray-400">{formatDate(latestWagner.tarih)}</span>
                    </div>
                  </div>
                ) : <p className="text-gray-400 text-xs">Wagner skoru yok</p>}
                {latestAbi ? (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Son ABI</span>
                    <div className="flex items-center gap-2">
                      <ABIBadge abi={Math.min(latestAbi.sagABI, latestAbi.solABI)} />
                      <span className="text-xs text-gray-400">{formatDate(latestAbi.tarih)}</span>
                    </div>
                  </div>
                ) : <p className="text-gray-400 text-xs">ABI ölçümü yok</p>}
              </div>
            </div>

            {/* Wounds summary */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">🩹 Yara Özeti</h3>
              {wounds.length === 0 ? (
                <p className="text-gray-400 text-sm">Kayıtlı yara yok</p>
              ) : (
                <div className="space-y-2">
                  {wounds.slice(0, 3).map(w => (
                    <div key={w.id} className="p-3 bg-gray-50 rounded-xl text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-gray-800">
                          {w.lokalizasyon[0]?.label || 'Belirtilmemiş'}
                        </span>
                        <span className="text-gray-400">{formatDate(w.tarih)}</span>
                      </div>
                      <p className="text-gray-600">
                        {w.uzunluk}×{w.genislik}×{w.derinlik} cm •
                        Nekroz %{w.nekroz} •
                        {w.koku !== 'yok' ? ` Koku: ${w.koku}` : ' Koku yok'}
                      </p>
                    </div>
                  ))}
                  {wounds.length > 3 && (
                    <button onClick={() => setTab('yaralar')} className="text-xs text-blue-600 hover:underline cursor-pointer">
                      +{wounds.length - 3} daha göster
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Yaralar — redirect to wounds page */}
        {tab === 'yaralar' && (
          <WoundsTab patientId={id!} />
        )}

        {/* TAB: Kan Şekeri */}
        {tab === 'kan-sekeri' && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Detaylı kan şekeri takibi için</p>
            <Link to={`/doktor/hasta/${id}/kan-sekeri`} className="px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold no-underline hover:bg-blue-800">
              💉 Kan Şekeri Yönetimine Git
            </Link>
          </div>
        )}

        {/* TAB: İşlemler */}
        {tab === 'islemler' && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Prosedür ve müdahale günlüğü için</p>
            <Link to={`/doktor/hasta/${id}/islemler`} className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold no-underline hover:bg-orange-700">
              🔪 İşlemler Sayfasına Git
            </Link>
          </div>
        )}

        {/* TAB: Skorlama */}
        {tab === 'skorlama' && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Tüm skorlama araçları için</p>
            <Link to={`/doktor/hasta/${id}/skorlama`} className="px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold no-underline hover:bg-blue-800">
              📊 Skorlama Sayfasına Git
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

// Inline wounds tab component
function WoundsTab({ patientId }: { patientId: string }) {
  const [wounds, setWounds] = useState(() => woundStorage.getByPatient(patientId));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800">Yara Kayıtları ({wounds.length})</h3>
        <Link
          to={`/doktor/hasta/${patientId}/skorlama`}
          className="text-sm px-4 py-2 bg-teal-600 text-white rounded-xl no-underline font-semibold hover:bg-teal-700"
        >
          ➕ Yeni Değerlendirme
        </Link>
      </div>
      {wounds.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">
          <p className="text-4xl mb-2">🩹</p>
          <p>Yara kaydı bulunmuyor</p>
        </div>
      ) : (
        <div className="space-y-4">
          {wounds.map(w => (
            <div key={w.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-semibold text-gray-900">{w.lokalizasyon[0]?.label || 'Belirtilmemiş'}</span>
                  {w.wagnerGrade !== undefined && (
                    <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                      w.wagnerGrade <= 1 ? 'bg-green-100 text-green-800' :
                      w.wagnerGrade <= 3 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                    }`}>W{w.wagnerGrade}</span>
                  )}
                </div>
                <span className="text-sm text-gray-400">{new Date(w.tarih).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
                <div><p className="font-semibold text-gray-500 mb-0.5">Boyutlar</p><p>{w.uzunluk}×{w.genislik}×{w.derinlik} cm</p></div>
                <div><p className="font-semibold text-gray-500 mb-0.5">Yara Tabanı</p><p>G:{w.granulasyon}% F:{w.fibrin}% N:{w.nekroz}%</p></div>
                <div><p className="font-semibold text-gray-500 mb-0.5">Enfeksiyon</p><p>{[w.kizariklik&&'Kızarıklık',w.isiArtisi&&'Isı↑',w.odem&&'Ödem'].filter(Boolean).join(', ')||'Yok'}</p></div>
                <div><p className="font-semibold text-gray-500 mb-0.5">Sekresyon</p><p>{w.sekresyonTipi} / Koku: {w.koku}</p></div>
              </div>
              {w.tedaviPlani && <p className="text-xs text-gray-500 mt-3 bg-gray-50 p-2 rounded-lg">📋 {w.tedaviPlani}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
