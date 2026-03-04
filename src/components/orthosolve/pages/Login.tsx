// OrthoSolve - Login Page with role selection
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { patientStorage } from '../storage';
import OrthoSolveLogo from '../components/OrthoSolveLogo';

type LoginMode = 'select' | 'doctor' | 'patient';

export default function Login() {
  const [mode, setMode] = useState<LoginMode>('select');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [error, setError] = useState('');
  const { loginDoctor, loginPatient } = useAuth();
  const navigate = useNavigate();
  const patients = patientStorage.getAll();

  const handleDoctorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginDoctor(password)) {
      navigate('/doktor/dashboard');
    } else {
      setError('Hatalı şifre. Lütfen tekrar deneyin.');
    }
  };

  const handlePatientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPatient(pin)) {
      navigate('/hasta/panel');
    } else {
      setError('Hatalı PIN kodu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #1a3c6e 0%, #0d9488 100%)' }}>
      {/* Header */}
      <div className="flex flex-col items-center pt-10 pb-6 px-4">
        <OrthoSolveLogo width={300} />
        <p className="text-teal-200 text-sm mt-3 font-medium">Diabetik Ayak Takip Sistemi</p>
        <p className="text-teal-100 text-sm mt-1">Op. Dr. Taner Aksu | Prof. Dr. M. Gökhan Bilgili</p>
      </div>

      {/* Login Card */}
      <div className="flex-1 flex items-start justify-center px-4 pb-8">
        <div className="w-full max-w-sm">

          {/* Role Selection */}
          {mode === 'select' && (
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-center text-xl font-bold text-gray-800 mb-6">Giriş Yapın</h2>
              <div className="space-y-4">
                <button
                  onClick={() => setMode('doctor')}
                  className="w-full flex items-center gap-4 p-5 border-2 border-blue-100 rounded-2xl hover:border-blue-600 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-3xl group-hover:bg-blue-200 transition-colors">🩺</div>
                  <div className="text-left">
                    <div className="font-bold text-gray-800 text-lg">Doktor / Yönetici</div>
                    <div className="text-gray-500 text-sm">Tüm hasta kayıtlarına erişin</div>
                  </div>
                  <span className="ml-auto text-gray-400 text-xl">›</span>
                </button>
                <button
                  onClick={() => setMode('patient')}
                  className="w-full flex items-center gap-4 p-5 border-2 border-teal-100 rounded-2xl hover:border-teal-600 hover:bg-teal-50 transition-all group"
                >
                  <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center text-3xl group-hover:bg-teal-200 transition-colors">👤</div>
                  <div className="text-left">
                    <div className="font-bold text-gray-800 text-lg">Hasta</div>
                    <div className="text-gray-500 text-sm">Kişisel sağlık takibiniz</div>
                  </div>
                  <span className="ml-auto text-gray-400 text-xl">›</span>
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-6">Verileriniz güvenle saklanır</p>
            </div>
          )}

          {/* Doctor Login */}
          {mode === 'doctor' && (
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <button onClick={() => { setMode('select'); setError(''); }} className="flex items-center gap-1 text-blue-600 text-sm mb-6 hover:underline">
                ← Geri
              </button>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🩺</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Doktor Girişi</h2>
                  <p className="text-sm text-gray-500">Klinik yönetim paneli</p>
                </div>
              </div>
              <form onSubmit={handleDoctorLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Şifre</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Şifrenizi girin"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-1">Demo: doktor123</p>
                </div>
                {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
                <button
                  type="submit"
                  className="w-full py-4 bg-blue-700 text-white font-bold rounded-xl text-lg hover:bg-blue-800 transition-colors"
                  style={{ minHeight: '52px' }}
                >
                  Giriş Yap
                </button>
              </form>
            </div>
          )}

          {/* Patient Login */}
          {mode === 'patient' && (
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <button onClick={() => { setMode('select'); setError(''); }} className="flex items-center gap-1 text-teal-600 text-sm mb-6 hover:underline">
                ← Geri
              </button>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">👤</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Hasta Girişi</h2>
                  <p className="text-sm text-gray-500">PIN kodunuzla giriş yapın</p>
                </div>
              </div>
              <form onSubmit={handlePatientLogin} className="space-y-4">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">PIN Kodunuz</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="4 haneli PIN"
                    maxLength={6}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-2xl text-center tracking-widest font-mono focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-1 text-center">Demo: 1234, 2345 veya 3456</p>
                </div>
                {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
                <button
                  type="submit"
                  className="w-full py-4 text-white font-bold rounded-xl text-lg transition-colors"
                  style={{ minHeight: '56px', background: '#0d9488' }}
                >
                  Giriş Yap
                </button>
              </form>
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 font-semibold mb-1">Demo hastalar:</p>
                {patients.map(p => (
                  <p key={p.id} className="text-xs text-gray-500">{p.ad} {p.soyad} — PIN: {p.pin}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
