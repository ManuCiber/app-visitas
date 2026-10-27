import { api } from './api';
import { CentroMedico, CentroMedicoRequest } from '../types';

export const centroMedicoService = {
  listarTodos: (soloActivos: boolean = false): Promise<CentroMedico[]> => {
    return api.get<CentroMedico[]>(`/centros-medicos${soloActivos ? '?soloActivos=true' : ''}`);
  },

  obtenerPorId: (id: number): Promise<CentroMedico> => {
    return api.get<CentroMedico>(`/centros-medicos/${id}`);
  },

  crear: (data: CentroMedicoRequest): Promise<CentroMedico> => {
    return api.post<CentroMedico>('/centros-medicos', data);
  },

  crearOReutilizar: (data: CentroMedicoRequest): Promise<CentroMedico> => {
    return api.post<CentroMedico>('/centros-medicos/reutilizar', data);
  },

  actualizar: (id: number, data: CentroMedicoRequest): Promise<CentroMedico> => {
    return api.put<CentroMedico>(`/centros-medicos/${id}`, data);
  },

  eliminar: (id: number): Promise<void> => {
    return api.delete<void>(`/centros-medicos/${id}`);
  },
};
