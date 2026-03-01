// OrthoSolve - localStorage Data Persistence Layer
import type {
  Patient, BloodGlucose, WoundRecord, Procedure, Appointment,
  WagnerScore, PEDISScore, UTScore, SINBADScore, ABIScore, VASScore, NeuropathyScore, Alert
} from './types';

// Storage keys
const KEYS = {
  PATIENTS: 'orthosolve_patients',
  GLUCOSE: 'orthosolve_glucose',
  WOUNDS: 'orthosolve_wounds',
  PROCEDURES: 'orthosolve_procedures',
  APPOINTMENTS: 'orthosolve_appointments',
  WAGNER: 'orthosolve_wagner',
  PEDIS: 'orthosolve_pedis',
  UT: 'orthosolve_ut',
  SINBAD: 'orthosolve_sinbad',
  ABI: 'orthosolve_abi',
  VAS: 'orthosolve_vas',
  NEUROPATHY: 'orthosolve_neuropathy',
  ALERTS: 'orthosolve_alerts',
  INITIALIZED: 'orthosolve_initialized',
};

// ===== Generic Helpers =====
function getAll<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveAll<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ===== PATIENT STORAGE =====
export const patientStorage = {
  getAll: (): Patient[] => getAll<Patient>(KEYS.PATIENTS),
  getById: (id: string): Patient | undefined => getAll<Patient>(KEYS.PATIENTS).find(p => p.id === id),
  save: (patient: Patient): void => {
    const patients = getAll<Patient>(KEYS.PATIENTS);
    const idx = patients.findIndex(p => p.id === patient.id);
    if (idx >= 0) patients[idx] = patient;
    else patients.push(patient);
    saveAll(KEYS.PATIENTS, patients);
  },
  delete: (id: string): void => {
    saveAll(KEYS.PATIENTS, getAll<Patient>(KEYS.PATIENTS).filter(p => p.id !== id));
  },
  authenticate: (pin: string): Patient | undefined =>
    getAll<Patient>(KEYS.PATIENTS).find(p => p.pin === pin && p.aktif),
};

// ===== BLOOD GLUCOSE STORAGE =====
export const glucoseStorage = {
  getAll: (): BloodGlucose[] => getAll<BloodGlucose>(KEYS.GLUCOSE),
  getByPatient: (hastaId: string): BloodGlucose[] =>
    getAll<BloodGlucose>(KEYS.GLUCOSE).filter(g => g.hastaId === hastaId)
      .sort((a, b) => b.tarih.localeCompare(a.tarih)),
  save: (record: Omit<BloodGlucose, 'id'> & { id?: string }): BloodGlucose => {
    const items = getAll<BloodGlucose>(KEYS.GLUCOSE);
    const item = { ...record, id: record.id || generateId() } as BloodGlucose;
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);
    saveAll(KEYS.GLUCOSE, items);
    return item;
  },
  delete: (id: string): void => {
    saveAll(KEYS.GLUCOSE, getAll<BloodGlucose>(KEYS.GLUCOSE).filter(g => g.id !== id));
  },
};

// ===== WOUND STORAGE =====
export const woundStorage = {
  getAll: (): WoundRecord[] => getAll<WoundRecord>(KEYS.WOUNDS),
  getByPatient: (hastaId: string): WoundRecord[] =>
    getAll<WoundRecord>(KEYS.WOUNDS).filter(w => w.hastaId === hastaId)
      .sort((a, b) => b.tarih.localeCompare(a.tarih)),
  save: (record: Omit<WoundRecord, 'id'> & { id?: string }): WoundRecord => {
    const items = getAll<WoundRecord>(KEYS.WOUNDS);
    const item = { ...record, id: record.id || generateId() } as WoundRecord;
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);
    saveAll(KEYS.WOUNDS, items);
    return item;
  },
  delete: (id: string): void => {
    saveAll(KEYS.WOUNDS, getAll<WoundRecord>(KEYS.WOUNDS).filter(w => w.id !== id));
  },
};

// ===== PROCEDURE STORAGE =====
export const procedureStorage = {
  getByPatient: (hastaId: string): Procedure[] =>
    getAll<Procedure>(KEYS.PROCEDURES).filter(p => p.hastaId === hastaId)
      .sort((a, b) => b.tarih.localeCompare(a.tarih)),
  save: (record: Omit<Procedure, 'id'> & { id?: string }): Procedure => {
    const items = getAll<Procedure>(KEYS.PROCEDURES);
    const item = { ...record, id: record.id || generateId() } as Procedure;
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);
    saveAll(KEYS.PROCEDURES, items);
    return item;
  },
  delete: (id: string): void => {
    saveAll(KEYS.PROCEDURES, getAll<Procedure>(KEYS.PROCEDURES).filter(p => p.id !== id));
  },
};

// ===== APPOINTMENT STORAGE =====
export const appointmentStorage = {
  getAll: (): Appointment[] => getAll<Appointment>(KEYS.APPOINTMENTS),
  getByPatient: (hastaId: string): Appointment[] =>
    getAll<Appointment>(KEYS.APPOINTMENTS).filter(a => a.hastaId === hastaId),
  save: (record: Omit<Appointment, 'id'> & { id?: string }): Appointment => {
    const items = getAll<Appointment>(KEYS.APPOINTMENTS);
    const item = { ...record, id: record.id || generateId() } as Appointment;
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);
    saveAll(KEYS.APPOINTMENTS, items);
    return item;
  },
  updateStatus: (id: string, durum: Appointment['durum']): void => {
    const items = getAll<Appointment>(KEYS.APPOINTMENTS);
    const idx = items.findIndex(i => i.id === id);
    if (idx >= 0) { items[idx].durum = durum; saveAll(KEYS.APPOINTMENTS, items); }
  },
};

// ===== WAGNER STORAGE =====
export const wagnerStorage = {
  getByPatient: (hastaId: string): WagnerScore[] =>
    getAll<WagnerScore>(KEYS.WAGNER).filter(s => s.hastaId === hastaId)
      .sort((a, b) => b.tarih.localeCompare(a.tarih)),
  save: (record: Omit<WagnerScore, 'id'>): WagnerScore => {
    const items = getAll<WagnerScore>(KEYS.WAGNER);
    const item = { ...record, id: generateId() } as WagnerScore;
    items.push(item);
    saveAll(KEYS.WAGNER, items);
    return item;
  },
};

// ===== PEDIS STORAGE =====
export const pedisStorage = {
  getByPatient: (hastaId: string): PEDISScore[] =>
    getAll<PEDISScore>(KEYS.PEDIS).filter(s => s.hastaId === hastaId)
      .sort((a, b) => b.tarih.localeCompare(a.tarih)),
  save: (record: Omit<PEDISScore, 'id'>): PEDISScore => {
    const items = getAll<PEDISScore>(KEYS.PEDIS);
    const item = { ...record, id: generateId() } as PEDISScore;
    items.push(item);
    saveAll(KEYS.PEDIS, items);
    return item;
  },
};

// ===== UT STORAGE =====
export const utStorage = {
  getByPatient: (hastaId: string): UTScore[] =>
    getAll<UTScore>(KEYS.UT).filter(s => s.hastaId === hastaId)
      .sort((a, b) => b.tarih.localeCompare(a.tarih)),
  save: (record: Omit<UTScore, 'id'>): UTScore => {
    const items = getAll<UTScore>(KEYS.UT);
    const item = { ...record, id: generateId() } as UTScore;
    items.push(item);
    saveAll(KEYS.UT, items);
    return item;
  },
};

// ===== SINBAD STORAGE =====
export const sinbadStorage = {
  getByPatient: (hastaId: string): SINBADScore[] =>
    getAll<SINBADScore>(KEYS.SINBAD).filter(s => s.hastaId === hastaId)
      .sort((a, b) => b.tarih.localeCompare(a.tarih)),
  save: (record: Omit<SINBADScore, 'id'>): SINBADScore => {
    const items = getAll<SINBADScore>(KEYS.SINBAD);
    const item = { ...record, id: generateId() } as SINBADScore;
    items.push(item);
    saveAll(KEYS.SINBAD, items);
    return item;
  },
};

// ===== ABI STORAGE =====
export const abiStorage = {
  getByPatient: (hastaId: string): ABIScore[] =>
    getAll<ABIScore>(KEYS.ABI).filter(s => s.hastaId === hastaId)
      .sort((a, b) => b.tarih.localeCompare(a.tarih)),
  save: (record: Omit<ABIScore, 'id'>): ABIScore => {
    const items = getAll<ABIScore>(KEYS.ABI);
    const item = { ...record, id: generateId() } as ABIScore;
    items.push(item);
    saveAll(KEYS.ABI, items);
    return item;
  },
};

// ===== VAS STORAGE =====
export const vasStorage = {
  getByPatient: (hastaId: string): VASScore[] =>
    getAll<VASScore>(KEYS.VAS).filter(s => s.hastaId === hastaId)
      .sort((a, b) => b.tarih.localeCompare(a.tarih)),
  save: (record: Omit<VASScore, 'id'>): VASScore => {
    const items = getAll<VASScore>(KEYS.VAS);
    const item = { ...record, id: generateId() } as VASScore;
    items.push(item);
    saveAll(KEYS.VAS, items);
    return item;
  },
};

// ===== NEUROPATHY STORAGE =====
export const neuropathyStorage = {
  getByPatient: (hastaId: string): NeuropathyScore[] =>
    getAll<NeuropathyScore>(KEYS.NEUROPATHY).filter(s => s.hastaId === hastaId)
      .sort((a, b) => b.tarih.localeCompare(a.tarih)),
  save: (record: Omit<NeuropathyScore, 'id'>): NeuropathyScore => {
    const items = getAll<NeuropathyScore>(KEYS.NEUROPATHY);
    const item = { ...record, id: generateId() } as NeuropathyScore;
    items.push(item);
    saveAll(KEYS.NEUROPATHY, items);
    return item;
  },
};

// ===== ALERT STORAGE =====
export const alertStorage = {
  getAll: (): Alert[] => getAll<Alert>(KEYS.ALERTS),
  getUnread: (): Alert[] => getAll<Alert>(KEYS.ALERTS).filter(a => !a.okundu),
  markRead: (id: string): void => {
    const items = getAll<Alert>(KEYS.ALERTS);
    const idx = items.findIndex(i => i.id === id);
    if (idx >= 0) { items[idx].okundu = true; saveAll(KEYS.ALERTS, items); }
  },
  markAllRead: (): void => {
    const items = getAll<Alert>(KEYS.ALERTS).map(a => ({ ...a, okundu: true }));
    saveAll(KEYS.ALERTS, items);
  },
  add: (alert: Omit<Alert, 'id'>): Alert => {
    const items = getAll<Alert>(KEYS.ALERTS);
    const item = { ...alert, id: generateId() } as Alert;
    items.unshift(item);
    saveAll(KEYS.ALERTS, items.slice(0, 100)); // Keep last 100 alerts
    return item;
  },
};

// ===== ALERT GENERATION =====
// Checks all patients and generates relevant alerts
export function generateAlerts(): void {
  const patients = patientStorage.getAll();
  const existingAlerts = alertStorage.getAll();

  patients.forEach(patient => {
    // Check HbA1c > 8
    const glucoseRecords = glucoseStorage.getByPatient(patient.id);
    const latestHba1c = glucoseRecords.find(g => g.hba1c !== undefined);
    if (latestHba1c?.hba1c && latestHba1c.hba1c > 8) {
      const key = `hba1c_${patient.id}`;
      const exists = existingAlerts.some(a => a.hastaId === patient.id && a.tip === 'hba1c' && !a.okundu);
      if (!exists) {
        alertStorage.add({
          hastaId: patient.id,
          hastaAdi: `${patient.ad} ${patient.soyad}`,
          tip: 'hba1c',
          mesaj: `${patient.ad} ${patient.soyad}: HbA1c ${latestHba1c.hba1c}% — Glisemik kontrol kötüleşiyor`,
          seviye: 'warning',
          tarih: new Date().toISOString(),
          okundu: false,
        });
      }
    }

    // Check last glucose entry > 14 days ago
    if (glucoseRecords.length > 0) {
      const lastEntry = new Date(glucoseRecords[0].tarih);
      const daysDiff = (Date.now() - lastEntry.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 14) {
        const exists = existingAlerts.some(a => a.hastaId === patient.id && a.tip === 'glucose' && !a.okundu);
        if (!exists) {
          alertStorage.add({
            hastaId: patient.id,
            hastaAdi: `${patient.ad} ${patient.soyad}`,
            tip: 'glucose',
            mesaj: `${patient.ad} ${patient.soyad}: 14 gündür kan şekeri girilmemiş`,
            seviye: 'warning',
            tarih: new Date().toISOString(),
            okundu: false,
          });
        }
      }
    }

    // Check ABI < 0.5
    const abiRecords = abiStorage.getByPatient(patient.id);
    if (abiRecords.length > 0) {
      const latest = abiRecords[0];
      if (latest.sagABI < 0.5 || latest.solABI < 0.5) {
        const exists = existingAlerts.some(a => a.hastaId === patient.id && a.tip === 'abi' && !a.okundu);
        if (!exists) {
          alertStorage.add({
            hastaId: patient.id,
            hastaAdi: `${patient.ad} ${patient.soyad}`,
            tip: 'abi',
            mesaj: `${patient.ad} ${patient.soyad}: ABI <0.5 — Acil vasküler değerlendirme gerekli!`,
            seviye: 'critical',
            tarih: new Date().toISOString(),
            okundu: false,
          });
        }
      }
    }

    // Check Wagner grade increase
    const wagnerRecords = wagnerStorage.getByPatient(patient.id);
    if (wagnerRecords.length >= 2) {
      const [latest, prev] = wagnerRecords;
      if (latest.grade > prev.grade) {
        const exists = existingAlerts.some(a => a.hastaId === patient.id && a.tip === 'wagner' && !a.okundu);
        if (!exists) {
          alertStorage.add({
            hastaId: patient.id,
            hastaAdi: `${patient.ad} ${patient.soyad}`,
            tip: 'wagner',
            mesaj: `${patient.ad} ${patient.soyad}: Wagner Grade ${prev.grade}'den ${latest.grade}'ye yükseldi!`,
            seviye: 'critical',
            tarih: new Date().toISOString(),
            okundu: false,
          });
        }
      }
    }
  });
}

// ===== SEED DATA =====
export function initializeStorage(): void {
  if (localStorage.getItem(KEYS.INITIALIZED)) return;

  // Demo patients
  const patients: Patient[] = [
    {
      id: 'p1',
      ad: 'Ahmet',
      soyad: 'Yılmaz',
      tcKimlikNo: '12345678901',
      dogumTarihi: '15.03.1955',
      yas: 69,
      telefon: '0532 111 22 33',
      adres: 'Kadıköy Mahallesi, Bağdat Cad. No:45/3, Kadıköy/İstanbul',
      acilKisi: 'Fatma Yılmaz',
      acilTelefon: '0533 444 55 66',
      boy: 175,
      kilo: 88,
      bmi: 28.7,
      diyabetTipi: 'Tip 2',
      diyabetBaslangicYili: 2008,
      ilaclar: ['Metformin 1000mg', 'Lantus İnsülin', 'Lisinopril'],
      komorbidite: ['HT', 'Nöropati'],
      sigara: false,
      alkol: false,
      amputasyonHikayesi: false,
      amputasyonSeviye: '',
      pin: '1234',
      aktif: true,
      kayitTarihi: '2024-01-10',
    },
    {
      id: 'p2',
      ad: 'Ayşe',
      soyad: 'Kaya',
      tcKimlikNo: '98765432109',
      dogumTarihi: '22.07.1960',
      yas: 63,
      telefon: '0535 222 33 44',
      adres: 'Çankaya Mah., Atatürk Bulvarı No:12/8, Çankaya/Ankara',
      acilKisi: 'Mehmet Kaya',
      acilTelefon: '0536 777 88 99',
      boy: 162,
      kilo: 74,
      bmi: 28.2,
      diyabetTipi: 'Tip 2',
      diyabetBaslangicYili: 2015,
      ilaclar: ['Metformin 500mg', 'Jardiance', 'Atorvastatin'],
      komorbidite: ['HT', 'Böbrek Yetmezliği', 'Retinopati'],
      sigara: false,
      alkol: false,
      amputasyonHikayesi: false,
      amputasyonSeviye: '',
      pin: '2345',
      aktif: true,
      kayitTarihi: '2024-02-05',
    },
    {
      id: 'p3',
      ad: 'Mustafa',
      soyad: 'Demir',
      tcKimlikNo: '55544433322',
      dogumTarihi: '08.11.1948',
      yas: 75,
      telefon: '0537 333 44 55',
      adres: 'Konak Mah., İzmir Cad. No:78, Konak/İzmir',
      acilKisi: 'Zeynep Demir',
      acilTelefon: '0538 999 11 22',
      boy: 170,
      kilo: 79,
      bmi: 27.3,
      diyabetTipi: 'Tip 1',
      diyabetBaslangicYili: 1985,
      ilaclar: ['NovoRapid', 'Tresiba', 'Aspirin'],
      komorbidite: ['Nöropati', 'PAH', 'KAH'],
      sigara: true,
      alkol: false,
      amputasyonHikayesi: true,
      amputasyonSeviye: '2. parmak (sağ)',
      pin: '3456',
      aktif: true,
      kayitTarihi: '2023-11-20',
    },
  ];
  saveAll(KEYS.PATIENTS, patients);

  // Demo blood glucose data
  const today = new Date();
  const glucoseData: BloodGlucose[] = [];
  ['p1', 'p2', 'p3'].forEach(pid => {
    for (let i = 30; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      glucoseData.push({
        id: generateId(),
        hastaId: pid,
        tarih: d.toISOString(),
        aclik: 100 + Math.floor(Math.random() * 120),
        tokluk: 140 + Math.floor(Math.random() * 150),
        yatmadan: 110 + Math.floor(Math.random() * 90),
        girenKisi: 'hasta',
      });
    }
  });
  // Add HbA1c records
  glucoseData.push(
    { id: generateId(), hastaId: 'p1', tarih: new Date(today.getTime() - 45 * 86400000).toISOString(), hba1c: 8.2, hedefHba1c: 7.0, girenKisi: 'doktor' },
    { id: generateId(), hastaId: 'p2', tarih: new Date(today.getTime() - 30 * 86400000).toISOString(), hba1c: 7.4, hedefHba1c: 7.0, girenKisi: 'doktor' },
    { id: generateId(), hastaId: 'p3', tarih: new Date(today.getTime() - 20 * 86400000).toISOString(), hba1c: 9.1, hedefHba1c: 7.5, girenKisi: 'doktor' },
  );
  saveAll(KEYS.GLUCOSE, glucoseData);

  // Demo wounds
  const wounds: WoundRecord[] = [
    {
      id: generateId(),
      hastaId: 'p1',
      tarih: new Date(today.getTime() - 15 * 86400000).toISOString(),
      lokalizasyon: [{ side: 'plantar', zone: 'metatarsal1', label: '1. Metatarsal Başı (Plantar)' }],
      uzunluk: 2.5, genislik: 1.8, derinlik: 0.3,
      granulasyon: 40, fibrin: 45, nekroz: 15,
      yaraKenari: 'kallus',
      kizariklik: true, isiArtisi: false, odem: true,
      sekresyonTipi: 'seröz',
      koku: 'yok',
      pansumanTipi: 'Hidrojel + steril gaz',
      tedaviPlani: 'Günlük pansuman, debridman planlandı',
      wagnerGrade: 1,
    },
    {
      id: generateId(),
      hastaId: 'p3',
      tarih: new Date(today.getTime() - 7 * 86400000).toISOString(),
      lokalizasyon: [{ side: 'plantar', zone: 'toe5', label: '5. Parmak (Plantar)' }],
      uzunluk: 3.0, genislik: 2.5, derinlik: 1.2,
      granulasyon: 20, fibrin: 30, nekroz: 50,
      yaraKenari: 'undermined',
      kizariklik: true, isiArtisi: true, odem: true,
      sekresyonTipi: 'purülan',
      koku: 'var',
      pansumanTipi: 'Gümüş içerikli pansuman',
      tedaviPlani: 'Cerrahi debridman, IV antibiyotik başlandı',
      wagnerGrade: 3,
    },
  ];
  saveAll(KEYS.WOUNDS, wounds);

  // Demo procedures
  const procedures: Procedure[] = [
    {
      id: generateId(),
      hastaId: 'p3',
      tarih: new Date(today.getTime() - 90 * 86400000).toISOString(),
      tip: 'Minor Amputasyon',
      detay: '2. parmak ray amputasyonu (sağ ayak)',
      cerrah: 'Op. Dr. Taner Aksu',
      notlar: 'Operasyon komplikasyonsuz tamamlandı',
      komplikasyonlar: 'Yok',
    },
    {
      id: generateId(),
      hastaId: 'p1',
      tarih: new Date(today.getTime() - 10 * 86400000).toISOString(),
      tip: 'Debridman',
      detay: 'Cerrahi debridman - nekrotik doku temizlendi',
      cerrah: 'Op. Dr. Taner Aksu',
      notlar: 'Yara tabanı granülasyon dokusu elde edildi',
      komplikasyonlar: 'Yok',
    },
  ];
  saveAll(KEYS.PROCEDURES, procedures);

  // Demo Wagner scores
  const wagnerScores: WagnerScore[] = [
    { id: generateId(), hastaId: 'p1', tarih: new Date(today.getTime() - 30 * 86400000).toISOString(), grade: 0, notlar: 'Risk faktörleri mevcut' },
    { id: generateId(), hastaId: 'p1', tarih: new Date(today.getTime() - 15 * 86400000).toISOString(), grade: 1, notlar: 'Yüzeyel ülser gelişti' },
    { id: generateId(), hastaId: 'p3', tarih: new Date(today.getTime() - 14 * 86400000).toISOString(), grade: 2, notlar: 'Derin ülser' },
    { id: generateId(), hastaId: 'p3', tarih: new Date(today.getTime() - 7 * 86400000).toISOString(), grade: 3, notlar: 'İnfeksiyon eklendi' },
    { id: generateId(), hastaId: 'p2', tarih: new Date(today.getTime() - 20 * 86400000).toISOString(), grade: 0, notlar: 'Yara yok, kontrol' },
  ];
  saveAll(KEYS.WAGNER, wagnerScores);

  // Demo ABI
  const abiScores: ABIScore[] = [
    { id: generateId(), hastaId: 'p1', tarih: new Date(today.getTime() - 20 * 86400000).toISOString(), sagAyakSistolik: 120, solAyakSistolik: 118, sagKolSistolik: 130, solKolSistolik: 128, sagABI: 0.92, solABI: 0.92 },
    { id: generateId(), hastaId: 'p3', tarih: new Date(today.getTime() - 10 * 86400000).toISOString(), sagAyakSistolik: 60, solAyakSistolik: 62, sagKolSistolik: 130, solKolSistolik: 128, sagABI: 0.46, solABI: 0.48 },
    { id: generateId(), hastaId: 'p2', tarih: new Date(today.getTime() - 25 * 86400000).toISOString(), sagAyakSistolik: 100, solAyakSistolik: 102, sagKolSistolik: 126, solKolSistolik: 124, sagABI: 0.79, solABI: 0.82 },
  ];
  saveAll(KEYS.ABI, abiScores);

  // Demo appointments
  const appointments: Appointment[] = [
    { id: generateId(), hastaId: 'p1', tarih: new Date(today.getTime() + 3 * 86400000).toISOString().slice(0, 10), saat: '10:00', sikayet: 'Rutin kontrol', durum: 'onaylandi' },
    { id: generateId(), hastaId: 'p2', tarih: new Date(today.getTime() + 5 * 86400000).toISOString().slice(0, 10), saat: '14:30', sikayet: 'Ayak yarası kontrolü', durum: 'beklemede' },
    { id: generateId(), hastaId: 'p3', tarih: new Date(today.getTime() + 1 * 86400000).toISOString().slice(0, 10), saat: '09:00', sikayet: 'Acil — yara kötüleşmesi', durum: 'onaylandi' },
  ];
  saveAll(KEYS.APPOINTMENTS, appointments);

  // Initial alerts
  alertStorage.add({
    hastaId: 'p1',
    hastaAdi: 'Ahmet Yılmaz',
    tip: 'hba1c',
    mesaj: 'Ahmet Yılmaz: HbA1c 8.2% — Glisemik kontrol kötüleşiyor',
    seviye: 'warning',
    tarih: new Date().toISOString(),
    okundu: false,
  });
  alertStorage.add({
    hastaId: 'p3',
    hastaAdi: 'Mustafa Demir',
    tip: 'abi',
    mesaj: 'Mustafa Demir: ABI 0.46 — Acil vasküler değerlendirme gerekli!',
    seviye: 'critical',
    tarih: new Date().toISOString(),
    okundu: false,
  });
  alertStorage.add({
    hastaId: 'p3',
    hastaAdi: 'Mustafa Demir',
    tip: 'wagner',
    mesaj: 'Mustafa Demir: Wagner Grade 2\'den 3\'e yükseldi!',
    seviye: 'critical',
    tarih: new Date().toISOString(),
    okundu: false,
  });

  localStorage.setItem(KEYS.INITIALIZED, 'true');
}
