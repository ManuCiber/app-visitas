import { api } from './api';
import { Usuario, UsuarioUpdateRequest } from '../types';

export const usuarioService = {
  listarTodos: (): Promise<Usuario[]> => {
    return api.get<Usuario[]>('/usuarios');
  },

  obtenerPorId: (id: number): Promise<Usuario> => {
    return api.get<Usuario>(`/usuarios/${id}`);
  },

  actualizar: (id: number, data: UsuarioUpdateRequest): Promise<Usuario> => {
    return api.put<Usuario>(`/usuarios/${id}`, data);
  },

  cambiarEstado: (id: number, activo: boolean): Promise<Usuario> => {
    return api.patch<Usuario>(`/usuarios/${id}/estado?activo=${activo}`);
  },

  cambiarRol: (id: number, rol: 'ADMIN' | 'VISITADOR'): Promise<Usuario> => {
    return api.patch<Usuario>(`/usuarios/${id}/rol?rol=${rol}`);
  },
};
