import { api } from './api';
import { Zona } from '../types';

export const zonaService = {
  listarTodas: (): Promise<Zona[]> => {
    return api.get<Zona[]>('/zonas');
  },

  listarActivas: (): Promise<Zona[]> => {
    return api.get<Zona[]>('/zonas/activas');
  },

  obtenerPorId: (id: number): Promise<Zona> => {
    return api.get<Zona>(`/zonas/${id}`);
  },

  crear: (data: { nombre: string; descripcion?: string; activo?: boolean }): Promise<Zona> => {
    return api.post<Zona>('/zonas', data);
  },

  actualizar: (id: number, data: { nombre: string; descripcion?: string; activo?: boolean }): Promise<Zona> => {
    return api.put<Zona>(`/zonas/${id}`, data);
  },

  eliminar: (id: number): Promise<void> => {
    return api.delete<void>(`/zonas/${id}`);
  },
};
