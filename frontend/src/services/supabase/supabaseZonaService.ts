import { supabase } from '../../lib/supabase';
import { Zona } from '../../types';

export const supabaseZonaService = {
  listarTodas: async (): Promise<Zona[]> => {
    const { data, error } = await supabase
      .from('zonas')
      .select('*')
      .order('id');

    if (error) throw new Error(error.message);
    return (data || []).map((z: any) => ({
      id: z.id,
      nombre: z.nombre,
      descripcion: z.descripcion,
      activo: z.activa,
    }));
  },

  listarActivas: async (): Promise<Zona[]> => {
    const { data, error } = await supabase
      .from('zonas')
      .select('*')
      .eq('activa', true)
      .order('nombre');

    if (error) throw new Error(error.message);
    return (data || []).map((z: any) => ({
      id: z.id,
      nombre: z.nombre,
      descripcion: z.descripcion,
      activo: z.activa,
    }));
  },

  obtenerPorId: async (id: number): Promise<Zona> => {
    const { data, error } = await supabase
      .from('zonas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new Error(error?.message || 'Zona no encontrada');
    return {
      id: data.id,
      nombre: data.nombre,
      descripcion: data.descripcion,
      activo: data.activa,
    };
  },

  crear: async (data: { nombre: string; descripcion?: string; activo?: boolean }): Promise<Zona> => {
    const { data: row, error } = await supabase
      .from('zonas')
      .insert({
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim() || null,
        activa: data.activo ?? true,
      })
      .select()
      .single();

    if (error || !row) throw new Error(error?.message || 'Error al crear zona');
    return {
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      activo: row.activa,
    };
  },

  actualizar: async (
    id: number,
    data: { nombre: string; descripcion?: string; activo?: boolean }
  ): Promise<Zona> => {
    const { data: row, error } = await supabase
      .from('zonas')
      .update({
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim() || null,
        activa: data.activo ?? true,
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !row) throw new Error(error?.message || 'Error al actualizar zona');
    return {
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      activo: row.activa,
    };
  },

  eliminar: async (id: number): Promise<void> => {
    const { error } = await supabase.from('zonas').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
