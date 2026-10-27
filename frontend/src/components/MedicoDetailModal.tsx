import React from 'react';
import { X, Building2, Phone, Mail, MapPin, Calendar, User } from 'lucide-react';
import { Medico } from '../types';

interface MedicoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  medico: Medico | null;
  onEdit: (medico: Medico) => void;
}

export const MedicoDetailModal: React.FC<MedicoDetailModalProps> = ({
  isOpen,
  onClose,
  medico,
  onEdit,
}) => {
  if (!isOpen || !medico) return null;

  const isActivo = medico.estado === 'ACTIVO';
  const initials = `${medico.nombres?.[0] || ''}${medico.apellidos?.[0] || ''}`.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Cover & Info */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white text-blue-700 font-bold text-xl flex items-center justify-center shadow-lg">
              {initials}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold">
                  Dr(a). {medico.nombreCompleto || `${medico.nombres} ${medico.apellidos}`}
                </h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isActivo ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' : 'bg-slate-400/20 text-slate-200'
                  }`}
                >
                  {isActivo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className="text-blue-100 text-sm mt-0.5 font-medium">{medico.especialidad}</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Responsible Visitador & Zone banner */}
          {medico.visitadorNombre && (
            <div className="p-3 bg-purple-50 border border-purple-200/80 rounded-xl flex items-center justify-between text-xs text-purple-900">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-purple-600" />
                <span>
                  Visitador responsable:{' '}
                  <strong className="font-semibold">{medico.visitadorNombre}</strong>{' '}
                  <span className="text-purple-600 text-[11px]">({medico.visitadorCorreo})</span>
                </span>
              </div>
              {medico.zonaNombre && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-semibold text-[10px]">
                  {medico.zonaNombre}
                </span>
              )}
            </div>
          )}

          {/* Identification Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Cédula
              </span>
              <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block">
                {medico.cedula}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Exequátur
              </span>
              <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block">
                {medico.exequatur}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                ID Registro
              </span>
              <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block">
                MED-{medico.id.toString().padStart(4, '0')}
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Datos de Contacto & Ubicación
            </h4>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-slate-700">
                <Phone className="w-4 h-4 mr-3 text-slate-400" />
                <span className="font-medium">{medico.telefono}</span>
              </div>
              <div className="flex items-center text-sm text-slate-700">
                <Mail className="w-4 h-4 mr-3 text-slate-400" />
                <a href={`mailto:${medico.correo}`} className="text-blue-600 hover:underline">
                  {medico.correo}
                </a>
              </div>
              <div className="flex items-start text-sm text-slate-700">
                <MapPin className="w-4 h-4 mr-3 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>{medico.direccionProfesional}</span>
              </div>
            </div>
          </div>

          {/* Medical Centers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Centros Médicos Donde Labora
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                {medico.centrosMedicos?.length || 0} asignado(s)
              </span>
            </div>

            {medico.centrosMedicos && medico.centrosMedicos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {medico.centrosMedicos.map((centro) => (
                  <div
                    key={centro.id}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start space-x-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{centro.nombre}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">{centro.direccion}</p>
                      {centro.ciudad && (
                        <p className="text-[10px] text-blue-600 font-medium mt-0.5">{centro.ciudad}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No tiene centros médicos asignados.</p>
            )}
          </div>

          {/* Observations */}
          {medico.observaciones && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Observaciones
              </h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line leading-relaxed">
                {medico.observaciones}
              </p>
            </div>
          )}

          {/* Timestamps */}
          {medico.createdAt && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                Registrado:{' '}
                {new Date(medico.createdAt).toLocaleDateString('es-DO', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              {medico.updatedAt && (
                <span>
                  Última actualización:{' '}
                  {new Date(medico.updatedAt).toLocaleDateString('es-DO', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(medico);
            }}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            Editar Médico
          </button>
        </div>
      </div>
    </div>
  );
};
