import { api } from './api';
import { AuthResponse, SetupStatus, Usuario } from '../types';

export const authService = {
  checkSetupStatus: (): Promise<SetupStatus> => {
    return api.get<SetupStatus>('/auth/setup-status');
  },

  login: (correo: string, password: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/login', { correo, password });
  },

  register: (data: { nombres: string; apellidos: string; correo: string; password: string; zonaId?: number }): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/register', data);
  },

  googleLogin: (idToken: string, zonaId?: number): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/google', { idToken, zonaId });
  },

  getMe: (): Promise<Usuario> => {
    return api.get<Usuario>('/auth/me');
  },
};
