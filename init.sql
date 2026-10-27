-- Esquema y Migraciones para Sistema de Gestión Médica MediCare

-- 1. Tabla de Zonas Geográficas
CREATE TABLE IF NOT EXISTS zonas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Usuarios (ADMIN y VISITADOR)
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL,
    zona_id BIGINT REFERENCES zonas(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE,
    google_id VARCHAR(100),
    auth_provider VARCHAR(20) DEFAULT 'LOCAL',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Centros Médicos
CREATE TABLE IF NOT EXISTS centros_medicos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(30),
    ciudad VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Médicos con Aislamiento (Responsable: usuario_id)
CREATE TABLE IF NOT EXISTS medicos (
    id BIGSERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    exequatur VARCHAR(30) NOT NULL UNIQUE,
    especialidad VARCHAR(100) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    correo VARCHAR(120) NOT NULL,
    direccion_profesional VARCHAR(255) NOT NULL,
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    observaciones TEXT,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migración segura si la columna usuario_id no existía en despliegues previos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicos' AND column_name = 'usuario_id'
    ) THEN
        ALTER TABLE medicos ADD COLUMN usuario_id BIGINT REFERENCES usuarios(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- 5. Tabla Intermedia Médico - Centro Médico
CREATE TABLE IF NOT EXISTS medico_centro_medico (
    medico_id BIGINT NOT NULL,
    centro_medico_id BIGINT NOT NULL,
    PRIMARY KEY (medico_id, centro_medico_id),
    CONSTRAINT fk_mcm_medico FOREIGN KEY (medico_id) REFERENCES medicos (id) ON DELETE CASCADE,
    CONSTRAINT fk_mcm_centro FOREIGN KEY (centro_medico_id) REFERENCES centros_medicos (id) ON DELETE RESTRICT
);

-- 6. Tabla de Notificaciones Internas para Administradores
CREATE TABLE IF NOT EXISTS notificaciones (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    usuario_registrado_id BIGINT,
    leida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_notif_registro UNIQUE (tipo, usuario_registrado_id)
);

-- -------------------------------------------------------------
-- Datos Iniciales Preservando Integridad
-- -------------------------------------------------------------

-- Zonas
INSERT INTO zonas (nombre, descripcion, activo)
VALUES
    ('Zona Metropolitana', 'Distrito Nacional y Gran Santo Domingo', TRUE),
    ('Zona Norte (Cibao)', 'Santiago, La Vega, San Francisco y Puerto Plata', TRUE),
    ('Zona Este', 'San Pedro, La Romana, Higüey y Punta Cana', TRUE),
    ('Zona Sur', 'San Cristóbal, Baní, Azua y Barahona', TRUE)
ON CONFLICT (nombre) DO NOTHING;

-- Usuarios Iniciales (Contraseña: Password123! hasheada con BCrypt: $2a$10$wOqZ38F4d0/m276182g2U.o1H7w4n5oYn2a8/H.l5aIqR6y4M5xCe)
INSERT INTO usuarios (nombres, apellidos, correo, password, rol, zona_id, activo, auth_provider)
VALUES
    ('Administrador', 'General', 'admin@medicare.do', '$2a$10$7rCiqvR4kU7Uf8hFfK4f5Oz8jX5rFq5Jb0y6P5w7s3k6R8w9Z5v1q', 'ADMIN', NULL, TRUE, 'LOCAL'),
    ('Carlos', 'Visitador Central', 'visitador@medicare.do', '$2a$10$7rCiqvR4kU7Uf8hFfK4f5Oz8jX5rFq5Jb0y6P5w7s3k6R8w9Z5v1q', 'VISITADOR', 1, TRUE, 'LOCAL'),
    ('Laura', 'Visitadora Cibao', 'visitador.norte@medicare.do', '$2a$10$7rCiqvR4kU7Uf8hFfK4f5Oz8jX5rFq5Jb0y6P5w7s3k6R8w9Z5v1q', 'VISITADOR', 2, TRUE, 'LOCAL')
ON CONFLICT (correo) DO NOTHING;

-- Centros Médicos
INSERT INTO centros_medicos (nombre, direccion, telefono, ciudad, estado)
VALUES
    ('Centro Médico Abel González', 'Av. Abraham Lincoln 953, Piantini', '(809) 227-2235', 'Santo Domingo', 'ACTIVO'),
    ('Clínica Corazones Unidos', 'Calle Fantino Falco 21, Naco', '(809) 567-4421', 'Santo Domingo', 'ACTIVO'),
    ('CEDIMAT', 'Calle Pepillo Salcedo, Plaza de la Salud', '(809) 565-9989', 'Santo Domingo', 'ACTIVO'),
    ('Hospital Metropolitano de Santiago (HOMS)', 'Autopista Duarte Km 2.8', '(829) 947-2222', 'Santiago', 'ACTIVO'),
    ('Centro Médico Punta Cana', 'Av. España 22, Bávaro', '(809) 552-1506', 'Punta Cana', 'ACTIVO')
ON CONFLICT (nombre) DO NOTHING;

-- Médicos Iniciales
INSERT INTO medicos (nombres, apellidos, cedula, exequatur, especialidad, telefono, correo, direccion_profesional, estado, observaciones, usuario_id)
VALUES
    ('Alejandro', 'Pérez Morales', '001-0897654-3', 'EX-2015-8841', 'Cardiología', '(809) 555-0101', 'alejandro.perez@medicare.do', 'Edificio Profesional Naco, Suite 402', 'ACTIVO', 'Especialista en hemodinámica y ecocardiografía.', 2),
    ('Beatriz', 'Gómez Santana', '001-1456789-2', 'EX-2018-4523', 'Pediatría', '(809) 555-0102', 'beatriz.gomez@medicare.do', 'Torre Médica Lincoln, Nivel 3', 'ACTIVO', 'Atención pediátrica integral y neonatología.', 2),
    ('Carlos', 'Ramírez Domínguez', '031-0234567-8', 'EX-2012-1190', 'Ortopedia y Traumatología', '(809) 555-0103', 'carlos.ramirez@medicare.do', 'Consultorios Médicos del Este, Cons. 12', 'ACTIVO', 'Cirugía artroscópica de rodilla y hombro.', 3),
    ('Diana', 'Martínez Castillo', '001-1987654-1', 'EX-2019-3321', 'Dermatología', '(809) 555-0104', 'diana.martinez@medicare.do', 'Plaza Médica Piantini, Local 2B', 'ACTIVO', 'Dermatología clínica y cosmética.', 2),
    ('Eduardo', 'Fernández Vargas', '002-0543219-5', 'EX-2014-9912', 'Ginecología y Obstetricia', '(809) 555-0105', 'eduardo.fernandez@medicare.do', 'Av. 27 de Febrero No. 450', 'INACTIVO', 'Permiso sabático de investigación.', 3)
ON CONFLICT (cedula) DO NOTHING;

-- Asegurar asignación de médicos existentes sin responsable a visitador 2 (Carlos)
UPDATE medicos SET usuario_id = 2 WHERE usuario_id IS NULL;

-- Asociaciones iniciales muchos a muchos
INSERT INTO medico_centro_medico (medico_id, centro_medico_id)
VALUES
    (1, 1),
    (1, 3),
    (2, 2),
    (3, 4),
    (3, 1),
    (4, 2),
    (4, 5),
    (5, 3)
ON CONFLICT DO NOTHING;
