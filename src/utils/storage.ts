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
    wagnerGrade: number;
    size: 'small' | 'medium' | 'large';
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
