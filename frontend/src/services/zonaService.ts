import { api } from './api';
import { Zona } from '../types';
import { supabaseZonaService } from './supabase/supabaseZonaService';

const useSupabase = import.meta.env.VITE_DATA_SOURCE === 'supabase' || Boolean(import.meta.env.VITE_SUPABASE_URL);

export const zonaService = {
  listarTodas: (): Promise<Zona[]> => {
    if (useSupabase) return supabaseZonaService.listarTodas();
    return api.get<Zona[]>('/zonas');
  },

  listarActivas: (): Promise<Zona[]> => {
    if (useSupabase) return supabaseZonaService.listarActivas();
    return api.get<Zona[]>('/zonas/activas');
  },

  obtenerPorId: (id: number): Promise<Zona> => {
    if (useSupabase) return supabaseZonaService.obtenerPorId(id);
    return api.get<Zona>(`/zonas/${id}`);
  },

  crear: (data: { nombre: string; descripcion?: string; activo?: boolean }): Promise<Zona> => {
    if (useSupabase) return supabaseZonaService.crear(data);
    return api.post<Zona>('/zonas', data);
  },

  actualizar: (id: number, data: { nombre: string; descripcion?: string; activo?: boolean }): Promise<Zona> => {
    if (useSupabase) return supabaseZonaService.actualizar(id, data);
    return api.put<Zona>(`/zonas/${id}`, data);
  },

  eliminar: (id: number): Promise<void> => {
    if (useSupabase) return supabaseZonaService.eliminar(id);
    return api.delete<void>(`/zonas/${id}`);
  },
};
