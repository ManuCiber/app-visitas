import React from 'react';
import { Search, RotateCcw, X } from 'lucide-react';
import { CentroMedico, EstadoMedico, FilterParams, Usuario } from '../types';

interface FilterBarProps {
  filters: FilterParams;
  onFilterChange: (newFilters: Partial<FilterParams>) => void;
  onResetFilters: () => void;
  especialidades: string[];
  centros: CentroMedico[];
  visitadores?: Usuario[];
  isAdmin?: boolean;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  especialidades,
  centros,
  visitadores = [],
  isAdmin = false,
  totalResults,
}) => {
  const hasActiveFilters = Boolean(
    filters.search || filters.especialidad || filters.estado || filters.centroId || filters.visitadorId
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 0 })}
            placeholder="Buscar por médico, cédula o exequátur..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
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

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Admin only: Filter by Visitador */}
          {isAdmin && visitadores.length > 0 && (
            <div className="w-full sm:w-auto min-w-[170px]">
              <select
                value={filters.visitadorId || ''}
                onChange={(e) =>
                  onFilterChange({
                    visitadorId: e.target.value ? Number(e.target.value) : '',
                    page: 0,
                  })
                }
                className="w-full py-2.5 px-3 bg-purple-50/60 border border-purple-200 rounded-lg text-sm text-purple-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition cursor-pointer"
              >
                <option value="">Todos los visitadores</option>
                {visitadores.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nombreCompleto} ({v.zona?.nombre || 'Sin zona'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Especialidad */}
          <div className="w-full sm:w-auto min-w-[160px]">
            <select
              value={filters.especialidad || ''}
              onChange={(e) => onFilterChange({ especialidad: e.target.value, page: 0 })}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
            >
              <option value="">Todas las especialidades</option>
              {especialidades.map((esp) => (
                <option key={esp} value={esp}>
                  {esp}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div className="w-full sm:w-auto min-w-[130px]">
            <select
              value={filters.estado || ''}
              onChange={(e) =>
                onFilterChange({
                  estado: (e.target.value as EstadoMedico) || '',
                  page: 0,
                })
              }
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVO">Activos</option>
              <option value="INACTIVO">Inactivos</option>
            </select>
          </div>

          {/* Centro Médico */}
          <div className="w-full sm:w-auto min-w-[170px]">
            <select
              value={filters.centroId || ''}
              onChange={(e) =>
                onFilterChange({
                  centroId: e.target.value ? Number(e.target.value) : '',
                  page: 0,
                })
              }
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
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
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              title="Restablecer filtros"
              className="inline-flex items-center px-3 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter summary tags */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Encontrados: <strong className="text-slate-800">{totalResults}</strong> médico
          {totalResults === 1 ? '' : 's'}
        </span>
        {hasActiveFilters && (
          <span className="text-blue-600 font-medium">Filtros aplicados actualmente</span>
        )}
      </div>
    </div>
  );
};
