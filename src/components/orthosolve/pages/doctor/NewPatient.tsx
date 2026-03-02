// OrthoSolve - New Patient Registration Form
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorNavbar from '../../components/DoctorNavbar';
import { patientStorage } from '../../storage';
import type { Patient, DiyabetTipi } from '../../types';

const KOMORBIDITE_OPTIONS = ['HT', 'KAH', 'Böbrek Yetmezliği', 'Retinopati', 'Nöropati', 'PAH'];
const ILAC_OPTIONS = [
  'Metformin', 'Insülin (Bazal)', 'İnsülin (Bolus)', 'GLP-1 Agonist',
  'SGLT2 İnhibitör', 'DPP4 İnhibitör', 'Sulfonilüre', 'Aspirin',
  'Statin', 'ACE İnhibitör / ARB', 'Beta Bloker', 'Diüretik',
];

function generateId(): string {
  return 'p_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function calcBMI(boy: number, kilo: number): number {
  if (!boy || !kilo) return 0;
  const boya = boy / 100;
  return Math.round((kilo / (boya * boya)) * 10) / 10;
}

function calcAge(dogumTarihi: string): number {
  // DD.MM.YYYY
  const parts = dogumTarihi.split('.');
  if (parts.length !== 3) return 0;
  const [d, m, y] = parts.map(Number);
  const birth = new Date(y, m - 1, d);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function NewPatient() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    ad: '', soyad: '', tcKimlikNo: '', dogumTarihi: '',
    telefon: '', adres: '', acilKisi: '', acilTelefon: '',
    boy: '', kilo: '',
    diyabetTipi: 'Tip 2' as DiyabetTipi,
    diyabetBaslangicYili: new Date().getFullYear().toString(),
    ilaclar: [] as string[], ilacSerbest: '',
    komorbidite: [] as string[],
    sigara: false, alkol: false,
    amputasyonHikayesi: false, amputasyonSeviye: '',
    pin: '',
  });

  const bmi = calcBMI(Number(form.boy), Number(form.kilo));
  const yas = calcAge(form.dogumTarihi);

  const set = (field: string, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const toggleArray = (field: 'ilaclar' | 'komorbidite', value: string) => {
    setForm(prev => {
      const arr = prev[field];
      return { ...prev, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!form.ad.trim()) errs.ad = 'Ad zorunlu';
      if (!form.soyad.trim()) errs.soyad = 'Soyad zorunlu';
      if (!form.tcKimlikNo.match(/^\d{11}$/)) errs.tcKimlikNo = 'TC Kimlik No 11 haneli olmalı';
      if (!form.dogumTarihi.match(/^\d{2}\.\d{2}\.\d{4}$/)) errs.dogumTarihi = 'GG.AA.YYYY formatında girin';
      if (!form.telefon.trim()) errs.telefon = 'Telefon zorunlu';
    }
    if (s === 3) {
      if (!form.pin.match(/^\d{4,6}$/)) errs.pin = 'PIN 4-6 haneli sayı olmalı';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(s => s + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    const ilaclar = [...form.ilaclar];
    if (form.ilacSerbest.trim()) ilaclar.push(form.ilacSerbest);

    const patient: Patient = {
      id: generateId(),
      ad: form.ad.trim(),
      soyad: form.soyad.trim(),
      tcKimlikNo: form.tcKimlikNo,
      dogumTarihi: form.dogumTarihi,
      yas,
      telefon: form.telefon,
      adres: form.adres,
      acilKisi: form.acilKisi,
      acilTelefon: form.acilTelefon,
      boy: Number(form.boy),
      kilo: Number(form.kilo),
      bmi,
      diyabetTipi: form.diyabetTipi,
      diyabetBaslangicYili: Number(form.diyabetBaslangicYili),
      ilaclar,
      komorbidite: form.komorbidite,
      sigara: form.sigara,
      alkol: form.alkol,
      amputasyonHikayesi: form.amputasyonHikayesi,
      amputasyonSeviye: form.amputasyonSeviye,
      pin: form.pin,
      aktif: true,
      kayitTarihi: new Date().toISOString().slice(0, 10),
    };

    patientStorage.save(patient);
    navigate(`/doktor/hasta/${patient.id}`);
  };

  const inputClass = "w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  const errorClass = "text-red-500 text-xs mt-1";

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 text-sm">← Geri</button>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Hasta Kaydı</h1>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > s ? '✓' : s}
              </div>
              <span className={`text-xs font-medium ${step >= s ? 'text-blue-700' : 'text-gray-400'}`}>
                {s === 1 ? 'Kişisel Bilgiler' : s === 2 ? 'Tıbbi Geçmiş' : 'Erişim'}
              </span>
              {s < 3 && <span className="text-gray-300 mx-1">›</span>}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Kişisel Bilgiler</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Ad *</label>
                    <input value={form.ad} onChange={e => set('ad', e.target.value)} className={inputClass} placeholder="Ahmet" />
                    {errors.ad && <p className={errorClass}>{errors.ad}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Soyad *</label>
                    <input value={form.soyad} onChange={e => set('soyad', e.target.value)} className={inputClass} placeholder="Yılmaz" />
                    {errors.soyad && <p className={errorClass}>{errors.soyad}</p>}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>TC Kimlik No *</label>
                  <input value={form.tcKimlikNo} onChange={e => set('tcKimlikNo', e.target.value)} maxLength={11} className={inputClass} placeholder="12345678901" />
                  {errors.tcKimlikNo && <p className={errorClass}>{errors.tcKimlikNo}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Doğum Tarihi * (GG.AA.YYYY)</label>
                    <input value={form.dogumTarihi} onChange={e => set('dogumTarihi', e.target.value)} className={inputClass} placeholder="15.03.1955" />
                    {yas > 0 && <p className="text-xs text-green-600 mt-1">{yas} yaşında</p>}
                    {errors.dogumTarihi && <p className={errorClass}>{errors.dogumTarihi}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Telefon *</label>
                    <input value={form.telefon} onChange={e => set('telefon', e.target.value)} className={inputClass} placeholder="0532 123 45 67" />
                    {errors.telefon && <p className={errorClass}>{errors.telefon}</p>}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Adres</label>
                  <textarea value={form.adres} onChange={e => set('adres', e.target.value)} rows={2} className={inputClass} placeholder="Mahalle, Sokak, Şehir" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Acil İletişim Kişisi</label>
                    <input value={form.acilKisi} onChange={e => set('acilKisi', e.target.value)} className={inputClass} placeholder="Fatma Yılmaz" />
                  </div>
                  <div>
                    <label className={labelClass}>Acil Telefon</label>
                    <input value={form.acilTelefon} onChange={e => set('acilTelefon', e.target.value)} className={inputClass} placeholder="0533 987 65 43" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Boy (cm)</label>
                    <input type="number" value={form.boy} onChange={e => set('boy', e.target.value)} className={inputClass} placeholder="175" min="100" max="250" />
                  </div>
                  <div>
                    <label className={labelClass}>Kilo (kg)</label>
                    <input type="number" value={form.kilo} onChange={e => set('kilo', e.target.value)} className={inputClass} placeholder="80" min="30" max="300" />
                  </div>
                  <div>
                    <label className={labelClass}>VKİ (BMI)</label>
                    <div className={`${inputClass} bg-gray-50 flex items-center font-semibold ${bmi > 0 ? (bmi < 18.5 ? 'text-blue-600' : bmi < 25 ? 'text-green-600' : bmi < 30 ? 'text-yellow-600' : 'text-red-600') : 'text-gray-400'}`}>
                      {bmi > 0 ? bmi.toFixed(1) : '—'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Medical History */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Tıbbi Geçmiş</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Diyabet Tipi</label>
                    <select value={form.diyabetTipi} onChange={e => set('diyabetTipi', e.target.value)} className={inputClass}>
                      <option>Tip 1</option>
                      <option>Tip 2</option>
                      <option>LADA</option>
                      <option>MODY</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Diyabet Başlangıç Yılı</label>
                    <input type="number" value={form.diyabetBaslangicYili} onChange={e => set('diyabetBaslangicYili', e.target.value)} className={inputClass} min="1950" max={new Date().getFullYear()} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Kullanılan İlaçlar</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {ILAC_OPTIONS.map(ilac => (
                      <label key={ilac} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg">
                        <input
                          type="checkbox"
                          checked={form.ilaclar.includes(ilac)}
                          onChange={() => toggleArray('ilaclar', ilac)}
                          className="rounded"
                        />
                        <span>{ilac}</span>
                      </label>
                    ))}
                  </div>
                  <input
                    value={form.ilacSerbest}
                    onChange={e => set('ilacSerbest', e.target.value)}
                    placeholder="Diğer ilaçlar (serbest metin)..."
                    className={`${inputClass} mt-2`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Komorbidite</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {KOMORBIDITE_OPTIONS.map(k => (
                      <label key={k} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg">
                        <input
                          type="checkbox"
                          checked={form.komorbidite.includes(k)}
                          onChange={() => toggleArray('komorbidite', k)}
                          className="rounded"
                        />
                        <span>{k}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer p-3 border-2 border-gray-100 rounded-xl hover:border-gray-300">
                    <input type="checkbox" checked={form.sigara} onChange={e => set('sigara', e.target.checked)} className="rounded" />
                    <span className="font-medium">Sigara Kullanımı</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer p-3 border-2 border-gray-100 rounded-xl hover:border-gray-300">
                    <input type="checkbox" checked={form.alkol} onChange={e => set('alkol', e.target.checked)} className="rounded" />
                    <span className="font-medium">Alkol Kullanımı</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer p-3 border-2 border-gray-100 rounded-xl hover:border-gray-300">
                    <input type="checkbox" checked={form.amputasyonHikayesi} onChange={e => set('amputasyonHikayesi', e.target.checked)} className="rounded" />
                    <span className="font-medium">Önceki Amputasyon Hikayesi</span>
                  </label>
                  {form.amputasyonHikayesi && (
                    <input
                      value={form.amputasyonSeviye}
                      onChange={e => set('amputasyonSeviye', e.target.value)}
                      placeholder="Amputasyon seviyesi (örn: 2. parmak sağ)"
                      className={`${inputClass} mt-2`}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Access PIN */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Hasta Erişim PIN'i</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                  <p className="font-semibold mb-1">📌 Hasta Portal Erişimi</p>
                  <p>Bu PIN, hastanın kendi portal girişi için kullanılacaktır. Hastaya güvenli şekilde iletiniz.</p>
                </div>
                <div>
                  <label className={labelClass}>PIN Kodu (4-6 rakam) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.pin}
                    onChange={e => set('pin', e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    className={`${inputClass} text-center text-2xl tracking-widest font-mono`}
                    placeholder="_ _ _ _"
                  />
                  {errors.pin && <p className={errorClass}>{errors.pin}</p>}
                </div>
                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-gray-700 mb-2">Kayıt Özeti</p>
                  <div className="grid grid-cols-2 gap-2 text-gray-600">
                    <span>Ad Soyad:</span><span className="font-medium">{form.ad} {form.soyad}</span>
                    <span>Doğum:</span><span className="font-medium">{form.dogumTarihi} ({yas} yaş)</span>
                    <span>Diyabet:</span><span className="font-medium">{form.diyabetTipi}</span>
                    <span>BMI:</span><span className="font-medium">{bmi > 0 ? bmi.toFixed(1) : '—'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
              {step > 1 ? (
                <button type="button" onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 border-2 border-gray-300 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  ← Geri
                </button>
              ) : (
                <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 border-2 border-gray-300 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  İptal
                </button>
              )}
              {step < 3 ? (
                <button type="button" onClick={handleNext} className="px-6 py-2.5 bg-blue-700 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors">
                  Devam →
                </button>
              ) : (
                <button type="submit" className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white hover:opacity-90 transition-opacity" style={{ background: '#0d9488' }}>
                  ✓ Hastayı Kaydet
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
