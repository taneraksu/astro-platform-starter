// OrthoSolve - Appointment Calendar (Doctor View)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorNavbar from '../../components/DoctorNavbar';
import { appointmentStorage, patientStorage } from '../../storage';
import type { Appointment, Patient } from '../../types';

function formatDateTR(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}

const STATUS_CONFIG = {
  beklemede: { label: 'Beklemede', class: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  onaylandi: { label: 'Onaylandı', class: 'bg-green-100 text-green-800 border-green-300' },
  iptal: { label: 'İptal', class: 'bg-gray-100 text-gray-500 border-gray-300' },
};

const TR_MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const TR_DAYS = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];

export default function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Record<string, Patient>>({});
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState<'all' | 'beklemede' | 'onaylandi' | 'iptal'>('all');

  // Form state
  const [form, setForm] = useState({
    hastaId: '',
    tarih: new Date().toISOString().slice(0, 10),
    saat: '09:00',
    sikayet: '',
    notlar: '',
  });

  useEffect(() => {
    const appts = appointmentStorage.getAll();
    setAppointments(appts.sort((a, b) => a.tarih.localeCompare(b.tarih)));
    const patientList = patientStorage.getAll();
    const patientMap: Record<string, Patient> = {};
    patientList.forEach(p => { patientMap[p.id] = p; });
    setPatients(patientMap);
  }, []);

  const handleStatusChange = (id: string, durum: Appointment['durum']) => {
    appointmentStorage.updateStatus(id, durum);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, durum } : a));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const appt = appointmentStorage.save({
      hastaId: form.hastaId,
      tarih: form.tarih,
      saat: form.saat,
      sikayet: form.sikayet,
      notlar: form.notlar,
      durum: 'onaylandi',
    });
    setAppointments(prev => [...prev, appt].sort((a, b) => a.tarih.localeCompare(b.tarih)));
    setShowForm(false);
    setForm({ hastaId: '', tarih: new Date().toISOString().slice(0, 10), saat: '09:00', sikayet: '', notlar: '' });
  };

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Monday-first
  const daysInMonth = lastDay.getDate();

  const apptsByDate: Record<string, Appointment[]> = {};
  appointments.forEach(a => {
    if (!apptsByDate[a.tarih]) apptsByDate[a.tarih] = [];
    apptsByDate[a.tarih].push(a);
  });

  const calendarCells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const filtered = appointments.filter(a => filter === 'all' ? true : a.durum === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Randevu Takvimi</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-white text-sm font-semibold rounded-xl hover:opacity-90"
            style={{ background: '#0d9488' }}
          >
            ➕ Randevu Ekle
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">Yeni Randevu</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Hasta</label>
                <select value={form.hastaId} onChange={e => setForm(p => ({ ...p, hastaId: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white" required>
                  <option value="">Hasta seçin...</option>
                  {patientStorage.getAll().map(p => <option key={p.id} value={p.id}>{p.ad} {p.soyad}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Tarih</label>
                <input type="date" value={form.tarih} onChange={e => setForm(p => ({ ...p, tarih: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Saat</label>
                <input type="time" value={form.saat} onChange={e => setForm(p => ({ ...p, saat: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Şikayet / Neden</label>
                <input value={form.sikayet} onChange={e => setForm(p => ({ ...p, sikayet: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="Rutin kontrol, yara bakımı..." required />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Notlar (opsiyonel)</label>
                <input value={form.notlar} onChange={e => setForm(p => ({ ...p, notlar: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="Ek bilgi..." />
              </div>
              <div className="col-span-2 flex gap-3">
                <button type="submit" className="px-5 py-2.5 bg-blue-700 text-white rounded-xl font-semibold text-sm hover:bg-blue-800">Randevu Ekle</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50">İptal</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600">‹</button>
              <span className="font-bold text-gray-800">{TR_MONTHS[month]} {year}</span>
              <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600">›</button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center mb-2">
              {TR_DAYS.map(d => <div key={d} className="text-xs font-semibold text-gray-400 py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {calendarCells.map((day, i) => {
                if (!day) return <div key={i} />;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayAppts = apptsByDate[dateStr] || [];
                const isToday = dateStr === new Date().toISOString().slice(0, 10);
                const isSelected = dateStr === selectedDate;
                const hasPending = dayAppts.some(a => a.durum === 'beklemede');

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDate(dateStr === selectedDate ? '' : dateStr)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer text-sm transition-colors relative ${
                      isSelected ? 'bg-blue-700 text-white'
                      : isToday ? 'bg-blue-50 text-blue-700 font-bold border-2 border-blue-300'
                      : dayAppts.length > 0 ? 'bg-teal-50 hover:bg-teal-100 text-gray-800'
                      : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {day}
                    {dayAppts.length > 0 && (
                      <span className={`text-xs font-bold ${isSelected ? 'text-white/80' : 'text-teal-600'}`}>{dayAppts.length}</span>
                    )}
                    {hasPending && !isSelected && (
                      <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-yellow-500 rounded-full" />
                    )}
                  </div>
                );
              })}
            </div>
            {selectedDate && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-2">{formatDateTR(selectedDate)}</p>
                {(apptsByDate[selectedDate] || []).map(a => (
                  <div key={a.id} className="text-xs mb-2 p-2 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-800">{a.saat} — {patients[a.hastaId]?.ad} {patients[a.hastaId]?.soyad}</div>
                    <div className="text-gray-600">{a.sikayet}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Appointment list */}
          <div className="lg:col-span-2">
            <div className="flex gap-2 mb-4 flex-wrap">
              {(['all', 'beklemede', 'onaylandi', 'iptal'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${filter === f ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                >
                  {f === 'all' ? 'Tümü' : STATUS_CONFIG[f].label}
                  <span className="ml-1 opacity-70">
                    ({f === 'all' ? appointments.length : appointments.filter(a => a.durum === f).length})
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">
                  <p className="text-3xl mb-2">📅</p>
                  <p>Randevu bulunamadı</p>
                </div>
              ) : (
                filtered.map(appt => {
                  const patient = patients[appt.hastaId];
                  const isToday = appt.tarih === new Date().toISOString().slice(0, 10);
                  return (
                    <div key={appt.id} className={`bg-white rounded-2xl p-4 shadow-sm border transition-colors ${isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-100'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">
                              {patient ? `${patient.ad} ${patient.soyad}` : 'Bilinmiyor'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_CONFIG[appt.durum].class}`}>
                              {STATUS_CONFIG[appt.durum].label}
                            </span>
                            {isToday && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Bugün</span>}
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5">
                            📅 {formatDateTR(appt.tarih)} ⏰ {appt.saat}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">{appt.sikayet}</p>
                          {appt.notlar && <p className="text-xs text-gray-400 mt-0.5">{appt.notlar}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {appt.durum === 'beklemede' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(appt.id, 'onaylandi')}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg font-semibold hover:bg-green-700 whitespace-nowrap"
                              >
                                ✓ Onayla
                              </button>
                              <button
                                onClick={() => handleStatusChange(appt.id, 'iptal')}
                                className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg font-semibold hover:bg-red-200 whitespace-nowrap"
                              >
                                ✕ İptal
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => navigate(`/doktor/hasta/${appt.hastaId}`)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-lg font-semibold hover:bg-blue-100 whitespace-nowrap"
                          >
                            Hasta Dosyası
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
