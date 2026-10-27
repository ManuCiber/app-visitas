import { api } from './api';
import { Notificacion } from '../types';

export const notificacionService = {
  listarTodas: (): Promise<Notificacion[]> => {
    return api.get<Notificacion[]>('/notificaciones');
  },

  contarPendientes: (): Promise<{ pendientes: number }> => {
    return api.get<{ pendientes: number }>('/notificaciones/pendientes-count');
  },

  marcarComoLeida: (id: number): Promise<Notificacion> => {
    return api.patch<Notificacion>(`/notificaciones/${id}/leer`);
  },

  marcarTodasComoLeidas: (): Promise<{ message: string }> => {
    return api.patch<{ message: string }>('/notificaciones/marcar-todas-leidas');
  },
};
