import { api } from './api';
import { FilterParams, Medico, MedicoRequest, MedicoStats, PageResponse } from '../types';
import { supabaseMedicoService } from './supabase/supabaseMedicoService';

const useSupabase = import.meta.env.VITE_DATA_SOURCE === 'supabase' || Boolean(import.meta.env.VITE_SUPABASE_URL);

export const medicoService = {
  listar: (params: FilterParams): Promise<PageResponse<Medico>> => {
    if (useSupabase) return supabaseMedicoService.listar(params);

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
    if (useSupabase) return supabaseMedicoService.obtenerPorId(id);
    return api.get<Medico>(`/medicos/${id}`);
  },

  crear: (data: MedicoRequest): Promise<Medico> => {
    if (useSupabase) return supabaseMedicoService.crear(data);
    return api.post<Medico>('/medicos', data);
  },

  actualizar: (id: number, data: MedicoRequest): Promise<Medico> => {
    if (useSupabase) return supabaseMedicoService.actualizar(id, data);
    return api.put<Medico>(`/medicos/${id}`, data);
  },

  eliminar: (id: number): Promise<void> => {
    if (useSupabase) return supabaseMedicoService.eliminar(id);
    return api.delete<void>(`/medicos/${id}`);
  },

  obtenerEspecialidades: (): Promise<string[]> => {
    if (useSupabase) return supabaseMedicoService.obtenerEspecialidades();
    return api.get<string[]>('/medicos/especialidades');
  },

  obtenerEstadisticas: (): Promise<MedicoStats> => {
    if (useSupabase) return supabaseMedicoService.obtenerEstadisticas();
    return api.get<MedicoStats>('/medicos/estadisticas');
  },
};
