import React from 'react';
import { Stethoscope, Building2, UserPlus, Shield, Bell, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenNuevoMedico: () => void;
  onOpenCentros: () => void;
  onOpenAdminPanel: (tab?: 'usuarios' | 'zonas' | 'notificaciones') => void;
  onOpenAuth: () => void;
  unreadNotifsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNuevoMedico,
  onOpenCentros,
  onOpenAdminPanel,
  onOpenAuth,
  unreadNotifsCount,
}) => {
  const { usuario, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">MediCare</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-full uppercase tracking-wider">
                  Directorio
                </span>
                {isAuthenticated && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      isAdmin
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {usuario?.rol}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {isAuthenticated
                  ? `${usuario?.nombreCompleto} ${usuario?.zona ? `• ${usuario.zona.nombre}` : ''}`
                  : 'Gestión Integral de Médicos y Centros de Salud'}
              </p>
            </div>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Admin Notifications Button */}
            {isAdmin && (
              <button
                onClick={() => onOpenAdminPanel('notificaciones')}
                title="Notificaciones internas"
                className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>
            )}

            {/* Admin Panel Button */}
            {isAdmin && (
              <button
                onClick={() => onOpenAdminPanel('usuarios')}
                className="inline-flex items-center px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition shadow-xs"
              >
                <Shield className="w-4 h-4 mr-1.5" />
                <span>Panel Admin</span>
              </button>
            )}

            {/* Centros Médicos Compartidos */}
            <button
              onClick={onOpenCentros}
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition shadow-xs"
            >
              <Building2 className="w-4 h-4 mr-1.5 text-slate-500" />
              <span>Centros</span>
            </button>

            {/* Nuevo Médico */}
            <button
              onClick={onOpenNuevoMedico}
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/30 transition"
            >
              <UserPlus className="w-4 h-4 mr-1.5" />
              <span>Nuevo Médico</span>
            </button>

            {/* User Session button */}
            {isAuthenticated ? (
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                <span>Ingresar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
