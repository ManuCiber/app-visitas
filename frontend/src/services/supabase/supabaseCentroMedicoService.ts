import { supabase } from '../../lib/supabase';
import { CentroMedico, CentroMedicoRequest } from '../../types';

export const supabaseCentroMedicoService = {
  listarTodos: async (soloActivos: boolean = false): Promise<CentroMedico[]> => {
    let query = supabase
      .from('centros_medicos')
      .select('*, medico_centro_medico(count)')
      .order('nombre');

    if (soloActivos) {
      query = query.eq('activo', true);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      direccion: row.direccion,
      telefono: row.telefono,
      ciudad: row.ciudad,
      estado: row.activo ? 'ACTIVO' : 'INACTIVO',
      cantidadMedicos: row.medico_centro_medico?.[0]?.count ?? 0,
      createdAt: row.created_at,
    }));
  },

  obtenerPorId: async (id: number): Promise<CentroMedico> => {
    const { data, error } = await supabase
      .from('centros_medicos')
      .select('*, medico_centro_medico(count)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Centro médico no encontrado');
    }

    return {
      id: data.id,
      nombre: data.nombre,
      direccion: data.direccion,
      telefono: data.telefono,
      ciudad: data.ciudad,
      estado: data.activo ? 'ACTIVO' : 'INACTIVO',
      cantidadMedicos: data.medico_centro_medico?.[0]?.count ?? 0,
      createdAt: data.created_at,
    };
  },

  crear: async (data: CentroMedicoRequest): Promise<CentroMedico> => {
    const { data: row, error } = await supabase
      .from('centros_medicos')
      .insert({
        nombre: data.nombre.trim(),
        direccion: data.direccion.trim(),
        telefono: data.telefono?.trim() || null,
        ciudad: data.ciudad?.trim() || 'Santo Domingo',
        activo: data.estado === 'ACTIVO',
      })
      .select()
      .single();

    if (error || !row) {
      throw new Error(error?.message || 'Error al crear centro médico');
    }

    return {
      id: row.id,
      nombre: row.nombre,
      direccion: row.direccion,
      telefono: row.telefono,
      ciudad: row.ciudad,
      estado: row.activo ? 'ACTIVO' : 'INACTIVO',
      cantidadMedicos: 0,
      createdAt: row.created_at,
    };
  },

  crearOReutilizar: async (data: CentroMedicoRequest): Promise<CentroMedico> => {
    const nombreNorm = data.nombre.trim();
    const ciudadNorm = (data.ciudad?.trim() || 'Santo Domingo');

    // Buscar si ya existe por nombre y ciudad
    const { data: existente } = await supabase
      .from('centros_medicos')
      .select('*')
      .ilike('nombre', nombreNorm)
      .ilike('ciudad', ciudadNorm)
      .maybeSingle();

    if (existente) {
      return {
        id: existente.id,
        nombre: existente.nombre,
        direccion: existente.direccion,
        telefono: existente.telefono,
        ciudad: existente.ciudad,
        estado: existente.activo ? 'ACTIVO' : 'INACTIVO',
        createdAt: existente.created_at,
      };
    }

    return supabaseCentroMedicoService.crear(data);
  },

  actualizar: async (id: number, data: CentroMedicoRequest): Promise<CentroMedico> => {
    const { data: row, error } = await supabase
      .from('centros_medicos')
      .update({
        nombre: data.nombre.trim(),
        direccion: data.direccion.trim(),
        telefono: data.telefono?.trim() || null,
        ciudad: data.ciudad?.trim() || 'Santo Domingo',
        activo: data.estado === 'ACTIVO',
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !row) {
      throw new Error(error?.message || 'Error al actualizar centro médico');
    }

    return {
      id: row.id,
      nombre: row.nombre,
      direccion: row.direccion,
      telefono: row.telefono,
      ciudad: row.ciudad,
      estado: row.activo ? 'ACTIVO' : 'INACTIVO',
      createdAt: row.created_at,
    };
  },

  eliminar: async (id: number): Promise<void> => {
    const { error } = await supabase.from('centros_medicos').delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
  },
};
