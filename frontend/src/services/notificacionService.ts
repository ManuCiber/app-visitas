import { api } from './api';
import { Notificacion } from '../types';
import { supabaseNotificacionService } from './supabase/supabaseNotificacionService';

const useSupabase = import.meta.env.VITE_DATA_SOURCE === 'supabase' || Boolean(import.meta.env.VITE_SUPABASE_URL);

export const notificacionService = {
  listarTodas: (): Promise<Notificacion[]> => {
    if (useSupabase) return supabaseNotificacionService.listarTodas();
    return api.get<Notificacion[]>('/notificaciones');
  },

  contarPendientes: (): Promise<{ pendientes: number }> => {
    if (useSupabase) return supabaseNotificacionService.contarPendientes();
    return api.get<{ pendientes: number }>('/notificaciones/pendientes-count');
  },

  marcarComoLeida: (id: number): Promise<Notificacion> => {
    if (useSupabase) return supabaseNotificacionService.marcarComoLeida(id);
    return api.patch<Notificacion>(`/notificaciones/${id}/leer`);
  },

  marcarTodasComoLeidas: (): Promise<{ message: string }> => {
    if (useSupabase) return supabaseNotificacionService.marcarTodasComoLeidas();
    return api.patch<{ message: string }>('/notificaciones/marcar-todas-leidas');
  },
};
