import React from 'react';
import { Eye, Edit2, Trash2, Phone, MapPin, Building2, AlertCircle, User } from 'lucide-react';
import { Medico } from '../types';

interface MedicoTableProps {
  medicos: Medico[];
  loading: boolean;
  isAdmin?: boolean;
  onView: (medico: Medico) => void;
  onEdit: (medico: Medico) => void;
  onDelete: (medico: Medico) => void;
  onOpenNuevoMedico: () => void;
}

const getSpecialtyBadgeStyle = (especialidad: string) => {
  const esp = especialidad.toLowerCase();
  if (esp.includes('cardio')) return 'bg-rose-50 text-rose-700 border-rose-200';
  if (esp.includes('pedia')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (esp.includes('derma')) return 'bg-teal-50 text-teal-700 border-teal-200';
  if (esp.includes('gineco')) return 'bg-pink-50 text-pink-700 border-pink-200';
  if (esp.includes('orto') || esp.includes('trauma')) return 'bg-orange-50 text-orange-700 border-orange-200';
  if (esp.includes('neuro')) return 'bg-violet-50 text-violet-700 border-violet-200';
  return 'bg-blue-50 text-blue-700 border-blue-200';
};

const getInitials = (nombres: string, apellidos: string) => {
  const n = nombres?.trim() ? nombres.trim()[0] : '';
  const a = apellidos?.trim() ? apellidos.trim()[0] : '';
  return `${n}${a}`.toUpperCase() || 'DR';
};

export const MedicoTable: React.FC<MedicoTableProps> = ({
  medicos,
  loading,
  isAdmin = false,
  onView,
  onEdit,
  onDelete,
  onOpenNuevoMedico,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent"></div>
          <p className="mt-3 text-sm font-medium text-slate-500">Cargando directorio de médicos...</p>
        </div>
      </div>
    );
  }

  if (medicos.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No se encontraron médicos</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
          No hay registros que coincidan con los criterios de búsqueda o filtros seleccionados.
        </p>
        <button
          onClick={onOpenNuevoMedico}
          className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
        >
          + Registrar Nuevo Médico
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/80">
            <tr>
              <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Médico
              </th>
              {isAdmin && (
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  Visitador Responsable
                </th>
              )}
              <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cédula / Exequátur
              </th>
              <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Especialidad
              </th>
              <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Centros Asociados
              </th>
              <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Contacto
              </th>
              <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {medicos.map((medico) => {
              const initials = getInitials(medico.nombres, medico.apellidos);
              const badgeStyle = getSpecialtyBadgeStyle(medico.especialidad);
              const isActivo = medico.estado === 'ACTIVO';

              return (
                <tr key={medico.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Doctor Info */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                        {initials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          Dr(a). {medico.nombreCompleto || `${medico.nombres} ${medico.apellidos}`}
                        </div>
                        <div className="text-xs text-slate-500">{medico.correo}</div>
                      </div>
                    </div>
                  </td>

                  {/* Admin Only: Visitador Responsable */}
                  {isAdmin && (
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                        <span className="text-xs font-bold text-slate-800">
                          {medico.visitadorNombre || 'Sin asignar'}
                        </span>
                      </div>
                      {medico.zonaNombre && (
                        <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 mt-0.5 border border-purple-200">
                          {medico.zonaNombre}
                        </span>
                      )}
                    </td>
                  )}

                  {/* Identification */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-xs font-medium text-slate-900 font-mono">
                      {medico.cedula}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      <span className="text-slate-400">Exeq:</span> {medico.exequatur}
                    </div>
                  </td>

                  {/* Specialty */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badgeStyle}`}
                    >
                      {medico.especialidad}
                    </span>
                  </td>

                  {/* Medical Centers */}
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                      {medico.centrosMedicos && medico.centrosMedicos.length > 0 ? (
                        medico.centrosMedicos.map((cm) => (
                          <span
                            key={cm.id}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                            title={`${cm.nombre} - ${cm.direccion}`}
                          >
                            <Building2 className="w-3 h-3 mr-1 text-slate-400" />
                            <span className="truncate max-w-[140px]">{cm.nombre}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Sin centros asignados</span>
                      )}
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center text-xs text-slate-700">
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
                      <span>{medico.telefono}</span>
                    </div>
                    <div className="flex items-center text-[11px] text-slate-500 mt-1 max-w-[180px] truncate" title={medico.direccionProfesional}>
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{medico.direccionProfesional}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        isActivo
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                          isActivo ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                      ></span>
                      {isActivo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 whitespace-nowrap text-right text-xs font-medium">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onView(medico)}
                        title="Ver detalle"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(medico)}
                        title="Editar médico"
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(medico)}
                        title="Eliminar médico"
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
