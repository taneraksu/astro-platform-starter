// OrthoSolve Diabetik Ayak Takip Sistemi - TypeScript Type Definitions

export type UserRole = 'doctor' | 'patient';
export type DiyabetTipi = 'Tip 1' | 'Tip 2' | 'LADA' | 'MODY';
export type WagnerGrade = 0 | 1 | 2 | 3 | 4 | 5;
export type AppointmentStatus = 'beklemede' | 'onaylandi' | 'iptal';
export type AlertLevel = 'info' | 'warning' | 'critical';
export type AlertType = 'hba1c' | 'wagner' | 'abi' | 'glucose' | 'randevu' | 'pansuman';

// ===== PATIENT =====
export interface Patient {
  id: string;
  // Personal info
  ad: string;
  soyad: string;
  tcKimlikNo: string;
  dogumTarihi: string; // DD.MM.YYYY format
  yas: number;
  telefon: string;
  adres: string;
  acilKisi: string;
  acilTelefon: string;
  boy: number; // cm
  kilo: number; // kg
  bmi: number; // auto-calculated
  // Medical history
  diyabetTipi: DiyabetTipi;
  diyabetBaslangicYili: number;
  ilaclar: string[];
  komorbidite: string[];
  sigara: boolean;
  alkol: boolean;
  amputasyonHikayesi: boolean;
  amputasyonSeviye: string;
  // Auth
  pin: string;
  aktif: boolean;
  kayitTarihi: string;
}

// ===== BLOOD GLUCOSE =====
export interface BloodGlucose {
  id: string;
  hastaId: string;
  tarih: string; // ISO datetime
  aclik?: number; // mg/dL
  tokluk?: number; // mg/dL
  yatmadan?: number; // mg/dL
  hba1c?: number; // %
  hedefHba1c?: number; // %
  insulinNotu?: string;
  girenKisi: 'hasta' | 'doktor';
}

// ===== WOUND LOCATION =====
export interface WoundLocation {
  side: 'dorsal' | 'plantar';
  zone: string;
  label: string;
}

// ===== WOUND RECORD =====
export interface WoundRecord {
  id: string;
  hastaId: string;
  tarih: string;
  lokalizasyon: WoundLocation[];
  uzunluk: number; // cm
  genislik: number; // cm
  derinlik: number; // cm
  granulasyon: number; // percentage 0-100
  fibrin: number; // percentage 0-100
  nekroz: number; // percentage 0-100
  yaraKenari: 'duzgun' | 'undermined' | 'kallus';
  kizariklik: boolean;
  isiArtisi: boolean;
  odem: boolean;
  sekresyonTipi: 'yok' | 'seröz' | 'purülan' | 'kanlı';
  koku: 'yok' | 'var' | 'şiddetli';
  fotoUrl?: string;
  pansumanTipi: string;
  tedaviPlani: string;
  wagnerGrade?: WagnerGrade;
}

// ===== PROCEDURES =====
export interface Procedure {
  id: string;
  hastaId: string;
  tarih: string;
  tip: string;
  detay: string;
  cerrah: string;
  notlar: string;
  komplikasyonlar: string;
}

// ===== APPOINTMENT =====
export interface Appointment {
  id: string;
  hastaId: string;
  tarih: string;
  saat: string;
  sikayet: string;
  durum: AppointmentStatus;
  notlar?: string;
}

// ===== SCORING: Wagner =====
export interface WagnerScore {
  id: string;
  hastaId: string;
  tarih: string;
  grade: WagnerGrade;
  notlar: string;
}

// ===== SCORING: PEDIS =====
export interface PEDISScore {
  id: string;
  hastaId: string;
  tarih: string;
  perfusion: number; // 1-4
  extent: number; // cm2
  depth: number; // 1-3
  infection: number; // 1-4
  sensation: number; // 1-2
  toplam: number;
}

// ===== SCORING: University of Texas =====
export interface UTScore {
  id: string;
  hastaId: string;
  tarih: string;
  stage: 'A' | 'B' | 'C' | 'D';
  grade: 0 | 1 | 2 | 3;
}

// ===== SCORING: SINBAD =====
export interface SINBADScore {
  id: string;
  hastaId: string;
  tarih: string;
  site: number; // 0-1: forefoot=0, midfoot/hindfoot=1
  ischemia: number; // 0-1
  neuropathy: number; // 0-1
  bacterialInfection: number; // 0-2
  area: number; // 0-1: <1cm2=0, >=1cm2=1
  depth: number; // 0-1: superficial=0, deep=1
  toplam: number; // 0-6
}

// ===== SCORING: ABI =====
export interface ABIScore {
  id: string;
  hastaId: string;
  tarih: string;
  sagAyakSistolik: number;
  solAyakSistolik: number;
  sagKolSistolik: number;
  solKolSistolik: number;
  sagABI: number;
  solABI: number;
}

// ===== SCORING: VAS =====
export interface VASScore {
  id: string;
  hastaId: string;
  tarih: string;
  skor: number; // 0-10
  notlar: string;
}

// ===== SCORING: Neuropathy =====
export interface NeuropathyScore {
  id: string;
  hastaId: string;
  tarih: string;
  nss: number; // Neuropathy Symptom Score 0-9
  nds: number; // Neuropathy Deficit Score 0-10
  monofilament10g: boolean;
  notlar: string;
}

// ===== ALERT =====
export interface Alert {
  id: string;
  hastaId: string;
  hastaAdi?: string;
  tip: AlertType;
  mesaj: string;
  seviye: AlertLevel;
  tarih: string;
  okundu: boolean;
}

// ===== AUTH USER =====
export interface AuthUser {
  id: string;
  role: UserRole;
  ad?: string;
  soyad?: string;
}
