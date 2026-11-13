import { supabase } from '../../lib/supabase';
import { AuthResponse, SetupStatus, Usuario } from '../../types';

export const supabaseAuthService = {
  checkSetupStatus: async (): Promise<SetupStatus> => {
    try {
      // Intentar primero a través de la función RPC segura (habilitada para rol anon)
      const { data: rpcData, error: rpcError } = await supabase.rpc('check_setup_status');
      if (!rpcError && rpcData) {
        const payload = typeof rpcData === 'string' ? JSON.parse(rpcData) : rpcData;
        return {
          adminExists: Boolean(payload.adminExists),
          totalUsuarios: Number(payload.totalUsuarios ?? 0),
        };
      }

      // Respaldo secundario mediante consulta directa a perfiles
      const { count, error } = await supabase
        .from('perfiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.warn('Error al verificar setup de perfiles en Supabase:', error.message);
        return { adminExists: false, totalUsuarios: 0 };
      }

      const total = count ?? 0;
      return {
        adminExists: total > 0,
        totalUsuarios: total,
      };
    } catch (err: any) {
      console.warn('Fallo al consultar setup status en Supabase:', err?.message);
      return { adminExists: false, totalUsuarios: 0 };
    }
  },

  login: async (correo: string, password: string): Promise<AuthResponse> => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: correo,
      password,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Credenciales inválidas');
    }

    // Obtener perfil público y verificar si la cuenta está habilitada
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('*, zona:zonas(*)')
      .eq('id', authData.user.id)
      .single();

    if (perfilError || !perfil) {
      await supabase.auth.signOut();
      throw new Error('No se encontró el perfil del usuario');
    }

    if (!perfil.habilitado) {
      await supabase.auth.signOut();
      throw new Error('Tu cuenta está registrada pero se encuentra pendiente de aprobación por el Administrador.');
    }

    const usuario: Usuario = {
      id: perfil.id,
      nombres: perfil.nombre.split(' ')[0] || perfil.nombre,
      apellidos: perfil.nombre.split(' ').slice(1).join(' ') || '',
      nombreCompleto: perfil.nombre,
      correo: perfil.correo,
      rol: perfil.rol,
      zona: perfil.zona
        ? {
            id: perfil.zona.id,
            nombre: perfil.zona.nombre,
            descripcion: perfil.zona.descripcion,
            activo: perfil.zona.activa,
          }
        : undefined,
      activo: perfil.habilitado,
      authProvider: 'LOCAL',
      createdAt: perfil.created_at,
    };

    return {
      token: authData.session?.access_token || '',
      tokenType: 'Bearer',
      usuario,
      mensaje: 'Inicio de sesión exitoso',
    };
  },

  register: async (data: {
    nombres: string;
    apellidos: string;
    correo: string;
    password: string;
    zonaId?: number;
  }): Promise<AuthResponse> => {
    const nombreCompleto = `${data.nombres} ${data.apellidos}`.trim();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.correo,
      password: data.password,
      options: {
        data: {
          nombre: nombreCompleto,
          zonaId: data.zonaId,
        },
      },
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Error al registrar usuario');
    }

    // Esperar brevemente para permitir ejecución del trigger de perfiles
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('*, zona:zonas(*)')
      .eq('id', authData.user.id)
      .single();

    const esAdminInicial = perfil?.rol === 'ADMIN' && perfil?.habilitado === true;

    const usuario: Usuario = {
      id: authData.user.id,
      nombres: data.nombres,
      apellidos: data.apellidos,
      nombreCompleto,
      correo: data.correo,
      rol: perfil?.rol || 'VISITADOR',
      zona: perfil?.zona
        ? {
            id: perfil.zona.id,
            nombre: perfil.zona.nombre,
            descripcion: perfil.zona.descripcion,
            activo: perfil.zona.activa,
          }
        : undefined,
      activo: perfil?.habilitado || false,
      authProvider: 'LOCAL',
      createdAt: perfil?.created_at,
    };

    if (esAdminInicial && authData.session) {
      return {
        token: authData.session.access_token,
        tokenType: 'Bearer',
        usuario,
        mensaje: 'Empresa inicializada. Has sido registrado como Administrador General.',
      };
    }

    return {
      token: null,
      usuario,
      mensaje:
        'Registro exitoso. Tu cuenta requiere aprobación del Administrador antes de que puedas iniciar sesión.',
    };
  },

  googleLogin: async (_idToken: string, _zonaId?: number): Promise<AuthResponse> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      token: null,
      usuario: {} as Usuario,
      mensaje: 'Redirigiendo a Google...',
    };
  },

  getMe: async (): Promise<Usuario> => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error('No autenticado');
    }

    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('*, zona:zonas(*)')
      .eq('id', userData.user.id)
      .single();

    if (perfilError || !perfil) {
      throw new Error('Perfil no encontrado');
    }

    return {
      id: perfil.id,
      nombres: perfil.nombre.split(' ')[0] || perfil.nombre,
      apellidos: perfil.nombre.split(' ').slice(1).join(' ') || '',
      nombreCompleto: perfil.nombre,
      correo: perfil.correo,
      rol: perfil.rol,
      zona: perfil.zona
        ? {
            id: perfil.zona.id,
            nombre: perfil.zona.nombre,
            descripcion: perfil.zona.descripcion,
            activo: perfil.zona.activa,
          }
        : undefined,
      activo: perfil.habilitado,
      authProvider: userData.user.app_metadata.provider === 'google' ? 'GOOGLE' : 'LOCAL',
      createdAt: perfil.created_at,
    };
  },

  logout: async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (err: any) {
      console.warn('Error al cerrar sesión en Supabase:', err?.message);
    }
  },

  solicitarRecuperacionPassword: async (correo: string): Promise<void> => {
    const redirectTo = window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(correo.trim(), {
      redirectTo,
    });
    if (error) {
      throw new Error(error.message);
    }
  },

  actualizarPassword: async (nuevaPassword: string): Promise<void> => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error(
        'No se encontró una sesión activa de recuperación. Para cambiar tu contraseña debes abrir el enlace enviado a tu correo.'
      );
    }
    const { error } = await supabase.auth.updateUser({
      password: nuevaPassword,
    });
    if (error) {
      if (error.message.includes('Auth session missing')) {
        throw new Error(
          'El enlace de recuperación ha expirado o no es válido. Por favor solicita uno nuevo a tu correo.'
        );
      }
      throw new Error(error.message);
    }
  },
};
