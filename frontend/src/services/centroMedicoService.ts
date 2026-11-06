import { api } from './api';
import { CentroMedico, CentroMedicoRequest } from '../types';
import { supabaseCentroMedicoService } from './supabase/supabaseCentroMedicoService';

const useSupabase = import.meta.env.VITE_DATA_SOURCE === 'supabase' || Boolean(import.meta.env.VITE_SUPABASE_URL);

export const centroMedicoService = {
  listarTodos: (soloActivos: boolean = false): Promise<CentroMedico[]> => {
    if (useSupabase) return supabaseCentroMedicoService.listarTodos(soloActivos);
    return api.get<CentroMedico[]>(`/centros-medicos${soloActivos ? '?soloActivos=true' : ''}`);
  },

  obtenerPorId: (id: number): Promise<CentroMedico> => {
    if (useSupabase) return supabaseCentroMedicoService.obtenerPorId(id);
    return api.get<CentroMedico>(`/centros-medicos/${id}`);
  },

  crear: (data: CentroMedicoRequest): Promise<CentroMedico> => {
    if (useSupabase) return supabaseCentroMedicoService.crear(data);
    return api.post<CentroMedico>('/centros-medicos', data);
  },

  crearOReutilizar: (data: CentroMedicoRequest): Promise<CentroMedico> => {
    if (useSupabase) return supabaseCentroMedicoService.crearOReutilizar(data);
    return api.post<CentroMedico>('/centros-medicos/reutilizar', data);
  },

  actualizar: (id: number, data: CentroMedicoRequest): Promise<CentroMedico> => {
    if (useSupabase) return supabaseCentroMedicoService.actualizar(id, data);
    return api.put<CentroMedico>(`/centros-medicos/${id}`, data);
  },

  eliminar: (id: number): Promise<void> => {
    if (useSupabase) return supabaseCentroMedicoService.eliminar(id);
    return api.delete<void>(`/centros-medicos/${id}`);
  },
};
