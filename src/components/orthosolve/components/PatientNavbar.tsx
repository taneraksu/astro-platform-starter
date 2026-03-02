// OrthoSolve - Patient Navigation Bar (large, accessibility-friendly)
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

export default function PatientNavbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/hasta/panel', label: 'Ana Sayfa', icon: '🏠' },
    { to: '/hasta/kan-sekeri', label: 'Kan Şekeri', icon: '💉' },
    { to: '/hasta/yaralar', label: 'Yara Takibi', icon: '🩹' },
    { to: '/hasta/iletisim', label: 'İletişim', icon: '📞' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top bar */}
      <div style={{ background: '#1a3c6e' }} className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦶</span>
          <div>
            <span className="text-white font-bold text-base leading-none block">OrthoSolve</span>
            <span className="text-teal-300 text-xs">Diabetik Ayak Takip</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-teal-200 text-sm font-medium">
            Hoş geldiniz, <span className="text-white font-bold">{user?.ad}</span>
          </p>
          <button
            onClick={handleLogout}
            className="text-teal-300 text-xs hover:text-white transition-colors cursor-pointer"
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Bottom navigation tabs — large for elderly users */}
      <div className="fixed bottom-0 left-0 right-0 z-50 shadow-[0_-2px_12px_rgba(0,0,0,0.15)]" style={{ background: '#1a3c6e' }}>
        <div className="flex">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 no-underline transition-colors ${
                isActive(link.to)
                  ? 'bg-white/20'
                  : 'hover:bg-white/10'
              }`}
              style={{ minHeight: '64px' }}
            >
              <span className="text-2xl">{link.icon}</span>
              <span className={`text-xs font-bold ${isActive(link.to) ? 'text-white' : 'text-teal-200'}`}>
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
