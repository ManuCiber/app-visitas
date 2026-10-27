import { api } from './api';
import { FilterParams, Medico, MedicoRequest, MedicoStats, PageResponse } from '../types';

export const medicoService = {
  listar: (params: FilterParams): Promise<PageResponse<Medico>> => {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortDir) query.append('sortDir', params.sortDir);
    if (params.search && params.search.trim()) query.append('search', params.search.trim());
    if (params.especialidad && params.especialidad.trim()) query.append('especialidad', params.especialidad.trim());
    if (params.estado && params.estado.trim()) query.append('estado', params.estado.trim());
    if (params.centroId) query.append('centroId', params.centroId.toString());
    if (params.visitadorId) query.append('visitadorId', params.visitadorId.toString());

    return api.get<PageResponse<Medico>>(`/medicos?${query.toString()}`);
  },

  obtenerPorId: (id: number): Promise<Medico> => {
    return api.get<Medico>(`/medicos/${id}`);
  },

  crear: (data: MedicoRequest): Promise<Medico> => {
    return api.post<Medico>('/medicos', data);
  },

  actualizar: (id: number, data: MedicoRequest): Promise<Medico> => {
    return api.put<Medico>(`/medicos/${id}`, data);
  },

  eliminar: (id: number): Promise<void> => {
    return api.delete<void>(`/medicos/${id}`);
  },

  obtenerEspecialidades: (): Promise<string[]> => {
    return api.get<string[]>('/medicos/especialidades');
  },

  obtenerEstadisticas: (): Promise<MedicoStats> => {
    return api.get<MedicoStats>('/medicos/estadisticas');
  },
};
