import { getStore } from '@netlify/blobs';

const STORE_NAME = 'diabetic-tracker';

function store() {
    return getStore(STORE_NAME);
}

// ---------- Generic helpers ----------

async function getList<T>(key: string): Promise<T[]> {
    const blob = await store().get(key, { type: 'json' });
    return (blob as T[] | null) ?? [];
}

async function setList<T>(key: string, data: T[]): Promise<void> {
    await store().setJSON(key, data);
}

// ---------- Doctors ----------

export interface Doctor {
    id: string;
    email: string;
    passwordHash: string;
    clinicName: string;
    phone?: string;
    createdAt: string;
}

export async function getDoctors(): Promise<Doctor[]> {
    return getList<Doctor>('doctors');
}

export async function getDoctorById(id: string): Promise<Doctor | null> {
    const docs = await getDoctors();
    return docs.find(d => d.id === id) ?? null;
}

export async function getDoctorByEmail(email: string): Promise<Doctor | null> {
    const docs = await getDoctors();
    return docs.find(d => d.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function saveDoctor(doctor: Doctor): Promise<void> {
    const docs = await getDoctors();
    const idx = docs.findIndex(d => d.id === doctor.id);
    if (idx >= 0) docs[idx] = doctor;
    else docs.push(doctor);
    await setList('doctors', docs);
}

// ---------- Patients ----------

export interface Patient {
    id: string;
    doctorId: string;
    name: string;
    dob?: string;
    phone?: string;
    diagnosisDate?: string;
    accessCode: string;
    notes?: string;
    isActive: boolean;
    createdAt: string;
}

export async function getPatients(): Promise<Patient[]> {
    return getList<Patient>('patients');
}

export async function getPatientsByDoctor(doctorId: string): Promise<Patient[]> {
    const all = await getPatients();
    return all.filter(p => p.doctorId === doctorId);
}

export async function getPatientById(id: string): Promise<Patient | null> {
    const all = await getPatients();
    return all.find(p => p.id === id) ?? null;
}

export async function getPatientByCode(code: string): Promise<Patient | null> {
    const all = await getPatients();
    return all.find(p => p.accessCode === code.toUpperCase()) ?? null;
}

export async function savePatient(patient: Patient): Promise<void> {
    const all = await getPatients();
    const idx = all.findIndex(p => p.id === patient.id);
    if (idx >= 0) all[idx] = patient;
    else all.push(patient);
    await setList('patients', all);
}

// ---------- Glucose Entries ----------

export interface GlucoseEntry {
    id: string;
    patientId: string;
    datetime: string;
    value: number;
    measurementType: 'fasting' | 'postprandial' | 'random';
    insulinUsed: boolean;
    insulinType?: string;
    dose?: number;
    notes?: string;
    createdAt: string;
}

export async function getGlucoseEntries(patientId: string): Promise<GlucoseEntry[]> {
    const all = await getList<GlucoseEntry>(`glucose-${patientId}`);
    return all.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
}

export async function saveGlucoseEntry(entry: GlucoseEntry): Promise<void> {
    const all = await getList<GlucoseEntry>(`glucose-${entry.patientId}`);
    all.push(entry);
    await setList(`glucose-${entry.patientId}`, all);
}

// ---------- Wound Entries ----------

export interface WoundEntry {
    id: string;
    patientId: string;
    datetime: string;
    footSide: 'left' | 'right' | 'both';
    // Lokasyon
    footRegions?: string[];  // Anatomical region IDs (e.g. ['hallux', 'mth1'])
    // Wagner (patient-friendly)
    wagnerGrade: number;
    size: 'small' | 'medium' | 'large';
    // Boyutlar
    dimensions?: {
        length?: number;    // cm
        width?: number;     // cm
        depth?: number;     // cm
    };
    // Yara yatağı
    woundBed?: {
        granulation?: number;       // % 0-100
        slough?: number;            // % 0-100
        necrosis?: number;          // % 0-100
        exudateAmount?: 'none' | 'low' | 'moderate' | 'high';
        exudateType?: string;       // serous/purulent/bloody
    };
    // Klinik sınıflamalar (doktor tarafından doldurulabilir)
    utGrade?: 0 | 1 | 2 | 3;        // University of Texas Grade
    utStage?: 'A' | 'B' | 'C' | 'D'; // University of Texas Stage
    iwgdfInfectionGrade?: 1 | 2 | 3 | 4; // 1=yok 2=hafif 3=orta 4=ağır
    wifiWound?: 0 | 1 | 2 | 3;      // WIfI - Wound component
    wifiIschemia?: 0 | 1 | 2 | 3;   // WIfI - Ischemia component
    wifiFootInfection?: 0 | 1 | 2 | 3; // WIfI - foot Infection component
    // Symptoms
    symptoms: {
        redness?: boolean;
        swelling?: boolean;
        discharge?: boolean;
        odor?: boolean;
    };
    painScore: number;
    canWalk: 'normal' | 'limping' | 'cannot';
    temperature?: number;
    notes?: string;
    createdAt: string;
}

export async function getWoundEntries(patientId: string): Promise<WoundEntry[]> {
    const all = await getList<WoundEntry>(`wounds-${patientId}`);
    return all.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
}

export async function saveWoundEntry(entry: WoundEntry): Promise<void> {
    const all = await getList<WoundEntry>(`wounds-${entry.patientId}`);
    all.push(entry);
    await setList(`wounds-${entry.patientId}`, all);
}

// ---------- Vascular / Doppler Entries ----------

export interface VascularEntry {
    id: string;
    patientId: string;
    doctorId: string;
    date: string;
    // Nabız palpe/Doppler
    dpPulse: 'present' | 'weak' | 'absent';        // Dorsalis pedis
    ptPulse: 'present' | 'weak' | 'absent';        // Posterior tibial
    dopplerWave?: 'triphasic' | 'biphasic' | 'monophasic' | 'absent'; // Dalga karakteri
    // Ölçümler
    abi?: number;           // Ankle-Brachial Index (0.0 – 1.5)
    tbi?: number;           // Toe-Brachial Index (0.0 – 1.0)
    toePressure?: number;   // mmHg
    tcpo2?: number;         // Transcutaneous O2 pressure (mmHg)
    // Sonuç
    padDiagnosis: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical';
    revascularizationRecommended: boolean;
    findings: string;
    notes?: string;
    createdAt: string;
}

export async function getVascularEntries(patientId: string): Promise<VascularEntry[]> {
    const all = await getList<VascularEntry>(`vascular-${patientId}`);
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function saveVascularEntry(entry: VascularEntry): Promise<void> {
    const all = await getList<VascularEntry>(`vascular-${entry.patientId}`);
    all.push(entry);
    await setList(`vascular-${entry.patientId}`, all);
}

// ---------- Osteomyelitis Records ----------

export interface OsteomyelitisEntry {
    id: string;
    patientId: string;
    doctorId: string;
    date: string;
    // Klinik testler
    probeToBone: boolean;                           // Probe-to-bone testi
    probeToBoneResult?: 'negative' | 'positive';
    // Görüntüleme
    xrayResult: 'not_done' | 'normal' | 'suspicious' | 'confirmed';
    mriResult: 'not_done' | 'normal' | 'suspicious' | 'confirmed';
    // Biyopsi
    boneBiopsy: boolean;
    biopsyOrganism?: string;                        // Üreyen mikroorganizma
    // Laboratuvar
    esr?: number;           // ESR mm/saat
    crp?: number;           // CRP mg/L
    wbc?: number;           // WBC x10³/µL
    // Anatomik
    affectedBone: string;   // Etkilenen kemik (ör: "1. metatarsal", "kalkaneus")
    eichenholtzStage?: 'acute' | 'consolidation' | 'reconstruction' | 'na'; // Charcot evresi (gerekirse)
    // Tedavi
    diagnosis: 'ruled_out' | 'suspected' | 'confirmed';
    treatment: 'conservative' | 'antibiotics' | 'surgical' | 'combined';
    antibioticProtocol?: string;
    surgicalPlan?: string;
    notes?: string;
    createdAt: string;
}

export async function getOsteomyelitisEntries(patientId: string): Promise<OsteomyelitisEntry[]> {
    const all = await getList<OsteomyelitisEntry>(`osteo-${patientId}`);
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function saveOsteomyelitisEntry(entry: OsteomyelitisEntry): Promise<void> {
    const all = await getList<OsteomyelitisEntry>(`osteo-${entry.patientId}`);
    all.push(entry);
    await setList(`osteo-${entry.patientId}`, all);
}

// ---------- HBO Sessions ----------

export interface HBOSession {
    id: string;
    patientId: string;
    doctorId: string;
    date: string;
    sessionNumber: number;          // Bu seanın numarası (1'den başlar)
    totalPlannedSessions: number;   // Toplam planlanan seans sayısı
    indication: string;             // Endikasyon
    pressureAta: number;            // Basınç (ATA), genellikle 2.0-2.5
    durationMin: number;            // Süre (dakika), genellikle 60-90
    outcome: 'completed' | 'interrupted' | 'postponed';
    woundResponse?: 'improving' | 'stable' | 'worsening' | 'not_assessed';
    sideEffects?: string;           // Barotravma, kulak ağrısı vb.
    notes?: string;
    createdAt: string;
}

export async function getHBOSessions(patientId: string): Promise<HBOSession[]> {
    const all = await getList<HBOSession>(`hbo-${patientId}`);
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function saveHBOSession(session: HBOSession): Promise<void> {
    const all = await getList<HBOSession>(`hbo-${session.patientId}`);
    all.push(session);
    await setList(`hbo-${session.patientId}`, all);
}

// ---------- Procedures ----------

export interface Procedure {
    id: string;
    patientId: string;
    doctorId: string;
    date: string;
    type: string;
    surgeonName?: string;
    details?: string;
    outcome?: string;
    followupDate?: string;
    createdAt: string;
}

export async function getProcedures(patientId: string): Promise<Procedure[]> {
    const all = await getList<Procedure>(`procedures-${patientId}`);
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function saveProcedure(proc: Procedure): Promise<void> {
    const all = await getList<Procedure>(`procedures-${proc.patientId}`);
    all.push(proc);
    await setList(`procedures-${proc.patientId}`, all);
}

// ---------- Messages ----------

export interface Message {
    id: string;
    patientId: string;
    doctorId: string;
    senderType: 'doctor' | 'patient';
    content: string;
    read: boolean;
    createdAt: string;
}

export async function getMessages(patientId: string): Promise<Message[]> {
    const all = await getList<Message>(`messages-${patientId}`);
    return all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function saveMessage(msg: Message): Promise<void> {
    const all = await getList<Message>(`messages-${msg.patientId}`);
    all.push(msg);
    await setList(`messages-${msg.patientId}`, all);
}

export async function markMessagesRead(patientId: string, readerType: 'doctor' | 'patient'): Promise<void> {
    const all = await getList<Message>(`messages-${patientId}`);
    const updated = all.map(m => ({
        ...m,
        read: m.senderType !== readerType ? true : m.read
    }));
    await setList(`messages-${patientId}`, updated);
}
