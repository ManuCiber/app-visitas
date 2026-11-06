import { supabase } from '../../lib/supabase';
import { Usuario, UsuarioUpdateRequest } from '../../types';

export const supabaseUsuarioService = {
  listarTodos: async (): Promise<Usuario[]> => {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*, zona:zonas(*)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []).map((p: any) => ({
      id: p.id,
      nombres: p.nombre.split(' ')[0] || p.nombre,
      apellidos: p.nombre.split(' ').slice(1).join(' ') || '',
      nombreCompleto: p.nombre,
      correo: p.correo,
      rol: p.rol,
      zona: p.zona
        ? {
            id: p.zona.id,
            nombre: p.zona.nombre,
            descripcion: p.zona.descripcion,
            activo: p.zona.activa,
          }
        : undefined,
      activo: p.habilitado,
      authProvider: 'LOCAL',
      createdAt: p.created_at,
    }));
  },

  obtenerPorId: async (id: string | number): Promise<Usuario> => {
    const { data: p, error } = await supabase
      .from('perfiles')
      .select('*, zona:zonas(*)')
      .eq('id', id)
      .single();

    if (error || !p) throw new Error(error?.message || 'Usuario no encontrado');

    return {
      id: p.id,
      nombres: p.nombre.split(' ')[0] || p.nombre,
      apellidos: p.nombre.split(' ').slice(1).join(' ') || '',
      nombreCompleto: p.nombre,
      correo: p.correo,
      rol: p.rol,
      zona: p.zona
        ? {
            id: p.zona.id,
            nombre: p.zona.nombre,
            descripcion: p.zona.descripcion,
            activo: p.zona.activa,
          }
        : undefined,
      activo: p.habilitado,
      authProvider: 'LOCAL',
      createdAt: p.created_at,
    };
  },

  actualizar: async (id: string | number, data: UsuarioUpdateRequest): Promise<Usuario> => {
    const updatePayload: Record<string, any> = {
      nombre: `${data.nombres} ${data.apellidos}`.trim(),
    };

    if (data.rol) updatePayload.rol = data.rol;
    if (data.zonaId !== undefined) updatePayload.zona_id = data.zonaId || null;
    if (data.activo !== undefined) updatePayload.habilitado = data.activo;

    const { error } = await supabase
      .from('perfiles')
      .update(updatePayload)
      .eq('id', id);

    if (error) throw new Error(error.message);
    return supabaseUsuarioService.obtenerPorId(id);
  },

  cambiarEstado: async (id: string | number, activo: boolean): Promise<Usuario> => {
    const { error } = await supabase
      .from('perfiles')
      .update({ habilitado: activo })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return supabaseUsuarioService.obtenerPorId(id);
  },

  cambiarRol: async (id: string | number, rol: 'ADMIN' | 'VISITADOR'): Promise<Usuario> => {
    const { error } = await supabase
      .from('perfiles')
      .update({ rol })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return supabaseUsuarioService.obtenerPorId(id);
  },
};
