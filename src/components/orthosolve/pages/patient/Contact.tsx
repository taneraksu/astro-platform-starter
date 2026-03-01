// OrthoSolve - Patient Contact Page (elderly-friendly, large buttons)
import React, { useState } from 'react';
import PatientNavbar from '../../components/PatientNavbar';
import { appointmentStorage } from '../../storage';
import { useAuth } from '../../auth';

export default function PatientContact() {
  const { user } = useAuth();
  const [showApptForm, setShowApptForm] = useState(false);
  const [apptForm, setApptForm] = useState({ tarih: '', saat: '09:00', sikayet: '' });
  const [apptSent, setApptSent] = useState(false);

  const handleApptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    appointmentStorage.save({
      hastaId: user!.id,
      tarih: apptForm.tarih,
      saat: apptForm.saat,
      sikayet: apptForm.sikayet,
      durum: 'beklemede',
    });
    setApptSent(true);
    setShowApptForm(false);
    setApptForm({ tarih: '', saat: '09:00', sikayet: '' });
    setTimeout(() => setApptSent(false), 4000);
  };

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f8', paddingBottom: '90px' }}>
      <PatientNavbar />
      <main className="max-w-lg mx-auto px-4 pt-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">📞 İletişim</h1>
        <p className="text-gray-500 text-sm mb-6">Kliniğimizle kolayca iletişime geçin</p>

        {apptSent && (
          <div className="bg-green-50 border-2 border-green-400 rounded-3xl p-5 mb-5 text-center">
            <p className="text-2xl font-bold text-green-700">✅ Randevu Talebiniz Alındı!</p>
            <p className="text-green-600 mt-2 text-base">Kliniğimiz en kısa sürede size ulaşacaktır.</p>
          </div>
        )}

        {/* Contact buttons */}
        <div className="space-y-4 mb-6">
          {/* Phone */}
          <a
            href="tel:05321518797"
            className="flex items-center gap-4 p-5 rounded-3xl no-underline transition-all active:scale-95 shadow-sm"
            style={{ background: '#1a3c6e', minHeight: '80px' }}
          >
            <span className="text-4xl">📞</span>
            <div className="flex-1">
              <p className="text-white font-bold text-xl">Kliniği Ara</p>
              <p className="text-blue-200 text-base">0532 151 87 97</p>
            </div>
            <span className="text-white/50 text-2xl">›</span>
          </a>

          {/* Email */}
          <a
            href="mailto:taneraksu@gmail.com"
            className="flex items-center gap-4 p-5 rounded-3xl no-underline transition-all active:scale-95 shadow-sm"
            style={{ background: '#0d9488', minHeight: '80px' }}
          >
            <span className="text-4xl">📧</span>
            <div className="flex-1">
              <p className="text-white font-bold text-xl">E-posta Gönder</p>
              <p className="text-teal-100 text-sm">taneraksu@gmail.com</p>
            </div>
            <span className="text-white/50 text-2xl">›</span>
          </a>

          {/* Appointment */}
          <button
            onClick={() => setShowApptForm(!showApptForm)}
            className="w-full flex items-center gap-4 p-5 rounded-3xl transition-all active:scale-95 shadow-sm text-left"
            style={{ background: '#f59e0b', minHeight: '80px' }}
          >
            <span className="text-4xl">📅</span>
            <div className="flex-1">
              <p className="text-white font-bold text-xl">Randevu Al</p>
              <p className="text-yellow-100 text-sm">Online randevu talebi</p>
            </div>
            <span className="text-white/50 text-2xl">{showApptForm ? '▼' : '›'}</span>
          </button>

          {/* Appointment form */}
          {showApptForm && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-yellow-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Randevu Talebi</h3>
              <form onSubmit={handleApptSubmit} className="space-y-4">
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-2">Tarih</label>
                  <input
                    type="date"
                    value={apptForm.tarih}
                    onChange={e => setApptForm(p => ({ ...p, tarih: e.target.value }))}
                    min={new Date().toISOString().slice(0, 10)}
                    required
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-yellow-500"
                    style={{ minHeight: '52px' }}
                  />
                </div>
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-2">Tercih Edilen Saat</label>
                  <select
                    value={apptForm.saat}
                    onChange={e => setApptForm(p => ({ ...p, saat: e.target.value }))}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:outline-none bg-white"
                    style={{ minHeight: '52px' }}
                  >
                    {['09:00','09:30','10:00','10:30','11:00','11:30','12:00','13:00','13:30','14:00','14:30','15:00','15:30','16:00'].map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-2">Şikayet / Neden</label>
                  <textarea
                    value={apptForm.sikayet}
                    onChange={e => setApptForm(p => ({ ...p, sikayet: e.target.value }))}
                    rows={3}
                    required
                    placeholder="Neden randevu almak istiyorsunuz?"
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShowApptForm(false)}
                    className="py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold text-base"
                    style={{ minHeight: '56px' }}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="py-4 bg-yellow-500 text-white rounded-2xl font-bold text-base hover:bg-yellow-600 transition-colors"
                    style={{ minHeight: '56px' }}
                  >
                    📅 Randevu İste
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* WhatsApp */}
          <a
            href="https://wa.me/905321518797"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 bg-white rounded-3xl no-underline transition-all active:scale-95 shadow-sm border-2 border-green-200"
            style={{ minHeight: '72px' }}
          >
            <span className="text-4xl">💬</span>
            <div className="flex-1">
              <p className="text-gray-800 font-bold text-lg">WhatsApp ile Yaz</p>
              <p className="text-gray-400 text-sm">Hızlı mesaj gönder</p>
            </div>
            <span className="text-gray-300 text-2xl">›</span>
          </a>

          {/* Emergency */}
          <a
            href="tel:05321518797"
            className="flex items-center gap-4 p-5 rounded-3xl no-underline transition-all active:scale-95 shadow-md"
            style={{ background: '#dc2626', minHeight: '88px' }}
          >
            <span className="text-5xl">🆘</span>
            <div className="flex-1">
              <p className="text-white font-bold text-2xl">ACİL</p>
              <p className="text-red-100 text-base">Hemen ara: 0532 151 87 97</p>
            </div>
          </a>
        </div>

        {/* Doctor info */}
        <div className="bg-white rounded-3xl p-5 shadow-sm mb-5">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Doktorlarımız</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-2xl">
              <span className="text-3xl">🩺</span>
              <div>
                <p className="font-bold text-gray-800">Op. Dr. Taner Aksu</p>
                <p className="text-gray-500 text-sm">Ortopedi ve Travmatoloji Uzmanı</p>
                <p className="text-blue-600 text-sm font-semibold">taneraksu@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-2xl">
              <span className="text-3xl">🩺</span>
              <div>
                <p className="font-bold text-gray-800">Prof. Dr. Mustafa Gökhan Bilgili</p>
                <p className="text-gray-500 text-sm">Ortopedi ve Travmatoloji Profesörü</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clinic hours */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🕐 Çalışma Saatleri</h3>
          <div className="space-y-2 text-base">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Pazartesi - Cuma</span>
              <span className="font-bold text-gray-800">09:00 - 17:00</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Cumartesi</span>
              <span className="font-bold text-gray-800">09:00 - 13:00</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Pazar</span>
              <span className="font-semibold text-red-500">Kapalı</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded-2xl">
            <p className="text-sm font-semibold text-yellow-800">⚠️ Acil durumlar için her zaman 0532 151 87 97 numarasını arayabilirsiniz.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
