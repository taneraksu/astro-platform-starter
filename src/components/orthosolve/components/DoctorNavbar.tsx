// OrthoSolve - Doctor Navigation Bar
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { alertStorage } from '../storage';
import OrthoSolveLogo from './OrthoSolveLogo';

export default function DoctorNavbar() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const unreadAlerts = alertStorage.getUnread().length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/doktor/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/doktor/yeni-hasta', label: 'Yeni Hasta', icon: '➕' },
    { to: '/doktor/randevular', label: 'Randevular', icon: '📅' },
    { to: '/doktor/raporlar', label: 'Raporlar', icon: '📋' },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav style={{ background: '#1a3c6e' }} className="shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/doktor/dashboard" className="flex items-center no-underline">
            <OrthoSolveLogo width={160} />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium no-underline transition-colors ${
                  isActive(link.to)
                    ? 'bg-white/20 text-white'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {unreadAlerts > 0 && (
              <Link to="/doktor/dashboard" className="relative no-underline" title="Okunmamış uyarılar">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadAlerts > 9 ? '9+' : unreadAlerts}
                </span>
              </Link>
            )}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-teal-300 text-sm">Op. Dr. Taner Aksu</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors cursor-pointer"
              >
                Çıkış
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-white"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-3 border-t border-white/20 pt-3">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium no-underline transition-colors mb-1 ${
                  isActive(link.to)
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-2 px-4 py-3 text-white/80 hover:text-white text-sm"
            >
              🚪 Çıkış Yap
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
