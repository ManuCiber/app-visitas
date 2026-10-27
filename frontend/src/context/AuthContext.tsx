import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthResponse, Usuario } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVisitador: boolean;
  adminExists: boolean;
  checkingSetup: boolean;
  refreshSetupStatus: () => Promise<boolean>;
  login: (correo: string, password: string) => Promise<void>;
  register: (data: { nombres: string; apellidos: string; correo: string; password: string; zonaId?: number }) => Promise<AuthResponse>;
  loginWithGoogle: (idToken: string, zonaId?: number) => Promise<AuthResponse>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('medicare_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('medicare_token');
  });

  const [adminExists, setAdminExists] = useState<boolean>(true);
  const [checkingSetup, setCheckingSetup] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem('medicare_token');
    localStorage.removeItem('medicare_user');
    setToken(null);
    setUsuario(null);
  }, []);

  const refreshSetupStatus = useCallback(async (): Promise<boolean> => {
    try {
      setCheckingSetup(true);
      const status = await authService.checkSetupStatus();
      setAdminExists(status.adminExists);
      return status.adminExists;
    } catch {
      // Si falla la consulta inicial asumimos adminExists true para no bloquear
      return true;
    } finally {
      setCheckingSetup(false);
    }
  }, []);

  useEffect(() => {
    refreshSetupStatus();
  }, [refreshSetupStatus]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  const saveAuth = (newToken: string, newUsuario: Usuario) => {
    localStorage.setItem('medicare_token', newToken);
    localStorage.setItem('medicare_user', JSON.stringify(newUsuario));
    setToken(newToken);
    setUsuario(newUsuario);
  };

  const login = async (correo: string, password: string) => {
    const res = await authService.login(correo, password);
    if (res.token) {
      saveAuth(res.token, res.usuario);
    }
  };

  const register = async (data: {
    nombres: string;
    apellidos: string;
    correo: string;
    password: string;
    zonaId?: number;
  }): Promise<AuthResponse> => {
    const res = await authService.register(data);
    if (res.token) {
      // Administrador inicial creado y activado
      saveAuth(res.token, res.usuario);
      setAdminExists(true);
    }
    return res;
  };

  const loginWithGoogle = async (idToken: string, zonaId?: number): Promise<AuthResponse> => {
    const res = await authService.googleLogin(idToken, zonaId);
    if (res.token) {
      saveAuth(res.token, res.usuario);
      setAdminExists(true);
    }
    return res;
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const u = await authService.getMe();
      setUsuario(u);
      localStorage.setItem('medicare_user', JSON.stringify(u));
    } catch {
      logout();
    }
  };

  const isAuthenticated = Boolean(token && usuario);
  const isAdmin = usuario?.rol === 'ADMIN';
  const isVisitador = usuario?.rol === 'VISITADOR';

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        isAuthenticated,
        isAdmin,
        isVisitador,
        adminExists,
        checkingSetup,
        refreshSetupStatus,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
