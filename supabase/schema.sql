-- ==============================================================================
-- SISTEMA DE GESTIÓN MÉDICA (MEDICARE) - ESQUEMA SUPABASE / POSTGRESQL
-- Incluye Tablas, Triggers de Negocio y Políticas RLS (Row Level Security)
-- ==============================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS ENUM
DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('ADMIN', 'VISITADOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_medico AS ENUM ('ACTIVO', 'INACTIVO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLA: ZONAS
CREATE TABLE IF NOT EXISTS public.zonas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    activa BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. TABLA: PERFILES (Vinculada a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    rol rol_usuario DEFAULT 'VISITADOR' NOT NULL,
    zona_id BIGINT REFERENCES public.zonas(id) ON DELETE SET NULL,
    habilitado BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. TABLA: CENTROS MÉDICOS (Catálogo compartido entre visitadores)
CREATE TABLE IF NOT EXISTS public.centros_medicos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(30),
    ciudad VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_centro_nombre_ciudad UNIQUE (nombre, ciudad)
);

-- 6. TABLA: MÉDICOS (Cada médico tiene un visitador responsable)
CREATE TABLE IF NOT EXISTS public.medicos (
    id BIGSERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    exequatur VARCHAR(30) NOT NULL UNIQUE,
    especialidad VARCHAR(100) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    direccion_profesional VARCHAR(255) NOT NULL,
    estado estado_medico DEFAULT 'ACTIVO' NOT NULL,
    observaciones TEXT,
    usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. TABLA INTERMEDIA: MEDICO_CENTRO_MEDICO (Muchos a Muchos)
CREATE TABLE IF NOT EXISTS public.medico_centro_medico (
    medico_id BIGINT NOT NULL REFERENCES public.medicos(id) ON DELETE CASCADE,
    centro_medico_id BIGINT NOT NULL REFERENCES public.centros_medicos(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (medico_id, centro_medico_id)
);

-- 8. TABLA: NOTIFICACIONES (Persistentes para Administradores)
CREATE TABLE IF NOT EXISTS public.notificaciones (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'NUEVO_USUARIO' NOT NULL,
    leida BOOLEAN DEFAULT false NOT NULL,
    usuario_relacionado_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 9. FUNCIONES DE SEGURIDAD Y TRIGGERS
-- ==============================================================================

-- Función para verificar si el usuario autenticado tiene rol ADMIN habilitado
CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE id = auth.uid() AND rol = 'ADMIN' AND habilitado = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función RPC para verificar estado inicial de la empresa (accesible para visitantes anónimos y autenticados)
CREATE OR REPLACE FUNCTION public.check_setup_status()
RETURNS JSONB AS $$
DECLARE
    v_total INT;
BEGIN
    SELECT COUNT(*) INTO v_total FROM public.perfiles;
    RETURN jsonb_build_object(
        'adminExists', (v_total > 0),
        'totalUsuarios', v_total
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.check_setup_status() TO anon, authenticated, service_role;

-- Trigger: Gestiona la creación de perfiles y notificaciones al registrar un usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_total_usuarios INT;
    v_es_primer_usuario BOOLEAN;
    v_nombre VARCHAR(150);
    v_zona_id BIGINT := NULL;
    v_rol rol_usuario;
    v_habilitado BOOLEAN;
BEGIN
    -- Comprobar si es el primer usuario de la empresa
    SELECT COUNT(*) INTO v_total_usuarios FROM public.perfiles;
    v_es_primer_usuario := (v_total_usuarios = 0);

    -- Extraer metadatos enviados desde el frontend (signup)
    v_nombre := COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1));
    
    IF NEW.raw_user_meta_data->>'zonaId' IS NOT NULL AND NEW.raw_user_meta_data->>'zonaId' != '' THEN
        v_zona_id := (NEW.raw_user_meta_data->>'zonaId')::BIGINT;
    END IF;

    IF v_es_primer_usuario THEN
        -- El primer usuario es el Administrador de la empresa (aprobado automáticamente)
        v_rol := 'ADMIN';
        v_habilitado := true;
    ELSE
        -- Los siguientes usuarios son VISITADORES que requieren aprobación del admin
        v_rol := 'VISITADOR';
        v_habilitado := false;
    END IF;

    -- Insertar el perfil público
    INSERT INTO public.perfiles (id, nombre, correo, rol, zona_id, habilitado)
    VALUES (NEW.id, v_nombre, NEW.email, v_rol, v_zona_id, v_habilitado);

    -- Si no es el administrador inicial, generar notificación persistente para los administradores
    IF NOT v_es_primer_usuario THEN
        INSERT INTO public.notificaciones (titulo, mensaje, tipo, usuario_relacionado_id)
        VALUES (
            'Nuevo usuario pendiente de aprobación',
            'El usuario ' || v_nombre || ' (' || NEW.email || ') se ha registrado y requiere aprobación de cuenta.',
            'NUEVO_USUARIO',
            NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asignar el trigger al evento posterior a la creación en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para actualizar columna updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_medicos_updated_at ON public.medicos;
CREATE TRIGGER tr_medicos_updated_at
    BEFORE UPDATE ON public.medicos
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) - AISLAMIENTO ESTRICTO DE DATOS
-- ==============================================================================

ALTER TABLE public.zonas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centros_medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medico_centro_medico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: ZONAS (Cualquier usuario autenticado puede consultarlas; solo admin edita)
DROP POLICY IF EXISTS "Zonas visibles para usuarios autenticados" ON public.zonas;
CREATE POLICY "Zonas visibles para usuarios autenticados"
    ON public.zonas FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Solo admin gestiona zonas" ON public.zonas;
CREATE POLICY "Solo admin gestiona zonas"
    ON public.zonas FOR ALL TO authenticated
    USING (public.es_admin())
    WITH CHECK (public.es_admin());

-- POLÍTICAS: PERFILES
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil o admin ver todos" ON public.perfiles;
CREATE POLICY "Usuarios pueden ver su propio perfil o admin ver todos"
    ON public.perfiles FOR SELECT TO authenticated
    USING (id = auth.uid() OR public.es_admin());

DROP POLICY IF EXISTS "Admin puede actualizar cualquier perfil; usuario su propio nombre" ON public.perfiles;
CREATE POLICY "Admin puede actualizar cualquier perfil; usuario su propio nombre"
    ON public.perfiles FOR UPDATE TO authenticated
    USING (id = auth.uid() OR public.es_admin())
    WITH CHECK (id = auth.uid() OR public.es_admin());

-- POLÍTICAS: CENTROS MÉDICOS (Catálogo compartido entre visitadores)
DROP POLICY IF EXISTS "Centros médicos visibles para todos" ON public.centros_medicos;
CREATE POLICY "Centros médicos visibles para todos"
    ON public.centros_medicos FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Cualquier visitador puede crear un centro nuevo" ON public.centros_medicos;
CREATE POLICY "Cualquier visitador puede crear un centro nuevo"
    ON public.centros_medicos FOR INSERT TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Solo admin puede modificar o eliminar centros compartidos" ON public.centros_medicos;
CREATE POLICY "Solo admin puede modificar o eliminar centros compartidos"
    ON public.centros_medicos FOR UPDATE TO authenticated
    USING (public.es_admin())
    WITH CHECK (public.es_admin());

DROP POLICY IF EXISTS "Solo admin puede borrar centros compartidos" ON public.centros_medicos;
CREATE POLICY "Solo admin puede borrar centros compartidos"
    ON public.centros_medicos FOR DELETE TO authenticated
    USING (public.es_admin());

-- POLÍTICAS: MÉDICOS (Aislamiento de datos: visitador solo ve y gestiona los suyos)
DROP POLICY IF EXISTS "Visitadores ven sus medicos; admin ve todos" ON public.medicos;
CREATE POLICY "Visitadores ven sus medicos; admin ve todos"
    ON public.medicos FOR SELECT TO authenticated
    USING (usuario_id = auth.uid() OR public.es_admin());

DROP POLICY IF EXISTS "Visitadores solo insertan medicos asignados a ellos" ON public.medicos;
CREATE POLICY "Visitadores solo insertan medicos asignados a ellos"
    ON public.medicos FOR INSERT TO authenticated
    WITH CHECK (usuario_id = auth.uid() OR public.es_admin());

DROP POLICY IF EXISTS "Visitadores solo actualizan sus propios medicos" ON public.medicos;
CREATE POLICY "Visitadores solo actualizan sus propios medicos"
    ON public.medicos FOR UPDATE TO authenticated
    USING (usuario_id = auth.uid() OR public.es_admin())
    WITH CHECK (usuario_id = auth.uid() OR public.es_admin());

DROP POLICY IF EXISTS "Visitadores solo eliminan sus propios medicos" ON public.medicos;
CREATE POLICY "Visitadores solo eliminan sus propios medicos"
    ON public.medicos FOR DELETE TO authenticated
    USING (usuario_id = auth.uid() OR public.es_admin());

-- POLÍTICAS: MEDICO_CENTRO_MEDICO (Intermedia)
DROP POLICY IF EXISTS "Relaciones visibles según acceso al medico" ON public.medico_centro_medico;
CREATE POLICY "Relaciones visibles según acceso al medico"
    ON public.medico_centro_medico FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.medicos m
            WHERE m.id = medico_id AND (m.usuario_id = auth.uid() OR public.es_admin())
        )
    );

DROP POLICY IF EXISTS "Insertar relacion solo en medicos propios" ON public.medico_centro_medico;
CREATE POLICY "Insertar relacion solo en medicos propios"
    ON public.medico_centro_medico FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.medicos m
            WHERE m.id = medico_id AND (m.usuario_id = auth.uid() OR public.es_admin())
        )
    );

DROP POLICY IF EXISTS "Eliminar relacion solo en medicos propios" ON public.medico_centro_medico;
CREATE POLICY "Eliminar relacion solo en medicos propios"
    ON public.medico_centro_medico FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.medicos m
            WHERE m.id = medico_id AND (m.usuario_id = auth.uid() OR public.es_admin())
        )
    );

-- POLÍTICAS: NOTIFICACIONES (Solo administradores)
DROP POLICY IF EXISTS "Solo admin ve y gestiona notificaciones" ON public.notificaciones;
CREATE POLICY "Solo admin ve y gestiona notificaciones"
    ON public.notificaciones FOR ALL TO authenticated
    USING (public.es_admin())
    WITH CHECK (public.es_admin());

-- ==============================================================================
-- 11. DATOS SEMILLA INICIALES (ZONAS Y CENTROS MÉDICOS DE EJEMPLO)
-- ==============================================================================

INSERT INTO public.zonas (nombre, descripcion, activa) VALUES
('Zona Metropolitana', 'Distrito Nacional y Gran Santo Domingo', true),
('Zona Norte / Cibao', 'Santiago, La Vega, Puerto Plata y San Francisco de Macorís', true),
('Zona Este', 'La Romana, San Pedro de Macorís, Higüey y Punta Cana', true),
('Zona Sur', 'San Cristóbal, Baní, Azua y Barahona', true),
('Zona Santo Domingo Este', 'Municipios Santo Domingo Este y Boca Chica', true)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.centros_medicos (nombre, direccion, telefono, ciudad, activo) VALUES
('Centro Médico Bellas Artes', 'Av. Máximo Gómez #45, Gazcue', '(809) 555-0101', 'Santo Domingo', true),
('Hospital Metropolitano de Santiago (HOMS)', 'Autopista Duarte Km 2.8', '(809) 555-0102', 'Santiago', true),
('Centro Médico Bournigal', 'Calle Antera Mota #10', '(809) 555-0103', 'Puerto Plata', true),
('Centro Médico Punta Cana', 'Av. España #12', '(809) 555-0104', 'Punta Cana', true),
('Clínica Corazones Unidos', 'Calle Fantino Falco #23, Naco', '(809) 555-0105', 'Santo Domingo', true)
ON CONFLICT (nombre, ciudad) DO NOTHING;
