import { api } from './api';
import { Usuario, UsuarioUpdateRequest } from '../types';
import { supabaseUsuarioService } from './supabase/supabaseUsuarioService';

const useSupabase = import.meta.env.VITE_DATA_SOURCE === 'supabase' || Boolean(import.meta.env.VITE_SUPABASE_URL);

export const usuarioService = {
  listarTodos: (): Promise<Usuario[]> => {
    if (useSupabase) return supabaseUsuarioService.listarTodos();
    return api.get<Usuario[]>('/usuarios');
  },

  obtenerPorId: (id: string | number): Promise<Usuario> => {
    if (useSupabase) return supabaseUsuarioService.obtenerPorId(id);
    return api.get<Usuario>(`/usuarios/${id}`);
  },

  actualizar: (id: string | number, data: UsuarioUpdateRequest): Promise<Usuario> => {
    if (useSupabase) return supabaseUsuarioService.actualizar(id, data);
    return api.put<Usuario>(`/usuarios/${id}`, data);
  },

  cambiarEstado: (id: string | number, activo: boolean): Promise<Usuario> => {
    if (useSupabase) return supabaseUsuarioService.cambiarEstado(id, activo);
    return api.patch<Usuario>(`/usuarios/${id}/estado?activo=${activo}`);
  },

  cambiarRol: (id: string | number, rol: 'ADMIN' | 'VISITADOR'): Promise<Usuario> => {
    if (useSupabase) return supabaseUsuarioService.cambiarRol(id, rol);
    return api.patch<Usuario>(`/usuarios/${id}/rol?rol=${rol}`);
  },
};
