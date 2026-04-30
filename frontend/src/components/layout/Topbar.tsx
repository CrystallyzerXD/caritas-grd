import { Menu, Bell, LogOut, ChevronDown, Sparkles, Wand2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGlassMode } from '../../hooks/useGlassMode';
import { useVisualEffects } from '../../hooks/useVisualEffects';
import { RoleBadge } from '../common/Badge';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { glassMode, toggleGlassMode } = useGlassMode();
  const { visualEffects, toggleVisualEffects } = useVisualEffects();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 relative z-20">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          title="Mostrar/ocultar menú"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden lg:block">
          <h1 className="text-sm font-semibold text-gray-800">
            Gestión de Riesgo de Desastres
          </h1>
          <p className="text-xs text-gray-500">Cáritas Diocesana de Lima</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications placeholder */}
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 relative">
          <Bell className="h-5 w-5" />
        </button>

        {/* User menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-[#009850] flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {user?.fullName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-tight max-w-[140px] truncate">
                {user?.fullName}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
              {/* User info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">{user?.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <div className="mt-1.5">
                  {user?.role && <RoleBadge role={user.role} />}
                </div>
              </div>

              {/* Glass mode toggle */}
              <div className="px-4 py-3 border-b border-gray-100">
                <button
                  type="button"
                  onClick={toggleGlassMode}
                  className="w-full flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={[
                      'p-1.5 rounded-lg transition-colors',
                      glassMode
                        ? 'bg-violet-100 text-violet-600'
                        : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200',
                    ].join(' ')}>
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-700">Liquid Glass</p>
                      <p className="text-xs text-gray-400">Efecto cristal estilo iOS</p>
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <div className={[
                    'relative w-10 h-6 rounded-full transition-colors duration-300 flex-shrink-0',
                    glassMode ? 'bg-violet-500' : 'bg-gray-200',
                  ].join(' ')}>
                    <span className={[
                      'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300',
                      glassMode ? 'translate-x-5' : 'translate-x-1',
                    ].join(' ')} />
                  </div>
                </button>
              </div>

              {/* Visual effects toggle */}
              <div className="px-4 py-3 border-b border-gray-100">
                <button
                  type="button"
                  onClick={toggleVisualEffects}
                  className="w-full flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={[
                      'p-1.5 rounded-lg transition-colors',
                      visualEffects
                        ? 'bg-sky-100 text-sky-600'
                        : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200',
                    ].join(' ')}>
                      <Wand2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-700">Efectos Visuales</p>
                      <p className="text-xs text-gray-400">Spring en botones y más</p>
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <div className={[
                    'relative w-10 h-6 rounded-full transition-colors duration-300 flex-shrink-0',
                    visualEffects ? 'bg-sky-500' : 'bg-gray-200',
                  ].join(' ')}>
                    <span className={[
                      'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300',
                      visualEffects ? 'translate-x-5' : 'translate-x-1',
                    ].join(' ')} />
                  </div>
                </button>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
