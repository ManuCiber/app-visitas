import { supabase } from '../../lib/supabase';
import { FilterParams, Medico, MedicoRequest, MedicoStats, PageResponse, CentroMedico } from '../../types';

export const supabaseMedicoService = {
  listar: async (params: FilterParams): Promise<PageResponse<Medico>> => {
    const page = params.page ?? 0;
    const size = params.size ?? 8;
    const from = page * size;
    const to = from + size - 1;

    let query = supabase
      .from('medicos')
      .select(
        `
        *,
        usuario:perfiles(id, nombre, correo, zona:zonas(nombre)),
        medico_centro_medico(
          centro:centros_medicos(*)
        )
      `,
        { count: 'exact' }
      );

    // Búsqueda general
    if (params.search && params.search.trim()) {
      const s = `%${params.search.trim()}%`;
      query = query.or(
        `nombres.ilike.${s},apellidos.ilike.${s},cedula.ilike.${s},exequatur.ilike.${s},especialidad.ilike.${s}`
      );
    }

    // Filtros específicos
    if (params.especialidad && params.especialidad.trim()) {
      query = query.eq('especialidad', params.especialidad.trim());
    }

    if (params.estado && params.estado.trim()) {
      query = query.eq('estado', params.estado.trim());
    }

    if (params.visitadorId) {
      query = query.eq('usuario_id', params.visitadorId);
    }

    // Filtro por centro médico asignado
    if (params.centroId) {
      const { data: rels, error: relsError } = await supabase
        .from('medico_centro_medico')
        .select('medico_id')
        .eq('centro_medico_id', params.centroId);

      if (relsError) throw new Error(relsError.message);

      const ids = (rels || []).map((r: any) => r.medico_id);
      if (ids.length === 0) {
        return {
          content: [],
          pageNumber: page,
          pageSize: size,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
          empty: true,
        };
      }
      query = query.in('id', ids);
    }

    // Ordenamiento
    const sortBy = params.sortBy === 'nombreCompleto' ? 'nombres' : params.sortBy || 'created_at';
    const ascending = params.sortDir === 'asc';
    query = query.order(sortBy, { ascending });

    // Paginación
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const totalElements = count ?? 0;
    const totalPages = Math.ceil(totalElements / size);

    const content: Medico[] = (data || []).map((row: any) => {
      const centrosMedicos: CentroMedico[] = (row.medico_centro_medico || [])
        .map((rel: any) => rel.centro)
        .filter(Boolean)
        .map((c: any) => ({
          id: c.id,
          nombre: c.nombre,
          direccion: c.direccion,
          telefono: c.telefono,
          ciudad: c.ciudad,
          estado: c.activo ? 'ACTIVO' : 'INACTIVO',
          createdAt: c.created_at,
        }));

      return {
        id: row.id,
        nombres: row.nombres,
        apellidos: row.apellidos,
        nombreCompleto: `${row.nombres} ${row.apellidos}`.trim(),
        cedula: row.cedula,
        exequatur: row.exequatur,
        especialidad: row.especialidad,
        telefono: row.telefono,
        correo: row.correo,
        direccionProfesional: row.direccion_profesional,
        estado: row.estado,
        observaciones: row.observaciones,
        centrosMedicos,
        visitadorId: row.usuario?.id,
        visitadorNombre: row.usuario?.nombre,
        visitadorCorreo: row.usuario?.correo,
        zonaNombre: row.usuario?.zona?.nombre,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    return {
      content,
      pageNumber: page,
      pageSize: size,
      totalElements,
      totalPages,
      first: page === 0,
      last: page >= totalPages - 1,
      empty: content.length === 0,
    };
  },

  obtenerPorId: async (id: number): Promise<Medico> => {
    const { data, error } = await supabase
      .from('medicos')
      .select(
        `
        *,
        usuario:perfiles(id, nombre, correo, zona:zonas(nombre)),
        medico_centro_medico(
          centro:centros_medicos(*)
        )
      `
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Médico no encontrado');
    }

    const centrosMedicos: CentroMedico[] = (data.medico_centro_medico || [])
      .map((rel: any) => rel.centro)
      .filter(Boolean)
      .map((c: any) => ({
        id: c.id,
        nombre: c.nombre,
        direccion: c.direccion,
        telefono: c.telefono,
        ciudad: c.ciudad,
        estado: c.activo ? 'ACTIVO' : 'INACTIVO',
        createdAt: c.created_at,
      }));

    return {
      id: data.id,
      nombres: data.nombres,
      apellidos: data.apellidos,
      nombreCompleto: `${data.nombres} ${data.apellidos}`.trim(),
      cedula: data.cedula,
      exequatur: data.exequatur,
      especialidad: data.especialidad,
      telefono: data.telefono,
      correo: data.correo,
      direccionProfesional: data.direccion_profesional,
      estado: data.estado,
      observaciones: data.observaciones,
      centrosMedicos,
      visitadorId: data.usuario?.id,
      visitadorNombre: data.usuario?.nombre,
      visitadorCorreo: data.usuario?.correo,
      zonaNombre: data.usuario?.zona?.nombre,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  crear: async (data: MedicoRequest): Promise<Medico> => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      throw new Error('Debes iniciar sesión para crear un médico');
    }

    // Insertar médico asociado al usuario autenticado
    const { data: medicoInsert, error: medicoError } = await supabase
      .from('medicos')
      .insert({
        nombres: data.nombres.trim(),
        apellidos: data.apellidos.trim(),
        cedula: data.cedula.trim(),
        exequatur: data.exequatur.trim(),
        especialidad: data.especialidad.trim(),
        telefono: data.telefono.trim(),
        correo: data.correo.trim().toLowerCase(),
        direccion_profesional: data.direccionProfesional.trim(),
        estado: data.estado,
        observaciones: data.observaciones?.trim() || null,
        usuario_id: authData.user.id,
      })
      .select()
      .single();

    if (medicoError || !medicoInsert) {
      if (medicoError?.message.includes('cedula')) {
        throw new Error('Ya existe un médico registrado con esta cédula');
      }
      if (medicoError?.message.includes('exequatur')) {
        throw new Error('Ya existe un médico registrado con este exequátur');
      }
      throw new Error(medicoError?.message || 'Error al crear médico');
    }

    // Asociar centros médicos si se especificaron
    if (data.centrosMedicosIds && data.centrosMedicosIds.length > 0) {
      const asociaciones = data.centrosMedicosIds.map((centroId) => ({
        medico_id: medicoInsert.id,
        centro_medico_id: centroId,
      }));
      await supabase.from('medico_centro_medico').insert(asociaciones);
    }

    return supabaseMedicoService.obtenerPorId(medicoInsert.id);
  },

  actualizar: async (id: number, data: MedicoRequest): Promise<Medico> => {
    const { error: updateError } = await supabase
      .from('medicos')
      .update({
        nombres: data.nombres.trim(),
        apellidos: data.apellidos.trim(),
        cedula: data.cedula.trim(),
        exequatur: data.exequatur.trim(),
        especialidad: data.especialidad.trim(),
        telefono: data.telefono.trim(),
        correo: data.correo.trim().toLowerCase(),
        direccion_profesional: data.direccionProfesional.trim(),
        estado: data.estado,
        observaciones: data.observaciones?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Sincronizar asociaciones con centros médicos
    if (data.centrosMedicosIds !== undefined) {
      // Eliminar asociaciones actuales
      await supabase.from('medico_centro_medico').delete().eq('medico_id', id);

      // Insertar nuevas asociaciones
      if (data.centrosMedicosIds.length > 0) {
        const asociaciones = data.centrosMedicosIds.map((centroId) => ({
          medico_id: id,
          centro_medico_id: centroId,
        }));
        await supabase.from('medico_centro_medico').insert(asociaciones);
      }
    }

    return supabaseMedicoService.obtenerPorId(id);
  },

  eliminar: async (id: number): Promise<void> => {
    const { error } = await supabase.from('medicos').delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
  },

  obtenerEspecialidades: async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from('medicos')
      .select('especialidad')
      .order('especialidad');

    if (error) return [];
    const set = new Set((data || []).map((m: any) => m.especialidad).filter(Boolean));
    return Array.from(set);
  },

  obtenerEstadisticas: async (): Promise<MedicoStats> => {
    const [medicosRes, centrosRes] = await Promise.all([
      supabase.from('medicos').select('id, estado, especialidad'),
      supabase.from('centros_medicos').select('id', { count: 'exact', head: true }),
    ]);

    const medicos = medicosRes.data || [];
    const totalMedicos = medicos.length;
    const medicosActivos = medicos.filter((m) => m.estado === 'ACTIVO').length;
    const medicosInactivos = totalMedicos - medicosActivos;
    const totalEspecialidades = new Set(medicos.map((m) => m.especialidad)).size;
    const totalCentros = centrosRes.count ?? 0;

    return {
      totalMedicos,
      medicosActivos,
      medicosInactivos,
      totalEspecialidades,
      totalCentros,
    };
  },
};
