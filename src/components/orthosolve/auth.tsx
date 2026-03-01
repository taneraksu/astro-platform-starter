// OrthoSolve - Authentication Context
import React, { createContext, useContext, useState } from 'react';
import type { AuthUser, UserRole } from './types';
import { patientStorage } from './storage';

interface AuthContextType {
  user: AuthUser | null;
  loginDoctor: (password: string) => boolean;
  loginPatient: (pin: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Doctor password (MVP — in production this should be hashed + stored securely)
const DOCTOR_PASSWORD = 'doktor123';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = sessionStorage.getItem('orthosolve_auth');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const loginDoctor = (password: string): boolean => {
    if (password === DOCTOR_PASSWORD) {
      const u: AuthUser = { id: 'doctor', role: 'doctor', ad: 'Dr.', soyad: 'Aksu' };
      setUser(u);
      sessionStorage.setItem('orthosolve_auth', JSON.stringify(u));
      return true;
    }
    return false;
  };

  const loginPatient = (pin: string): boolean => {
    const patient = patientStorage.authenticate(pin);
    if (patient) {
      const u: AuthUser = {
        id: patient.id,
        role: 'patient',
        ad: patient.ad,
        soyad: patient.soyad,
      };
      setUser(u);
      sessionStorage.setItem('orthosolve_auth', JSON.stringify(u));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('orthosolve_auth');
  };

  return (
    <AuthContext.Provider value={{ user, loginDoctor, loginPatient, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
