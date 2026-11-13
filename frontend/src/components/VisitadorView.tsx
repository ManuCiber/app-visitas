import React, { useState } from 'react';
import {
  Stethoscope,
  Building2,
  UserPlus,
  MapPin,
  Lock,
  Award,
  Users,
  UserCheck,
  Search,
  RotateCcw,
  X,
  Phone,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  CentroMedico,
  FilterParams,
  Medico,
  MedicoStats,
  PageResponse,
  Usuario,
} from '../types';
import { MedicoTable } from './MedicoTable';
import { Pagination } from './Pagination';
import { useToast } from '../context/ToastContext';

interface VisitadorViewProps {
  usuario: Usuario | null;
  medicos: Medico[];
  stats: MedicoStats | null;
  statsLoading: boolean;
  centros: CentroMedico[];
  especialidades: string[];
  filters: FilterParams;
  onFilterChange: (newFilters: Partial<FilterParams>) => void;
  onResetFilters: () => void;
  pageData: PageResponse<Medico> | null;
  loading: boolean;
  onOpenNuevoMedico: () => void;
  onOpenCentros: () => void;
  onViewMedico: (medico: Medico) => void;
  onEditMedico: (medico: Medico) => void;
  onDeleteMedico: (medico: Medico) => void;
}

export const VisitadorView: React.FC<VisitadorViewProps> = ({
  usuario,
  medicos,
  stats,
  statsLoading,
  centros,
  especialidades,
  filters,
  onFilterChange,
  onResetFilters,
  pageData,
  loading,
  onOpenNuevoMedico,
  onOpenCentros,
  onViewMedico,
  onEditMedico,
  onDeleteMedico,
}) => {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState<'medicos' | 'centros' | 'perfil'>('medicos');
  const [centroSearch, setCentroSearch] = useState('');

  const filteredCentros = centros.filter(
    (c) =>
      c.nombre.toLowerCase().includes(centroSearch.toLowerCase()) ||
      c.direccion.toLowerCase().includes(centroSearch.toLowerCase()) ||
      (c.ciudad && c.ciudad.toLowerCase().includes(centroSearch.toLowerCase()))
  );

  const handleCopyAdminEmail = () => {
    navigator.clipboard.writeText('admin@medicare.do');
    success('Correo copiado', 'admin@medicare.do copiado al portapapeles');
  };

  return (
    <div className="space-y-6">
      {/* Visitador Personalized Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xs text-white border border-white/30 uppercase tracking-wider">
                <Stethoscope className="w-3.5 h-3.5 mr-1.5" />
                Espacio de Trabajo del Visitador Médico
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/40 text-emerald-100 border border-emerald-400/30">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                Zona: {usuario?.zona?.nombre || 'General Asignada'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ¡Hola, {usuario?.nombreCompleto || 'Visitador'}!
            </h1>
            <p className="text-sm text-emerald-50 leading-relaxed max-w-2xl">
              Aquí gestionas tu cartera exclusiva de médicos y consultas los centros de salud de tu zona.
              Tus registros están aislados y protegidos bajo tu cuenta.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-100 font-medium">
              <Lock className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <span>
                Acceso exclusivo a tu cartera. Si necesitas cambio de zona o modificaciones de centros,{' '}
                <strong className="underline underline-offset-2">consúltaselo al Administrador General</strong>.
              </span>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onOpenNuevoMedico}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-xs font-bold text-emerald-900 bg-white hover:bg-emerald-50 shadow-md transition transform active:scale-95"
            >
              <UserPlus className="w-4 h-4 mr-2 text-emerald-600" />
              <span>+ Registrar Médico en mi Cartera</span>
            </button>
            <button
              onClick={onOpenCentros}
              className="inline-flex items-center justify-center px-4 py-3 rounded-xl text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-xs transition"
            >
              <Building2 className="w-4 h-4 mr-2" />
              <span>Ver Centros de Salud</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visitador Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Mis Médicos */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mis Médicos</p>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-slate-900">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded" />
                  ) : (
                    stats?.totalMedicos ?? medicos.length
                  )}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                  En mi cartera
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 2: Médicos Activos */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Listos para Visita</p>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-slate-900">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded" />
                  ) : (
                    stats?.medicosActivos ?? 0
                  )}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                  Activos
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 3: Especialidades */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Especialidades</p>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-slate-900">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded" />
                  ) : (
                    stats?.totalEspecialidades ?? especialidades.length
                  )}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-indigo-50 text-indigo-700 border-indigo-200">
                  En catálogo
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 4: Centros de Salud */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Centros en Red</p>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-slate-900">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded" />
                  ) : (
                    centros.length
                  )}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-teal-50 text-teal-700 border-teal-200">
                  Para visitas
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation for Visitador */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('medicos')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'medicos'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Mis Médicos Asignados ({pageData?.totalElements ?? medicos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('centros')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'centros'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Centros de Salud en mi Zona ({centros.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('perfil')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'perfil'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Mi Perfil & Soporte con Admin</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MIS MÉDICOS */}
      {activeTab === 'medicos' && (
        <div className="space-y-4">
          {/* Focused Visitador Filter Bar (NO admin filters) */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => onFilterChange({ search: e.target.value, page: 0 })}
                  placeholder="Buscar en mis médicos por nombre, exequátur o cédula..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
                {filters.search && (
                  <button
                    onClick={() => onFilterChange({ search: '', page: 0 })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Specialty Filter */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <div className="w-full sm:w-auto min-w-[170px]">
                  <select
                    value={filters.especialidad || ''}
                    onChange={(e) => onFilterChange({ especialidad: e.target.value, page: 0 })}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="">Todas las especialidades</option>
                    {especialidades.map((esp) => (
                      <option key={esp} value={esp}>
                        {esp}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Center Filter */}
                <div className="w-full sm:w-auto min-w-[170px]">
                  <select
                    value={filters.centroId ? String(filters.centroId) : ''}
                    onChange={(e) =>
                      onFilterChange({
                        centroId: e.target.value ? Number(e.target.value) : undefined,
                        page: 0,
                      })
                    }
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="">Todos los centros</option>
                    {centros.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset button */}
                {(filters.search || filters.especialidad || filters.centroId || filters.estado) && (
                  <button
                    onClick={onResetFilters}
                    title="Restablecer filtros"
                    className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Doctor Table */}
          <MedicoTable
            medicos={medicos}
            loading={loading}
            isAdmin={false}
            onView={onViewMedico}
            onEdit={onEditMedico}
            onDelete={onDeleteMedico}
            onOpenNuevoMedico={onOpenNuevoMedico}
          />

          {/* Pagination */}
          <Pagination
            pageData={pageData}
            currentPage={filters.page || 0}
            pageSize={filters.size || 10}
            onPageChange={(page) => onFilterChange({ page })}
            onPageSizeChange={(size) => onFilterChange({ size, page: 0 })}
          />
        </div>
      )}

      {/* TAB 2: CENTROS DE SALUD */}
      {activeTab === 'centros' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Catálogo de Centros Médicos en tu Zona
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Consulta los hospitales y clínicas de la red para planificar tus rutas y vincularlos a tus médicos.
              </p>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={centroSearch}
                onChange={(e) => setCentroSearch(e.target.value)}
                placeholder="Buscar clínica o dirección..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Notice: Shared catalog */}
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                <strong>Catálogo compartido de la red:</strong> Solo el Administrador General puede agregar, editar o
                eliminar centros de salud. Si necesitas dar de alta un nuevo hospital, contáctalo directamente.
              </span>
            </div>
          </div>

          {/* Centers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCentros.map((centro) => (
              <div
                key={centro.id}
                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-full">
                      {centro.ciudad || 'Centro de Salud'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-3">{centro.nombre}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>
                      {centro.direccion}
                      {centro.ciudad ? `, ${centro.ciudad}` : ''}
                    </span>
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {centro.telefono || 'Sin teléfono'}
                  </span>
                  <button
                    onClick={() => {
                      onFilterChange({ centroId: Number(centro.id), page: 0 });
                      setActiveTab('medicos');
                    }}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    Ver mis médicos aquí →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MI PERFIL Y SOPORTE CON EL ADMIN */}
      {activeTab === 'perfil' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: Perfil */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                {usuario?.nombres?.[0]}
                {usuario?.apellidos?.[0]}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{usuario?.nombreCompleto}</h3>
                <p className="text-xs text-slate-500">{usuario?.correo}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Rol en el Sistema:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  🩺 VISITADOR MÉDICO
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Zona Geográfica Asignada:</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {usuario?.zona?.nombre || 'General'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Estado de la Cuenta:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {usuario?.activo ? 'Activa y Autorizada' : 'Pendiente'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-medium">Aislamiento de Cartera:</span>
                <span className="font-semibold text-slate-700">Estricto por Usuario</span>
              </div>
            </div>
          </div>

          {/* Card: Soporte Administrativo */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Lock className="w-3 h-3 mr-1" />
                Administración Central
              </div>
              <h3 className="text-lg font-bold">¿Necesitas cambios en tu cuenta?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Como Visitador Médico, tu acceso está optimizado para la gestión directa de médicos y visitas.
                Las siguientes acciones corresponden exclusivamente al <strong>Administrador General</strong>:
              </p>

              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside pt-1">
                <li>Cambio o ampliación de tu zona geográfica asignada.</li>
                <li>Alta, baja o corrección de centros médicos compartidos.</li>
                <li>Reasignación de médicos entre distintos visitadores.</li>
                <li>Modificación de privilegios o roles de acceso.</li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs">
                <p className="text-slate-400">Canal de Soporte:</p>
                <p className="font-semibold text-emerald-400">Administrador General MediCare</p>
              </div>
              <button
                onClick={handleCopyAdminEmail}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition"
              >
                Copiar Correo del Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
