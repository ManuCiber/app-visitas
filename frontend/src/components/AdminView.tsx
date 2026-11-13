import React, { useState } from 'react';
import {
  Crown,
  Shield,
  Users,
  Building2,
  MapPin,
  Bell,
  UserPlus,
  ArrowRight,
  UserCheck,
  Award,
  Search,
} from 'lucide-react';
import {
  CentroMedico,
  FilterParams,
  Medico,
  MedicoStats,
  PageResponse,
  Usuario,
} from '../types';
import { FilterBar } from './FilterBar';
import { MedicoTable } from './MedicoTable';
import { Pagination } from './Pagination';

interface AdminViewProps {
  usuario: Usuario | null;
  medicos: Medico[];
  stats: MedicoStats | null;
  statsLoading: boolean;
  centros: CentroMedico[];
  especialidades: string[];
  visitadores: Usuario[];
  unreadNotifsCount: number;
  filters: FilterParams;
  onFilterChange: (newFilters: Partial<FilterParams>) => void;
  onResetFilters: () => void;
  pageData: PageResponse<Medico> | null;
  loading: boolean;
  onOpenNuevoMedico: () => void;
  onOpenCentros: () => void;
  onOpenAdminPanel: (tab?: 'usuarios' | 'zonas' | 'notificaciones') => void;
  onViewMedico: (medico: Medico) => void;
  onEditMedico: (medico: Medico) => void;
  onDeleteMedico: (medico: Medico) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  usuario,
  medicos,
  stats,
  statsLoading,
  centros,
  especialidades,
  visitadores,
  unreadNotifsCount,
  filters,
  onFilterChange,
  onResetFilters,
  pageData,
  loading,
  onOpenNuevoMedico,
  onOpenCentros,
  onOpenAdminPanel,
  onViewMedico,
  onEditMedico,
  onDeleteMedico,
}) => {
  const [adminTab, setAdminTab] = useState<'directorio' | 'visitadores' | 'centros'>('directorio');
  const [visitadorSearch, setVisitadorSearch] = useState('');

  const filteredVisitadores = visitadores.filter(
    (v) =>
      v.nombreCompleto.toLowerCase().includes(visitadorSearch.toLowerCase()) ||
      v.correo.toLowerCase().includes(visitadorSearch.toLowerCase()) ||
      (v.zona && v.zona.nombre.toLowerCase().includes(visitadorSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Pending Approvals Alert Banner */}
      {unreadNotifsCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-100">
                Acción Administrativa Requerida
              </p>
              <p className="text-sm font-semibold">
                Hay {unreadNotifsCount} solicitud(es) de nuevo visitador médico esperando tu autorización.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenAdminPanel('notificaciones')}
            className="px-4 py-2 text-xs font-bold bg-white text-rose-700 hover:bg-amber-50 rounded-xl shadow-xs transition transform active:scale-95 flex items-center space-x-1.5 flex-shrink-0"
          >
            <span>Revisar y Autorizar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Executive Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30 uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 mr-1.5 text-purple-300" />
                Panel Ejecutivo de Administración Global
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Shield className="w-3.5 h-3.5 mr-1" />
                Acceso Maestro Total
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Centro de Mando MediCare
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Bienvenido, {usuario?.nombreCompleto || 'Administrador'}. Supervisión consolidada de la red médica.
              Administra las cuentas de visitadores, autoriza nuevos registros, configura zonas geográficas y controla
              el catálogo general de centros de salud.
            </p>
          </div>

          {/* Quick Management Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenAdminPanel('usuarios')}
              className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition"
            >
              <Users className="w-4 h-4 mr-1.5" />
              <span>Visitadores y Roles</span>
            </button>
            <button
              onClick={() => onOpenAdminPanel('zonas')}
              className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-xs transition"
            >
              <MapPin className="w-4 h-4 mr-1.5 text-purple-700" />
              <span>Zonas</span>
            </button>
            <button
              onClick={onOpenCentros}
              className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition"
            >
              <Building2 className="w-4 h-4 mr-1.5" />
              <span>Centros Médicos</span>
            </button>
            <button
              onClick={onOpenNuevoMedico}
              className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
            >
              <UserPlus className="w-4 h-4 mr-1.5" />
              <span>+ Nuevo Médico</span>
            </button>
          </div>
        </div>
      </div>

      {/* Complete Executive KPI Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Médicos Global */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Red Médica Total</p>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded" />
                  ) : (
                    stats?.totalMedicos ?? medicos.length
                  )}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-blue-50 text-blue-700 border-blue-200">
                  Global
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* KPI 2: Médicos Activos */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Médicos Activos</p>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded" />
                  ) : (
                    stats?.medicosActivos ?? 0
                  )}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                  Operativos
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* KPI 3: Equipo de Visitadores */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Visitadores</p>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {visitadores.length}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-purple-50 text-purple-700 border-purple-200">
                  En equipo
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* KPI 4: Especialidades */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Especialidades</p>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded" />
                  ) : (
                    stats?.totalEspecialidades ?? especialidades.length
                  )}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-indigo-50 text-indigo-700 border-indigo-200">
                  Categorías
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* KPI 5: Centros Médicos */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Centros Médicos</p>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded" />
                  ) : (
                    centros.length
                  )}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-teal-50 text-teal-700 border-teal-200">
                  Asociados
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tabs Navigation */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setAdminTab('directorio')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
              adminTab === 'directorio'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Directorio Global de Médicos ({pageData?.totalElements ?? medicos.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('visitadores')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
              adminTab === 'visitadores'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Equipo de Visitadores Médicos ({visitadores.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('centros')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
              adminTab === 'centros'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Catálogo Maestro de Centros ({centros.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DIRECTORIO GLOBAL DE MÉDICOS */}
      {adminTab === 'directorio' && (
        <div className="space-y-4">
          <FilterBar
            filters={filters}
            onFilterChange={onFilterChange}
            onResetFilters={onResetFilters}
            especialidades={especialidades}
            centros={centros}
            visitadores={visitadores}
            isAdmin={true}
            totalResults={pageData?.totalElements || 0}
          />

          <MedicoTable
            medicos={medicos}
            loading={loading}
            isAdmin={true}
            onView={onViewMedico}
            onEdit={onEditMedico}
            onDelete={onDeleteMedico}
            onOpenNuevoMedico={onOpenNuevoMedico}
          />

          <Pagination
            pageData={pageData}
            currentPage={filters.page || 0}
            pageSize={filters.size || 10}
            onPageChange={(page) => onFilterChange({ page })}
            onPageSizeChange={(size) => onFilterChange({ size, page: 0 })}
          />
        </div>
      )}

      {/* TAB 2: EQUIPO DE VISITADORES MÉDICOS */}
      {adminTab === 'visitadores' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Supervisión del Equipo de Visitadores
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Consulta los visitadores registrados, su zona asignada y filtra sus médicos asignados.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={visitadorSearch}
                  onChange={(e) => setVisitadorSearch(e.target.value)}
                  placeholder="Buscar visitador o zona..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <button
                onClick={() => onOpenAdminPanel('usuarios')}
                className="px-3.5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition"
              >
                Gestionar Usuarios
              </button>
            </div>
          </div>

          {filteredVisitadores.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/80 p-10 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No se encontraron visitadores</p>
              <p className="text-xs text-slate-500 mt-1">
                Cuando nuevos visitadores soliciten cuenta y sean aprobados, aparecerán en este panel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVisitadores.map((vis) => (
                <div
                  key={vis.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                          {vis.nombres?.[0]}
                          {vis.apellidos?.[0]}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{vis.nombreCompleto}</h3>
                          <p className="text-xs text-slate-500">{vis.correo}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          vis.activo
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {vis.activo ? 'ACTIVO' : 'PENDIENTE'}
                      </span>
                    </div>

                    <div className="pt-2 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-600" />
                        <span>
                          Zona:{' '}
                          <strong className="text-slate-800">
                            {vis.zona ? vis.zona.nombre : 'Sin zona asignada'}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span>Rol: Visitador Médico</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        onFilterChange({ visitadorId: String(vis.id), page: 0 });
                        setAdminTab('directorio');
                      }}
                      className="text-xs font-bold text-purple-700 hover:text-purple-800 hover:underline"
                    >
                      Ver médicos asignados →
                    </button>
                    <button
                      onClick={() => onOpenAdminPanel('usuarios')}
                      className="text-xs text-slate-500 hover:text-slate-700"
                      title="Editar en Panel Admin"
                    >
                      Editar Zona
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CATÁLOGO MAESTRO DE CENTROS */}
      {adminTab === 'centros' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Catálogo Maestro de Centros Médicos
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Centros de salud compartidos disponibles para todos los visitadores y médicos de la red.
              </p>
            </div>

            <button
              onClick={onOpenCentros}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition"
            >
              + Gestionar y Agregar Centros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {centros.map((centro) => (
              <div
                key={centro.id}
                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-full">
                      {centro.ciudad || 'Hospital / Clínica'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-3">{centro.nombre}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>
                      {centro.direccion}
                      {centro.ciudad ? `, ${centro.ciudad}` : ''}
                    </span>
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{centro.telefono || 'Sin teléfono'}</span>
                  <button
                    onClick={() => {
                      onFilterChange({ centroId: Number(centro.id), page: 0 });
                      setAdminTab('directorio');
                    }}
                    className="text-xs font-bold text-purple-700 hover:underline"
                  >
                    Ver médicos aquí →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
