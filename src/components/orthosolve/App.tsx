// OrthoSolve - Main Application Entry Point with React Router
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import { initializeStorage } from './storage';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/doctor/Dashboard';
import NewPatient from './pages/doctor/NewPatient';
import PatientDetail from './pages/doctor/PatientDetail';
import Scoring from './pages/doctor/Scoring';
import Procedures from './pages/doctor/Procedures';
import GlucoseManagement from './pages/doctor/GlucoseManagement';
import Appointments from './pages/doctor/Appointments';
import Reports from './pages/doctor/Reports';
import PatientPanel from './pages/patient/Panel';
import PatientGlucoseLog from './pages/patient/GlucoseLog';
import PatientWounds from './pages/patient/Wounds';
import PatientContact from './pages/patient/Contact';

// Route guard for role-based access
function PrivateRoute({ children, role }: { children: React.ReactNode; role: 'doctor' | 'patient' }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === 'doctor' ? '/doktor/dashboard' : '/hasta/panel'} replace />;
  }
  return <>{children}</>;
}

// App with routing
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Doctor routes */}
      <Route path="/doktor/dashboard" element={<PrivateRoute role="doctor"><Dashboard /></PrivateRoute>} />
      <Route path="/doktor/yeni-hasta" element={<PrivateRoute role="doctor"><NewPatient /></PrivateRoute>} />
      <Route path="/doktor/hasta/:id" element={<PrivateRoute role="doctor"><PatientDetail /></PrivateRoute>} />
      <Route path="/doktor/hasta/:id/skorlama" element={<PrivateRoute role="doctor"><Scoring /></PrivateRoute>} />
      <Route path="/doktor/hasta/:id/islemler" element={<PrivateRoute role="doctor"><Procedures /></PrivateRoute>} />
      <Route path="/doktor/hasta/:id/kan-sekeri" element={<PrivateRoute role="doctor"><GlucoseManagement /></PrivateRoute>} />
      <Route path="/doktor/randevular" element={<PrivateRoute role="doctor"><Appointments /></PrivateRoute>} />
      <Route path="/doktor/raporlar" element={<PrivateRoute role="doctor"><Reports /></PrivateRoute>} />

      {/* Patient routes */}
      <Route path="/hasta/panel" element={<PrivateRoute role="patient"><PatientPanel /></PrivateRoute>} />
      <Route path="/hasta/kan-sekeri" element={<PrivateRoute role="patient"><PatientGlucoseLog /></PrivateRoute>} />
      <Route path="/hasta/yaralar" element={<PrivateRoute role="patient"><PatientWounds /></PrivateRoute>} />
      <Route path="/hasta/iletisim" element={<PrivateRoute role="patient"><PatientContact /></PrivateRoute>} />

      {/* Default redirect */}
      <Route
        path="/"
        element={
          user
            ? <Navigate to={user.role === 'doctor' ? '/doktor/dashboard' : '/hasta/panel'} replace />
            : <Navigate to="/login" replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Root component — initializes storage and wraps everything in providers
export default function App() {
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen bg-gray-50 font-sans">
          <AppRoutes />
        </div>
      </HashRouter>
    </AuthProvider>
  );
}
