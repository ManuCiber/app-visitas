import React, { useState, useEffect } from 'react';
import { X, Stethoscope, Mail, Phone, MapPin, Check, Plus } from 'lucide-react';
import { CentroMedico, EstadoMedico, Medico, MedicoRequest } from '../types';
import { centroMedicoService } from '../services/centroMedicoService';

interface MedicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MedicoRequest) => Promise<void>;
  medicoToEdit: Medico | null;
  centrosDisponibles: CentroMedico[];
  especialidadesSugeridas: string[];
  onCentroCreated?: (centro: CentroMedico) => void;
}

export const MedicoModal: React.FC<MedicoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  medicoToEdit,
  centrosDisponibles,
  especialidadesSugeridas,
  onCentroCreated,
}) => {
  const [formData, setFormData] = useState<MedicoRequest>({
    nombres: '',
    apellidos: '',
    cedula: '',
    exequatur: '',
    especialidad: '',
    telefono: '',
    correo: '',
    direccionProfesional: '',
    estado: 'ACTIVO',
    observaciones: '',
    centrosMedicosIds: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Quick Inline Centro Creation State
  const [showQuickCentro, setShowQuickCentro] = useState(false);
  const [quickNombre, setQuickNombre] = useState('');
  const [quickDireccion, setQuickDireccion] = useState('');
  const [quickCiudad, setQuickCiudad] = useState('');
  const [quickTelefono, setQuickTelefono] = useState('');
  const [quickSaving, setQuickSaving] = useState(false);
  const [quickError, setQuickError] = useState('');

  useEffect(() => {
    if (medicoToEdit) {
      setFormData({
        nombres: medicoToEdit.nombres || '',
        apellidos: medicoToEdit.apellidos || '',
        cedula: medicoToEdit.cedula || '',
        exequatur: medicoToEdit.exequatur || '',
        especialidad: medicoToEdit.especialidad || '',
        telefono: medicoToEdit.telefono || '',
        correo: medicoToEdit.correo || '',
        direccionProfesional: medicoToEdit.direccionProfesional || '',
        estado: medicoToEdit.estado || 'ACTIVO',
        observaciones: medicoToEdit.observaciones || '',
        centrosMedicosIds: medicoToEdit.centrosMedicos?.map((c) => c.id) || [],
      });
    } else {
      setFormData({
        nombres: '',
        apellidos: '',
        cedula: '',
        exequatur: '',
        especialidad: '',
        telefono: '',
        correo: '',
        direccionProfesional: '',
        estado: 'ACTIVO',
        observaciones: '',
        centrosMedicosIds: [],
      });
    }
    setErrors({});
    setShowQuickCentro(false);
  }, [medicoToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombres.trim()) newErrors.nombres = 'El nombre es obligatorio';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'El apellido es obligatorio';

    const cedulaRegex = /^\d{3}-?\d{7}-?\d{1}$/;
    if (!formData.cedula.trim()) {
      newErrors.cedula = 'La cédula es obligatoria';
    } else if (!cedulaRegex.test(formData.cedula.trim())) {
      newErrors.cedula = 'Formato inválido (ejemplo: 001-1234567-8)';
    }

    if (!formData.exequatur.trim()) newErrors.exequatur = 'El exequátur es obligatorio';
    if (!formData.especialidad.trim()) newErrors.especialidad = 'La especialidad es obligatoria';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo electrónico es obligatorio';
    } else if (!emailRegex.test(formData.correo.trim())) {
      newErrors.correo = 'Ingrese un correo electrónico válido';
    }

    if (!formData.direccionProfesional.trim()) {
      newErrors.direccionProfesional = 'La dirección profesional es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await onSave(formData);
      onClose();
    } catch (err: any) {
      if (err.validationErrors) {
        setErrors(err.validationErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCentro = (centroId: number) => {
    setFormData((prev) => {
      const exists = prev.centrosMedicosIds.includes(centroId);
      const updated = exists
        ? prev.centrosMedicosIds.filter((id) => id !== centroId)
        : [...prev.centrosMedicosIds, centroId];
      return { ...prev, centrosMedicosIds: updated };
    });
  };

  const handleCreateQuickCentro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNombre.trim()) {
      setQuickError('El nombre del centro es obligatorio');
      return;
    }
    if (!quickDireccion.trim()) {
      setQuickError('La dirección es obligatoria');
      return;
    }

    try {
      setQuickSaving(true);
      setQuickError('');
      const nuevoCentro = await centroMedicoService.crearOReutilizar({
        nombre: quickNombre.trim(),
        direccion: quickDireccion.trim(),
        ciudad: quickCiudad.trim() || undefined,
        telefono: quickTelefono.trim() || undefined,
        estado: 'ACTIVO',
      });

      // Automatically select it and notify parent
      if (!formData.centrosMedicosIds.includes(nuevoCentro.id)) {
        setFormData((prev) => ({
          ...prev,
          centrosMedicosIds: [...prev.centrosMedicosIds, nuevoCentro.id],
        }));
      }

      onCentroCreated?.(nuevoCentro);
      setQuickNombre('');
      setQuickDireccion('');
      setQuickCiudad('');
      setQuickTelefono('');
      setShowQuickCentro(false);
    } catch (err: any) {
      setQuickError(err.message || 'Error al guardar centro');
    } finally {
      setQuickSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {medicoToEdit ? 'Editar Información del Médico' : 'Registrar Nuevo Médico'}
              </h2>
              <p className="text-xs text-slate-500">
                Complete los datos obligatorios marcados con asterisco (*)
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

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
            {/* Section 1: Personal Info */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Información Personal & Profesional
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    placeholder="Ej. Alejandro"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
                      errors.nombres
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  {errors.nombres && <p className="text-xs text-red-600 mt-1">{errors.nombres}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    placeholder="Ej. Pérez Morales"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
                      errors.apellidos
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  {errors.apellidos && <p className="text-xs text-red-600 mt-1">{errors.apellidos}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Cédula de Identidad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                    placeholder="001-1234567-8"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
                      errors.cedula
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  {errors.cedula && <p className="text-xs text-red-600 mt-1">{errors.cedula}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Número de Exequátur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.exequatur}
                    onChange={(e) => setFormData({ ...formData, exequatur: e.target.value })}
                    placeholder="EX-2020-1234"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
                      errors.exequatur
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  {errors.exequatur && <p className="text-xs text-red-600 mt-1">{errors.exequatur}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Especialidad Médica <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="especialidades-list"
                    value={formData.especialidad}
                    onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                    placeholder="Ej. Cardiología"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
                      errors.especialidad
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  <datalist id="especialidades-list">
                    {especialidadesSugeridas.map((esp) => (
                      <option key={esp} value={esp} />
                    ))}
                    <option value="Cardiología" />
                    <option value="Pediatría" />
                    <option value="Dermatología" />
                    <option value="Ginecología y Obstetricia" />
                    <option value="Ortopedia y Traumatología" />
                    <option value="Neurología" />
                    <option value="Medicina Interna" />
                  </datalist>
                  {errors.especialidad && (
                    <p className="text-xs text-red-600 mt-1">{errors.especialidad}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Estado en el Sistema <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({ ...formData, estado: e.target.value as EstadoMedico })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact & Address */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Contacto & Ubicación Profesional
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Teléfono de Contacto <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="(809) 555-0100"
                      className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
                        errors.telefono
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                          : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.telefono && <p className="text-xs text-red-600 mt-1">{errors.telefono}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.correo}
                      onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                      placeholder="medico@hospital.com"
                      className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
                        errors.correo
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                          : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.correo && <p className="text-xs text-red-600 mt-1">{errors.correo}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Dirección Profesional / Consultorio <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.direccionProfesional}
                      onChange={(e) =>
                        setFormData({ ...formData, direccionProfesional: e.target.value })
                      }
                      placeholder="Av. Abraham Lincoln #100, Torre Empresarial, Consultorio 301"
                      className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
                        errors.direccionProfesional
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                          : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.direccionProfesional && (
                    <p className="text-xs text-red-600 mt-1">{errors.direccionProfesional}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Many-to-Many Medical Centers Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Centros Médicos Compartidos
                </label>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-blue-600 font-medium">
                    {formData.centrosMedicosIds.length} seleccionado(s)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQuickCentro(!showQuickCentro)}
                    className="inline-flex items-center text-xs font-semibold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>{showQuickCentro ? 'Cerrar registro' : 'Registrar centro nuevo'}</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Quick Centro Registration Form */}
              {showQuickCentro && (
                <div className="mb-3 p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900">
                      Registrar o Reutilizar Centro Médico
                    </span>
                    <span className="text-[10px] text-purple-600">
                      Si el nombre ya existe, se reutilizará automáticamente
                    </span>
                  </div>

                  {quickError && (
                    <div className="text-xs text-red-600 font-medium">{quickError}</div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      required
                      value={quickNombre}
                      onChange={(e) => setQuickNombre(e.target.value)}
                      placeholder="Nombre del Centro *"
                      className="text-xs px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      required
                      value={quickDireccion}
                      onChange={(e) => setQuickDireccion(e.target.value)}
                      placeholder="Dirección *"
                      className="text-xs px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      value={quickCiudad}
                      onChange={(e) => setQuickCiudad(e.target.value)}
                      placeholder="Ciudad"
                      className="text-xs px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      value={quickTelefono}
                      onChange={(e) => setQuickTelefono(e.target.value)}
                      placeholder="Teléfono"
                      className="text-xs px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickCentro(false)}
                      className="text-xs px-2.5 py-1 text-slate-600 hover:text-slate-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={quickSaving}
                      onClick={handleCreateQuickCentro}
                      className="text-xs px-3.5 py-1 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                    >
                      {quickSaving ? 'Guardando...' : 'Guardar y Vincular'}
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-500 mb-3">
                Seleccione los centros donde este médico presta servicios:
              </p>

              {centrosDisponibles.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                  No hay centros médicos registrados aún. Puede registrarlos arriba.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1">
                  {centrosDisponibles.map((centro) => {
                    const isSelected = formData.centrosMedicosIds.includes(centro.id);
                    return (
                      <div
                        key={centro.id}
                        onClick={() => toggleCentro(centro.id)}
                        className={`flex items-start p-3 rounded-xl border cursor-pointer select-none transition-all ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-400 text-blue-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="ml-2.5 flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{centro.nombre}</p>
                          <p className="text-[11px] text-slate-500 truncate">{centro.ciudad || centro.direccion}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 4: Observations */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Observaciones Adicionales
              </label>
              <textarea
                rows={3}
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Horarios habituales, notas clínicas, etc..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/30 transition disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : medicoToEdit ? 'Guardar Cambios' : 'Registrar Médico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
