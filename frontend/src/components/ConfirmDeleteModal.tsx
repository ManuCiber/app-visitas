import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Medico } from '../types';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  medico: Medico | null;
  onConfirm: (id: number) => Promise<void>;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  medico,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !medico) return null;

  const handleConfirm = async () => {
    try {
      setDeleting(true);
      await onConfirm(medico.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 text-center">
            ¿Confirmar eliminación del médico?
          </h3>

          <p className="text-sm text-slate-500 text-center mt-2">
            Esta acción eliminará de forma permanente al médico{' '}
            <strong className="text-slate-800">
              Dr(a). {medico.nombreCompleto || `${medico.nombres} ${medico.apellidos}`}
            </strong>{' '}
            (Cédula: <span className="font-mono">{medico.cedula}</span>).
          </p>

          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-800">
            <strong>Nota:</strong> Sus asociaciones con los centros médicos se desvincularán
            automáticamente sin afectar la existencia de los centros.
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={deleting}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={deleting}
              className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-500/30 transition disabled:opacity-50 flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              <span>{deleting ? 'Eliminando...' : 'Sí, eliminar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
