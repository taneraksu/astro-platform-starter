export type Gender = 'male' | 'female';

export type LimiteningPhase = 'pre-op' | 'latency' | 'distraction' | 'consolidation' | 'rehabilitation' | 'completed';

export type SurgeryType = 'Ilizarov' | 'LON' | 'PRECICE' | 'Holyfix' | 'Other';

export type BoneType = 'femur' | 'tibia' | 'both' | 'humerus';

export type NoteType = 'general' | 'complication' | 'xray' | 'appointment' | 'physical_therapy';

export interface Patient {
    id: string;
    name: string;
    dateOfBirth: string;
    gender: Gender;
    phone: string;
    email: string;
    initialHeightCm: number;
    targetHeightCm: number;
    currentHeightCm: number;
    surgeryDate: string;
    surgeryType: SurgeryType;
    bone: BoneType;
    targetLengtheningMm: number;
    achievedLengtheningMm: number;
    distractionRateMmPerDay: number;
    phase: LimiteningPhase;
    doctor: string;
    hospital: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export interface Measurement {
    id: string;
    patientId: string;
    date: string;
    heightCm: number;
    lengtheningMm: number;
    painLevel: number; // 0-10
    mobilityScore: number; // 0-10
    xrayTaken: boolean;
    xrayDate?: string;
    callus?: 'none' | 'minimal' | 'moderate' | 'good' | 'excellent';
    notes: string;
    createdAt: string;
}

export interface PatientNote {
    id: string;
    patientId: string;
    date: string;
    type: NoteType;
    title: string;
    content: string;
    createdBy: string;
    createdAt: string;
}

export interface PatientStats {
    totalPatients: number;
    activePatients: number;
    completedPatients: number;
    patientsInDistraction: number;
    patientsInConsolidation: number;
    averageLengtheningMm: number;
}

export interface MeasurementSummary {
    latestMeasurement?: Measurement;
    totalMeasurements: number;
    progressPercentage: number;
    remainingMm: number;
    estimatedCompletionDays: number;
}
