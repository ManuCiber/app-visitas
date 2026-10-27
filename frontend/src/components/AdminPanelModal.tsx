import React, { useState, useEffect } from 'react';
import { X, Users, MapPin, Bell, Shield, Check, CheckCheck, Plus, RefreshCw, UserCheck, Crown } from 'lucide-react';
import { Usuario, Zona, Notificacion } from '../types';
import { usuarioService } from '../services/usuarioService';
import { zonaService } from '../services/zonaService';
import { notificacionService } from '../services/notificacionService';
import { useToast } from '../context/ToastContext';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'usuarios' | 'zonas' | 'notificaciones'>('usuarios');

  // Data states
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(false);

  // New Zone Form
  const [showNewZona, setShowNewZona] = useState(false);
  const [nuevaZonaNombre, setNuevaZonaNombre] = useState('');
  const [nuevaZonaDesc, setNuevaZonaDesc] = useState('');

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [editZonaId, setEditZonaId] = useState<number | ''>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, zonasRes, notifsRes] = await Promise.all([
        usuarioService.listarTodos().catch(() => []),
        zonaService.listarTodas().catch(() => []),
        notificacionService.listarTodas().catch(() => []),
      ]);
      setUsuarios(usersRes);
      setZonas(zonasRes);
      setNotificaciones(notifsRes);
    } catch (err: any) {
      error('Error al cargar panel administrativo', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle user active status / approve
  const handleToggleUserStatus = async (user: Usuario) => {
    const nuevoEstado = !user.activo;
    try {
      await usuarioService.cambiarEstado(user.id, nuevoEstado);
      success(
        nuevoEstado ? 'Cuenta Aprobada y Habilitada' : 'Cuenta Desactivada',
        `El usuario ${user.nombreCompleto} ha sido ${nuevoEstado ? 'aprobado exitosamente y ya puede iniciar sesión' : 'desactivado'}.`
      );
      loadData();
      onDataChanged?.();
    } catch (err: any) {
      error('Error al cambiar estado', err.message);
    }
  };

  // Approve user directly from notification card
  const handleAprobarUsuarioDirecto = async (userId: number, notifId: number) => {
    try {
      await usuarioService.cambiarEstado(userId, true);
      await notificacionService.marcarComoLeida(notifId);
      success('Usuario Aprobado', 'El visitador ha sido aprobado y habilitado en el sistema.');
      loadData();
      onDataChanged?.();
    } catch (err: any) {
      error('Error al aprobar usuario', err.message);
    }
  };

  // Change user role (Promote to ADMIN or change to VISITADOR)
  const handleCambiarRol = async (user: Usuario, nuevoRol: 'ADMIN' | 'VISITADOR') => {
    const advertencia =
      nuevoRol === 'ADMIN'
        ? `¿Confirmas que deseas otorgar privilegios de Administrador General a ${user.nombreCompleto}? Tendrá acceso completo a usuarios, zonas y configuraciones globales.`
        : `¿Confirmas que deseas cambiar a ${user.nombreCompleto} al rol de Visitador?`;

    if (!window.confirm(advertencia)) {
      return;
    }

    try {
      await usuarioService.cambiarRol(user.id, nuevoRol);
      success(
        nuevoRol === 'ADMIN' ? '👑 Usuario Promovido a Administrador' : 'Rol Asignado a Visitador',
        `${user.nombreCompleto} ahora tiene rol ${nuevoRol}.`
      );
      loadData();
      onDataChanged?.();
    } catch (err: any) {
      error('Error al cambiar rol', err.message);
    }
  };

  // Edit user zone
  const handleSaveUserZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await usuarioService.actualizar(editingUser.id, {
        nombres: editingUser.nombres,
        apellidos: editingUser.apellidos,
        zonaId: editZonaId ? Number(editZonaId) : undefined,
      });
      success('Usuario actualizado', `Zona asignada a ${editingUser.nombreCompleto}`);
      setEditingUser(null);
      loadData();
      onDataChanged?.();
    } catch (err: any) {
      error('Error al actualizar zona', err.message);
    }
  };

  // Create new zone
  const handleCreateZona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaZonaNombre.trim()) return;

    try {
      await zonaService.crear({
        nombre: nuevaZonaNombre.trim(),
        descripcion: nuevaZonaDesc.trim() || undefined,
        activo: true,
      });
      success('Zona creada', nuevaZonaNombre);
      setNuevaZonaNombre('');
      setNuevaZonaDesc('');
      setShowNewZona(false);
      loadData();
      onDataChanged?.();
    } catch (err: any) {
      error('Error al crear zona', err.message);
    }
  };

  // Mark notification as read
  const handleMarkNotifRead = async (id: number) => {
    try {
      await notificacionService.marcarComoLeida(id);
      loadData();
      onDataChanged?.();
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await notificacionService.marcarTodasComoLeidas();
      success('Notificaciones actualizadas', 'Todas marcadas como leídas.');
      loadData();
      onDataChanged?.();
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Panel de Administración Central</h2>
              <p className="text-xs text-slate-400">
                Gestión de usuarios, asignación de zonas y auditoría de notificaciones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6">
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center py-3.5 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'usuarios'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            <span>Usuarios & Cuentas ({usuarios.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('zonas')}
            className={`flex items-center py-3.5 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'zonas'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4 mr-2" />
            <span>Zonas Geográficas ({zonas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notificaciones')}
            className={`flex items-center py-3.5 px-4 text-xs font-semibold border-b-2 transition relative ${
              activeTab === 'notificaciones'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-4 h-4 mr-2" />
            <span>Notificaciones Internas</span>
            {notificaciones.filter((n) => !n.leida).length > 0 && (
              <span className="ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {notificaciones.filter((n) => !n.leida).length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-xs">Cargando datos administrativos...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: USUARIOS */}
              {activeTab === 'usuarios' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <p>
                      Desactivar una cuenta impide el inicio de sesión sin eliminar los médicos ni historiales del visitador.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                        <tr>
                          <th className="px-4 py-3 text-left">Usuario</th>
                          <th className="px-4 py-3 text-left">Rol</th>
                          <th className="px-4 py-3 text-left">Zona Asignada</th>
                          <th className="px-4 py-3 text-left">Estado</th>
                          <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {usuarios.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-900">{u.nombreCompleto}</p>
                              <p className="text-slate-400 text-[11px]">{u.correo}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                                  u.rol === 'ADMIN'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {u.rol === 'ADMIN' && <Crown className="w-3 h-3 mr-1 text-purple-600" />}
                                {u.rol}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-slate-600 font-medium">
                                {u.zona?.nombre || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                                  u.activo
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-300'
                                }`}
                              >
                                {u.activo ? 'Habilitada (Activa)' : '⏳ Pendiente de Aprobación'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                              {/* Acción para otorgar rol de Administrador */}
                              {u.rol === 'VISITADOR' ? (
                                <button
                                  type="button"
                                  onClick={() => handleCambiarRol(u, 'ADMIN')}
                                  title="Promover a Administrador General"
                                  className="px-2.5 py-1 text-purple-700 hover:text-purple-800 hover:bg-purple-50 border border-purple-200 rounded-lg font-semibold transition inline-flex items-center shadow-xs"
                                >
                                  <Crown className="w-3.5 h-3.5 mr-1 text-purple-600" />
                                  <span>Hacer Admin</span>
                                </button>
                              ) : (
                                usuarios.filter((usr) => usr.rol === 'ADMIN').length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleCambiarRol(u, 'VISITADOR')}
                                    title="Remover permisos de Administrador"
                                    className="px-2 py-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg font-medium transition text-[11px]"
                                  >
                                    Cambiar a Visitador
                                  </button>
                                )
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingUser(u);
                                  setEditZonaId(u.zona?.id || '');
                                }}
                                className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg font-medium transition"
                              >
                                Zona
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(u)}
                                title={u.activo ? 'Desactivar cuenta' : 'Aprobar y activar cuenta'}
                                className={`px-2.5 py-1 rounded-lg font-semibold border transition ${
                                  u.activo
                                    ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                    : 'border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                }`}
                              >
                                {u.activo ? 'Desactivar' : '✓ Aprobar'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Inline edit zone modal */}
                  {editingUser && (
                    <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                      <form onSubmit={handleSaveUserZone} className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-indigo-950">
                            Reasignar Zona a: {editingUser.nombreCompleto}
                          </p>
                          <p className="text-[11px] text-indigo-700">
                            Seleccione la zona de cobertura para este visitador
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <select
                            value={editZonaId}
                            onChange={(e) => setEditZonaId(e.target.value ? Number(e.target.value) : '')}
                            className="text-xs py-1.5 px-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="">Sin zona asignada</option>
                            {zonas.map((z) => (
                              <option key={z.id} value={z.id}>
                                {z.nombre}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingUser(null)}
                            className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ZONAS */}
              {activeTab === 'zonas' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Zonas de Operación Geográfica
                    </span>
                    <button
                      onClick={() => setShowNewZona(!showNewZona)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      <span>{showNewZona ? 'Cancelar' : 'Nueva Zona'}</span>
                    </button>
                  </div>

                  {showNewZona && (
                    <form onSubmit={handleCreateZona} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-slate-800">Registrar Nueva Zona</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={nuevaZonaNombre}
                          onChange={(e) => setNuevaZonaNombre(e.target.value)}
                          placeholder="Nombre (ej. Zona Sur)"
                          className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          value={nuevaZonaDesc}
                          onChange={(e) => setNuevaZonaDesc(e.target.value)}
                          placeholder="Descripción (ej. San Cristóbal, Baní)"
                          className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                        >
                          Crear Zona
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {zonas.map((z) => (
                      <div
                        key={z.id}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs font-bold text-slate-900">{z.nombre}</h4>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[9px] font-semibold ${
                                z.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {z.activo ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                          {z.descripcion && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{z.descripcion}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: NOTIFICACIONES */}
              {activeTab === 'notificaciones' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Notificaciones de Registros y Eventos
                    </span>
                    {notificaciones.some((n) => !n.leida) && (
                      <button
                        onClick={handleMarkAllRead}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition"
                      >
                        <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
                        <span>Marcar todas como leídas</span>
                      </button>
                    )}
                  </div>

                  {notificaciones.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No hay notificaciones registradas.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {notificaciones.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 rounded-xl border transition flex items-start justify-between ${
                            notif.leida
                              ? 'bg-white border-slate-200/80 text-slate-600'
                              : 'bg-indigo-50/50 border-indigo-200 text-indigo-950 font-medium'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                notif.leida ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white'
                              }`}
                            >
                              <Bell className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="text-xs font-bold text-slate-900">{notif.titulo}</h4>
                                {!notif.leida && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white">
                                    NUEVA
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-1 whitespace-pre-line leading-relaxed">
                                {notif.mensaje}
                              </p>

                              {/* Direct user approval action if this is a user registration notification */}
                              {notif.usuarioRegistradoId && (
                                <div className="mt-2.5">
                                  {(() => {
                                    const u = usuarios.find((usr) => usr.id === notif.usuarioRegistradoId);
                                    if (u && !u.activo) {
                                      return (
                                        <button
                                          type="button"
                                          onClick={() => handleAprobarUsuarioDirecto(notif.usuarioRegistradoId!, notif.id)}
                                          className="inline-flex items-center px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                                        >
                                          <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                                          <span>Aprobar este Visitador</span>
                                        </button>
                                      );
                                    } else if (u && u.activo) {
                                      return (
                                        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                          ✓ Usuario aprobado y activo
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              )}

                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleDateString('es-DO', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>

                          {!notif.leida && (
                            <button
                              onClick={() => handleMarkNotifRead(notif.id)}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                              title="Marcar como leída"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
