export type EstadoMedico = 'ACTIVO' | 'INACTIVO';
export type RolUsuario = 'ADMIN' | 'VISITADOR';
export type AuthProviderType = 'LOCAL' | 'GOOGLE';

export interface Zona {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  correo: string;
  rol: RolUsuario;
  zona?: Zona;
  activo: boolean;
  authProvider: AuthProviderType;
  createdAt?: string;
}

export interface UsuarioUpdateRequest {
  nombres: string;
  apellidos: string;
  rol?: RolUsuario;
  zonaId?: number;
  activo?: boolean;
  password?: string;
}

export interface SetupStatus {
  adminExists: boolean;
  totalUsuarios: number;
}

export interface AuthResponse {
  token: string | null;
  tokenType?: string;
  usuario: Usuario;
  mensaje?: string;
}

export interface Notificacion {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  usuarioRegistradoId?: number;
  leida: boolean;
  createdAt: string;
}

export interface CentroMedico {
  id: number;
  nombre: string;
  direccion: string;
  telefono?: string;
  ciudad?: string;
  estado: EstadoMedico;
  cantidadMedicos?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CentroMedicoRequest {
  nombre: string;
  direccion: string;
  telefono?: string;
  ciudad?: string;
  estado: EstadoMedico;
}

export interface Medico {
  id: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  cedula: string;
  exequatur: string;
  especialidad: string;
  telefono: string;
  correo: string;
  direccionProfesional: string;
  estado: EstadoMedico;
  observaciones?: string;
  centrosMedicos: CentroMedico[];
  visitadorId?: number;
  visitadorNombre?: string;
  visitadorCorreo?: string;
  zonaNombre?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicoRequest {
  nombres: string;
  apellidos: string;
  cedula: string;
  exequatur: string;
  especialidad: string;
  telefono: string;
  correo: string;
  direccionProfesional: string;
  estado: EstadoMedico;
  observaciones?: string;
  centrosMedicosIds: number[];
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface MedicoStats {
  totalMedicos: number;
  medicosActivos: number;
  medicosInactivos: number;
  totalEspecialidades: number;
  totalCentros: number;
}

export interface FilterParams {
  search?: string;
  especialidad?: string;
  estado?: EstadoMedico | '';
  centroId?: number | '';
  visitadorId?: number | '';
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}
