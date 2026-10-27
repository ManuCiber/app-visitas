import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Lock,
  Mail,
  User,
  MapPin,
  ArrowRight,
  X,
  AlertCircle,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { zonaService } from '../services/zonaService';
import { Zona } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { login, register, loginWithGoogle, adminExists, refreshSetupStatus } = useAuth();
  const { success, error, info } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [zonaId, setZonaId] = useState<number | ''>('');
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [pendingApprovalSuccess, setPendingApprovalSuccess] = useState(false);

  useEffect(() => {
    if (!adminExists) {
      setMode('register');
    } else {
      setMode(defaultMode);
    }
    setFormError('');
    setPendingApprovalSuccess(false);
  }, [defaultMode, isOpen, adminExists]);

  useEffect(() => {
    if (isOpen) {
      zonaService
        .listarActivas()
        .then(setZonas)
        .catch(() => setZonas([]));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!correo.trim() || !password.trim()) {
          setFormError('Por favor complete su correo y contraseña');
          setLoading(false);
          return;
        }
        await login(correo, password);
        success('Sesión iniciada', 'Bienvenido al sistema MediCare');
        onClose();
      } else {
        if (!nombres.trim() || !apellidos.trim() || !correo.trim() || !password.trim()) {
          setFormError('Todos los campos marcados son obligatorios');
          setLoading(false);
          return;
        }

        const res = await register({
          nombres,
          apellidos,
          correo,
          password,
          zonaId: zonaId ? Number(zonaId) : undefined,
        });

        if (res.token) {
          // Es el primer usuario registrado -> Administrador
          success(
            '¡Administrador Registrado!',
            'Tu empresa y cuenta de Administrador General han sido creadas con éxito.'
          );
          await refreshSetupStatus();
          onClose();
        } else {
          // Es un usuario posterior -> Pendiente de aprobación
          setPendingApprovalSuccess(true);
          await refreshSetupStatus();
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setLoading(true);
    setFormError('');
    try {
      await login(userEmail, 'Password123!');
      success('Sesión iniciada', `Conectado como ${userEmail}`);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Error al iniciar sesión de demostración');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      info(
        'Google OAuth preparado',
        'Para activar el popup de Google en vivo, configure la variable VITE_GOOGLE_CLIENT_ID en el entorno.'
      );
      return;
    }

    try {
      setLoading(true);
      const res = await loginWithGoogle('GOOGLE_MOCK_TOKEN', zonaId ? Number(zonaId) : undefined);
      if (res.token) {
        success('Acceso con Google', 'Sesión iniciada correctamente');
        onClose();
      } else {
        setPendingApprovalSuccess(true);
      }
    } catch (err: any) {
      error('Error Google OAuth', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div
          className={`p-6 text-white relative ${
            !adminExists
              ? 'bg-gradient-to-tr from-purple-700 to-indigo-800'
              : 'bg-gradient-to-tr from-blue-700 to-indigo-700'
          }`}
        >
          {adminExists && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
            {!adminExists ? <ShieldCheck className="w-6 h-6" /> : <Stethoscope className="w-6 h-6" />}
          </div>

          {!adminExists ? (
            <>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 mb-1.5 uppercase tracking-wide">
                👑 Configuración Inicial de la Empresa
              </div>
              <h2 className="text-xl font-bold">Registro de Administrador</h2>
              <p className="text-xs text-purple-100 mt-1">
                Bienvenido a MediCare. Como primer usuario registrado, obtendrás automáticamente el rol de{' '}
                <strong>Administrador General</strong> con acceso y control total.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold">
                {mode === 'login' ? 'Iniciar Sesión en MediCare' : 'Registro de Visitador Médico'}
              </h2>
              <p className="text-xs text-blue-100 mt-1">
                {mode === 'login'
                  ? 'Acceda a su catálogo de médicos y centros de salud'
                  : 'Cree su cuenta de visitador médico para su zona'}
              </p>
            </>
          )}
        </div>

        {/* Pending Approval Confirmation View */}
        {pendingApprovalSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">¡Registro Enviado con Éxito!</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Tu cuenta de <strong>Visitador Médico</strong> ha sido registrada en el sistema.
              </p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 space-y-2">
              <div className="flex items-center font-semibold text-amber-950">
                <Clock className="w-4 h-4 mr-1.5 text-amber-600" />
                <span>Pendiente de Aprobación por el Administrador</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Por políticas de seguridad de la empresa, el <strong>Administrador General</strong> debe
                aprobar y activar tu cuenta antes de tu primer acceso. Se ha enviado una notificación
                interna al panel administrativo.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setPendingApprovalSuccess(false);
                setMode('login');
              }}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition"
            >
              Ir al Inicio de Sesión
            </button>
          </div>
        ) : (
          <>
            {/* Quick Demo Credentials Banner (solo visible si existe admin) */}
            {adminExists && (
              <div className="px-6 pt-3 pb-2 bg-blue-50/50 border-b border-blue-100">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-semibold text-blue-900 uppercase tracking-wider">
                    Accesos Rápidos de Prueba:
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@medicare.do')}
                    className="flex-1 py-1 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    👑 Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('visitador@medicare.do')}
                    className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    🩺 Visitador
                  </button>
                </div>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{formError}</span>
                </div>
              )}

              {/* Informative alert for visitor approval */}
              {adminExists && mode === 'register' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start space-x-2">
                  <Clock className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span className="text-[11px] leading-relaxed">
                    <strong>Nota:</strong> Los nuevos visitadores deben ser aprobados por el Administrador antes de
                    iniciar sesión.
                  </span>
                </div>
              )}

              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nombres <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={nombres}
                        onChange={(e) => setNombres(e.target.value)}
                        placeholder="Carlos"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Apellidos <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                      placeholder="Ramírez"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="usuario@medicare.do"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
              </div>

              {mode === 'register' && adminExists && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Zona Geográfica
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <select
                      value={zonaId}
                      onChange={(e) => setZonaId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    >
                      <option value="">Seleccionar zona (opcional)...</option>
                      {zonas.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50 ${
                  !adminExists
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                }`}
              >
                <span>
                  {loading
                    ? 'Procesando...'
                    : !adminExists
                    ? '👑 Registrar Empresa y Administrador'
                    : mode === 'login'
                    ? 'Iniciar Sesión'
                    : 'Solicitar Registro de Visitador'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Google OAuth Alternative */}
              {adminExists && (
                <>
                  <div className="relative my-4 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <span className="relative px-3 bg-white text-xs text-slate-400 uppercase tracking-wider">
                      o continuar con
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continuar con Google</span>
                  </button>
                </>
              )}

              {/* Toggle Login / Register */}
              {adminExists && (
                <div className="pt-2 text-center text-xs text-slate-500">
                  {mode === 'login' ? (
                    <span>
                      ¿No tienes cuenta?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setFormError('');
                          setMode('register');
                        }}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        Registrarse como visitador
                      </button>
                    </span>
                  ) : (
                    <span>
                      ¿Ya tienes una cuenta?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setFormError('');
                          setMode('login');
                        }}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        Iniciar sesión
                      </button>
                    </span>
                  )}
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
};
