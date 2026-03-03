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

// ---------- Sub-types for Clinical Profile ----------

export interface HbA1cRecord {
    date: string;
    value: number;
    lab?: string;
}

export interface UlcerEpisode {
    date: string;
    location: string;
    outcome?: string;
}

export interface AmputationRecord {
    date: string;
    level: 'toe' | 'ray' | 'transmetatarsal' | 'BKA' | 'AKA';
    side: 'left' | 'right';
    digit?: string;
}

export interface AntibioticRecord {
    name: string;
    startDate: string;
    endDate?: string;
    changedByCulture: boolean;
    cultureResult?: string;
}

export interface AllergyRecord {
    allergen: string;
    type: 'drug' | 'latex' | 'food' | 'other';
    reaction?: string;
}

// ---------- Clinical Profile (Sections A–D) ----------

export interface ClinicalProfile {
    id: string;
    patientId: string;
    doctorId: string;
    // Section A — Identity / Social
    gender: 'male' | 'female' | 'other';
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    heightCm?: number;
    weightKg?: number;
    bmi?: number;
    smokingStatus: 'never' | 'former' | 'active';
    packsPerDay?: number;
    smokingQuitYear?: number;
    alcoholStatus: 'never' | 'occasional' | 'regular';
    mobilityLevel: 'independent' | 'with_aid' | 'wheelchair' | 'bed_bound';
    homeCareSupport: boolean;
    homeCareType?: string;
    // Section B — Diabetes & Metabolic
    diabetesType: 'T1' | 'T2' | 'LADA' | 'MODY' | 'other';
    diagnosisYear?: number;
    treatmentInsulin: boolean;
    insulinType?: string;
    treatmentOral: boolean;
    oralAgentNames?: string;
    treatmentGLP1: boolean;
    treatmentSGLT2: boolean;
    treatmentOther?: string;
    hba1cRecords: HbA1cRecord[];
    hypoglycemiaHistory: boolean;
    glycemicVariabilityNotes?: string;
    // Section C — Comorbidities
    ulcerHistory: boolean;
    ulcerEpisodes: UlcerEpisode[];
    amputationHistory: boolean;
    amputations: AmputationRecord[];
    charcotStatus: 'none' | 'active' | 'old';
    charcotFoot?: 'left' | 'right' | 'both';
    eichenholtzStage?: 0 | 1 | 2 | 3;
    padHistory: boolean;
    revascularizationHistory: boolean;
    revascularizationDetails?: string;
    ckd: boolean;
    ckdStage?: 1 | 2 | 3 | 4 | 5;
    dialysis: boolean;
    transplant: boolean;
    coronaryArteryDisease: boolean;
    heartFailure: boolean;
    stroke: boolean;
    atrialFibrillation: boolean;
    retinopathy: boolean;
    depression: boolean;
    cognitiveImpairment: boolean;
    otherComorbidities?: string;
    // Section D — Medications & Allergies
    antiplatelet: boolean;
    antiplateletNames?: string;
    anticoagulant: boolean;
    anticoagulantNames?: string;
    statin: boolean;
    statinName?: string;
    antihypertensives?: string;
    immunosuppression: boolean;
    immunosuppressionDetails?: string;
    steroids: boolean;
    steroidDetails?: string;
    currentAntibiotics: AntibioticRecord[];
    allergies: AllergyRecord[];
    updatedAt: string;
}

export async function getClinicalProfile(patientId: string): Promise<ClinicalProfile | null> {
    const blob = await store().get(`clinical-profile-${patientId}`, { type: 'json' });
    return (blob as ClinicalProfile | null);
}

export async function saveClinicalProfile(profile: ClinicalProfile): Promise<void> {
    await store().setJSON(`clinical-profile-${profile.patientId}`, profile);
}

// ---------- Foot Examination (Section E) ----------

export interface FootExamination {
    id: string;
    patientId: string;
    doctorId: string;
    examDate: string;
    examiner?: string;
    // Neuropathy
    monofilamentLeft: boolean;
    monofilamentLeftPoints?: number;
    monofilamentRight: boolean;
    monofilamentRightPoints?: number;
    vibrationLeft?: 'normal' | 'reduced' | 'absent';
    vibrationRight?: 'normal' | 'reduced' | 'absent';
    pinprickLeft?: 'normal' | 'reduced' | 'absent';
    pinprickRight?: 'normal' | 'reduced' | 'absent';
    temperatureLeft?: 'normal' | 'reduced' | 'absent';
    temperatureRight?: 'normal' | 'reduced' | 'absent';
    lopsLeft: boolean;
    lopsRight: boolean;
    // Circulation
    dpPulseLeft: 'palpable' | 'doppler_only' | 'absent';
    dpPulseRight: 'palpable' | 'doppler_only' | 'absent';
    ptPulseLeft: 'palpable' | 'doppler_only' | 'absent';
    ptPulseRight: 'palpable' | 'doppler_only' | 'absent';
    abiLeft?: number;
    abiRight?: number;
    tbiLeft?: number;
    tbiRight?: number;
    toePressureLeft?: number;
    toePressureRight?: number;
    tcpo2Left?: number;
    tcpo2Right?: number;
    capillaryRefillLeft: 'normal' | 'delayed';
    capillaryRefillRight: 'normal' | 'delayed';
    skinTempLeft: 'normal' | 'cool' | 'warm';
    skinTempRight: 'normal' | 'cool' | 'warm';
    colorChangeLeft: 'normal' | 'pallor' | 'rubor' | 'cyanosis';
    colorChangeRight: 'normal' | 'pallor' | 'rubor' | 'cyanosis';
    // Skin & Structure — Left
    leftCallus: boolean;
    leftFissure: boolean;
    leftTinea: boolean;
    leftOnychomycosis: boolean;
    leftHalluxValgus: boolean;
    leftHammerToes: boolean;
    leftCharcotDeformity: boolean;
    leftPesPlanus: boolean;
    leftPesCavus: boolean;
    leftAnkleEquinus: boolean;
    // Skin & Structure — Right
    rightCallus: boolean;
    rightFissure: boolean;
    rightTinea: boolean;
    rightOnychomycosis: boolean;
    rightHalluxValgus: boolean;
    rightHammerToes: boolean;
    rightCharcotDeformity: boolean;
    rightPesPlanus: boolean;
    rightPesCavus: boolean;
    rightAnkleEquinus: boolean;
    // Footwear
    appropriateFootwear: boolean;
    orthosis: boolean;
    pressurePointsIdentified: boolean;
    footwearNotes?: string;
    // Risk
    iwgdfRiskCategory?: 0 | 1 | 2 | 3;
    notes?: string;
    createdAt: string;
}

export async function getFootExams(patientId: string): Promise<FootExamination[]> {
    const all = await getList<FootExamination>(`foot-exam-${patientId}`);
    return all.sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
}

export async function saveFootExam(exam: FootExamination): Promise<void> {
    const all = await getList<FootExamination>(`foot-exam-${exam.patientId}`);
    const idx = all.findIndex(e => e.id === exam.id);
    if (idx >= 0) all[idx] = exam; else all.push(exam);
    await setList(`foot-exam-${exam.patientId}`, all);
}

// ---------- Infection Assessment (Section G) ----------

export interface CultureRecord {
    date: string;
    source: 'superficial_swab' | 'deep_tissue' | 'bone' | 'blood';
    organisms?: string;
    sensitivities?: string;
    resistances?: string;
}

export interface InfectionRecord {
    id: string;
    patientId: string;
    doctorId: string;
    assessmentDate: string;
    erythemaCm?: number;
    warmth: boolean;
    edema: boolean;
    tenderness: boolean;
    purulence: boolean;
    fever: boolean;
    feverTemp?: number;
    tachycardia: boolean;
    hypotension: boolean;
    iwgdfInfectionGrade: 1 | 2 | 3 | 4;
    osteomyelitisSuspected: boolean;
    probeToBone?: boolean;
    imagingDone: 'none' | 'xray' | 'mri' | 'ct' | 'bone_scan';
    imagingFindings?: string;
    boneBiopsyDone: boolean;
    boneBiopsyResults?: string;
    cultures: CultureRecord[];
    notes?: string;
    createdAt: string;
}

export async function getInfectionRecords(patientId: string): Promise<InfectionRecord[]> {
    const all = await getList<InfectionRecord>(`infection-${patientId}`);
    return all.sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
}

export async function saveInfectionRecord(rec: InfectionRecord): Promise<void> {
    const all = await getList<InfectionRecord>(`infection-${rec.patientId}`);
    const idx = all.findIndex(e => e.id === rec.id);
    if (idx >= 0) all[idx] = rec; else all.push(rec);
    await setList(`infection-${rec.patientId}`, all);
}

// ---------- Lab Tests (Section H) ----------

export interface LabRecord {
    id: string;
    patientId: string;
    doctorId: string;
    testDate: string;
    wbc?: number;
    wbcDiff?: string;
    hgb?: number;
    plt?: number;
    crp?: number;
    esr?: number;
    procalcitonin?: number;
    creatinine?: number;
    egfr?: number;
    bun?: number;
    hba1c?: number;
    fastingGlucose?: number;
    imagingOrdered?: string;
    imagingResults?: string;
    notes?: string;
    createdAt: string;
}

export async function getLabRecords(patientId: string): Promise<LabRecord[]> {
    const all = await getList<LabRecord>(`labs-${patientId}`);
    return all.sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());
}

export async function saveLabRecord(rec: LabRecord): Promise<void> {
    const all = await getList<LabRecord>(`labs-${rec.patientId}`);
    const idx = all.findIndex(e => e.id === rec.id);
    if (idx >= 0) all[idx] = rec; else all.push(rec);
    await setList(`labs-${rec.patientId}`, all);
}

// ---------- Treatment Plan (Section I) ----------

export interface DebridementEntry {
    date: string;
    operator?: string;
    type: 'sharp' | 'enzymatic' | 'autolytic' | 'biological' | 'hydrosurgical';
    notes?: string;
}

export interface TreatmentRecord {
    id: string;
    patientId: string;
    doctorId: string;
    planDate: string;
    debridements: DebridementEntry[];
    dressingType: string;
    npwt: boolean;
    biologicalProducts?: string;
    dressingChangeFrequency?: string;
    offloadingTCC: boolean;
    offloadingWalker: boolean;
    offloadingInsole: boolean;
    offloadingRest: boolean;
    offloadingCrutches: boolean;
    offloadingOther?: string;
    revascularizationPlanned: boolean;
    revascularizationType?: 'endovascular' | 'surgical';
    revascularizationPlannedDate?: string;
    revascularizationCompletedDate?: string;
    revascularizationResult?: string;
    pressureReliefSurgeryPlanned: boolean;
    pressureReliefType?: string;
    pressureReliefPlannedDate?: string;
    nextAppointmentDate?: string;
    appointmentIntervalWeeks?: number;
    patientCompliance: 'good' | 'moderate' | 'poor';
    educationProvided: boolean;
    educationTopics?: string[];
    notes?: string;
    createdAt: string;
}

export async function getTreatmentRecords(patientId: string): Promise<TreatmentRecord[]> {
    const all = await getList<TreatmentRecord>(`treatment-${patientId}`);
    return all.sort((a, b) => new Date(b.planDate).getTime() - new Date(a.planDate).getTime());
}

export async function saveTreatmentRecord(rec: TreatmentRecord): Promise<void> {
    const all = await getList<TreatmentRecord>(`treatment-${rec.patientId}`);
    const idx = all.findIndex(e => e.id === rec.id);
    if (idx >= 0) all[idx] = rec; else all.push(rec);
    await setList(`treatment-${rec.patientId}`, all);
}
