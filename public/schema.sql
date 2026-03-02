-- ============================================================
-- DiyabetikAyak Takip Sistemi - Supabase Schema
-- ============================================================

-- DOCTORS
CREATE TABLE IF NOT EXISTS doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  clinic_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATIENTS
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dob DATE,
  phone TEXT,
  diagnosis_date DATE,
  access_code TEXT UNIQUE NOT NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GLUCOSE ENTRIES
CREATE TABLE IF NOT EXISTS glucose_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  datetime TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  value INTEGER NOT NULL,
  measurement_type TEXT NOT NULL CHECK (measurement_type IN ('fasting', 'postprandial', 'random')),
  insulin_used BOOLEAN DEFAULT FALSE,
  insulin_type TEXT,
  dose NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WOUND ENTRIES
CREATE TABLE IF NOT EXISTS wound_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  datetime TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  foot_side TEXT NOT NULL CHECK (foot_side IN ('left', 'right', 'both')),
  wagner_grade INTEGER NOT NULL CHECK (wagner_grade BETWEEN 0 AND 5),
  size TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large')),
  symptoms JSONB DEFAULT '{}',
  pain_score INTEGER CHECK (pain_score BETWEEN 1 AND 10),
  can_walk TEXT NOT NULL CHECK (can_walk IN ('normal', 'limping', 'cannot')),
  photo_url TEXT,
  temperature NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROCEDURES
CREATE TABLE IF NOT EXISTS procedures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id),
  date DATE NOT NULL,
  type TEXT NOT NULL,
  surgeon_name TEXT,
  details TEXT,
  outcome TEXT,
  followup_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('doctor', 'patient')),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_glucose_patient ON glucose_entries(patient_id);
CREATE INDEX IF NOT EXISTS idx_glucose_datetime ON glucose_entries(datetime DESC);
CREATE INDEX IF NOT EXISTS idx_wound_patient ON wound_entries(patient_id);
CREATE INDEX IF NOT EXISTS idx_wound_datetime ON wound_entries(datetime DESC);
CREATE INDEX IF NOT EXISTS idx_messages_patient ON messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_access_code ON patients(access_code);
CREATE INDEX IF NOT EXISTS idx_patients_doctor ON patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_procedures_patient ON procedures(patient_id);

-- DISABLE RLS (enable and configure policies in production)
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE glucose_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE wound_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE procedures DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
