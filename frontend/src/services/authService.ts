import { api } from './api';
import { AuthResponse, SetupStatus, Usuario } from '../types';
import { supabaseAuthService } from './supabase/supabaseAuthService';

const useSupabase = import.meta.env.VITE_DATA_SOURCE === 'supabase' || Boolean(import.meta.env.VITE_SUPABASE_URL);

export const authService = {
  checkSetupStatus: (): Promise<SetupStatus> => {
    if (useSupabase) return supabaseAuthService.checkSetupStatus();
    return api.get<SetupStatus>('/auth/setup-status');
  },

  login: (correo: string, password: string): Promise<AuthResponse> => {
    if (useSupabase) return supabaseAuthService.login(correo, password);
    return api.post<AuthResponse>('/auth/login', { correo, password });
  },

  register: (data: {
    nombres: string;
    apellidos: string;
    correo: string;
    password: string;
    zonaId?: number;
  }): Promise<AuthResponse> => {
    if (useSupabase) return supabaseAuthService.register(data);
    return api.post<AuthResponse>('/auth/register', data);
  },

  googleLogin: (idToken: string, zonaId?: number): Promise<AuthResponse> => {
    if (useSupabase) return supabaseAuthService.googleLogin(idToken, zonaId);
    return api.post<AuthResponse>('/auth/google', { idToken, zonaId });
  },

  getMe: (): Promise<Usuario> => {
    if (useSupabase) return supabaseAuthService.getMe();
    return api.get<Usuario>('/auth/me');
  },

  logout: async (): Promise<void> => {
    if (useSupabase) {
      await supabaseAuthService.logout();
    }
  },

  solicitarRecuperacionPassword: (correo: string): Promise<void> => {
    if (useSupabase) return supabaseAuthService.solicitarRecuperacionPassword(correo);
    return api.post<void>('/auth/forgot-password', { correo });
  },

  actualizarPassword: (nuevaPassword: string): Promise<void> => {
    if (useSupabase) return supabaseAuthService.actualizarPassword(nuevaPassword);
    return api.post<void>('/auth/reset-password', { password: nuevaPassword });
  },
};
