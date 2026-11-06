import { supabase } from '../../lib/supabase';
import { Notificacion } from '../../types';

export const supabaseNotificacionService = {
  listarTodas: async (): Promise<Notificacion[]> => {
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []).map((n: any) => ({
      id: n.id,
      tipo: n.tipo,
      titulo: n.titulo,
      mensaje: n.mensaje,
      usuarioRegistradoId: n.usuario_relacionado_id,
      leida: n.leida,
      createdAt: n.created_at,
    }));
  },

  contarPendientes: async (): Promise<{ pendientes: number }> => {
    const { count, error } = await supabase
      .from('notificaciones')
      .select('id', { count: 'exact', head: true })
      .eq('leida', false);

    if (error) return { pendientes: 0 };
    return { pendientes: count ?? 0 };
  },

  marcarComoLeida: async (id: number): Promise<Notificacion> => {
    const { data, error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Error al actualizar notificación');

    return {
      id: data.id,
      tipo: data.tipo,
      titulo: data.titulo,
      mensaje: data.mensaje,
      usuarioRegistradoId: data.usuario_relacionado_id,
      leida: data.leida,
      createdAt: data.created_at,
    };
  },

  marcarTodasComoLeidas: async (): Promise<{ message: string }> => {
    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('leida', false);

    if (error) throw new Error(error.message);
    return { message: 'Todas las notificaciones marcadas como leídas' };
  },
};
