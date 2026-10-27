import React, { useState } from 'react';
import { X, Building2, Plus, Edit2, Trash2, MapPin, Phone } from 'lucide-react';
import { CentroMedico, CentroMedicoRequest, EstadoMedico } from '../types';

interface CentroMedicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  centros: CentroMedico[];
  onSaveCentro: (data: CentroMedicoRequest, id?: number) => Promise<void>;
  onDeleteCentro: (id: number) => Promise<void>;
}

export const CentroMedicoModal: React.FC<CentroMedicoModalProps> = ({
  isOpen,
  onClose,
  centros,
  onSaveCentro,
  onDeleteCentro,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CentroMedicoRequest>({
    nombre: '',
    direccion: '',
    telefono: '',
    ciudad: '',
    estado: 'ACTIVO',
  });
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setEditingId(null);
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      ciudad: '',
      estado: 'ACTIVO',
    });
    setError('');
    setShowForm(true);
  };

  const handleStartEdit = (centro: CentroMedico) => {
    setEditingId(centro.id);
    setFormData({
      nombre: centro.nombre,
      direccion: centro.direccion,
      telefono: centro.telefono || '',
      ciudad: centro.ciudad || '',
      estado: centro.estado,
    });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setError('El nombre del centro es obligatorio');
      return;
    }
    if (!formData.direccion.trim()) {
      setError('La dirección es obligatoria');
      return;
    }

    try {
      setSubmitting(true);
      await onSaveCentro(formData, editingId || undefined);
      setShowForm(false);
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el centro médico');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Gestión de Centros Médicos</h2>
              <p className="text-xs text-slate-500">
                Administre los hospitales, clínicas y centros de salud de la red
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {!showForm ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Centros Registrados ({centros.length})
                </span>
                <button
                  onClick={handleStartCreate}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Nuevo Centro</span>
                </button>
              </div>

              {centros.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-500">
                  No hay centros médicos registrados aún.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {centros.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between hover:border-purple-200 transition"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{c.nombre}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              c.estado === 'ACTIVO'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {c.estado}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-slate-500 mt-1 space-x-3">
                          <span className="flex items-center truncate">
                            <MapPin className="w-3 h-3 mr-1 text-slate-400 flex-shrink-0" />
                            {c.direccion} {c.ciudad ? `(${c.ciudad})` : ''}
                          </span>
                          {c.telefono && (
                            <span className="flex items-center flex-shrink-0">
                              <Phone className="w-3 h-3 mr-1 text-slate-400" />
                              {c.telefono}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          onClick={() => handleStartEdit(c)}
                          title="Editar centro"
                          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCentro(c.id)}
                          title="Eliminar centro"
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingId ? 'Editar Centro Médico' : 'Crear Nuevo Centro Médico'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Volver al listado
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre del Centro Médico <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej. Centro Médico Abel González"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Ej. Av. Abraham Lincoln 953, Piantini"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="(809) 227-2235"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    placeholder="Santo Domingo"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData({ ...formData, estado: e.target.value as EstadoMedico })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : editingId ? 'Actualizar Centro' : 'Crear Centro'}
                </button>
              </div>
            </form>
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
