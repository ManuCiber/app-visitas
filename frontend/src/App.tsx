import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MedicoModal } from './components/MedicoModal';
import { MedicoDetailModal } from './components/MedicoDetailModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { CentroMedicoModal } from './components/CentroMedicoModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AuthModal } from './components/AuthModal';
import { AdminView } from './components/AdminView';
import { VisitadorView } from './components/VisitadorView';
import { useToast } from './context/ToastContext';
import { useAuth } from './context/AuthContext';
import { medicoService } from './services/medicoService';
import { centroMedicoService } from './services/centroMedicoService';
import { usuarioService } from './services/usuarioService';
import { notificacionService } from './services/notificacionService';
import {
  CentroMedico,
  CentroMedicoRequest,
  FilterParams,
  Medico,
  MedicoRequest,
  MedicoStats,
  PageResponse,
  Usuario,
} from './types';

export const App: React.FC = () => {
  const { success, error, info } = useToast();
  const { usuario, isAuthenticated, isAdmin, adminExists, isRecoveryMode, setIsRecoveryMode } = useAuth();

  // Data states
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [pageData, setPageData] = useState<PageResponse<Medico> | null>(null);
  const [stats, setStats] = useState<MedicoStats | null>(null);
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [centros, setCentros] = useState<CentroMedico[]>([]);
  const [visitadores, setVisitadores] = useState<Usuario[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  // Filter params
  const [filters, setFilters] = useState<FilterParams>({
    page: 0,
    size: 10,
    sortBy: 'id',
    sortDir: 'desc',
    search: '',
    especialidad: '',
    estado: '',
    centroId: '',
    visitadorId: '',
  });

  // Modal states
  const [isMedicoModalOpen, setIsMedicoModalOpen] = useState(false);
  const [medicoToEdit, setMedicoToEdit] = useState<Medico | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMedico, setSelectedMedico] = useState<Medico | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [medicoToDelete, setMedicoToDelete] = useState<Medico | null>(null);

  const [isCentrosModalOpen, setIsCentrosModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminPanelInitialTab, setAdminPanelInitialTab] = useState<'usuarios' | 'zonas' | 'notificaciones'>('usuarios');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<
    'login' | 'register' | 'forgot-password' | 'update-password'
  >('login');

  const handleOpenAdminPanel = (tab: 'usuarios' | 'zonas' | 'notificaciones' = 'usuarios') => {
    setAdminPanelInitialTab(tab);
    setIsAdminPanelOpen(true);
  };

  const handleOpenCentros = () => {
    setIsCentrosModalOpen(true);
  };

  useEffect(() => {
    if (isRecoveryMode) {
      setAuthDefaultMode('update-password');
      setIsAuthModalOpen(true);
    }
  }, [isRecoveryMode]);

  // Fetch doctors
  const fetchMedicos = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await medicoService.listar(filters);
      setMedicos(res.content);
      setPageData(res);
    } catch (err: any) {
      error('Error al cargar médicos', err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, isAuthenticated, error]);

  // Fetch metadata: stats, specialties, centers, visitadores, notifications
  const fetchMetadata = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setStatsLoading(true);
      const promises: Promise<any>[] = [
        medicoService.obtenerEstadisticas().catch(() => null),
        medicoService.obtenerEspecialidades().catch(() => []),
        centroMedicoService.listarTodos().catch(() => []),
      ];

      if (isAdmin) {
        promises.push(
          usuarioService.listarTodos().catch(() => []),
          notificacionService.contarPendientes().catch(() => ({ pendientes: 0 }))
        );
      }

      const results = await Promise.all(promises);
      const statsRes = results[0];
      const espRes = results[1];
      const centrosRes = results[2];

      if (statsRes) setStats(statsRes);
      if (espRes) setEspecialidades(espRes);
      if (centrosRes) setCentros(centrosRes);

      if (isAdmin && results[3]) {
        const users = results[3] as Usuario[];
        setVisitadores(users.filter((u) => u.rol === 'VISITADOR'));
      }
      if (isAdmin && results[4]) {
        setUnreadNotifsCount(results[4].pendientes || 0);
      }
    } finally {
      setStatsLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (!isAuthenticated) {
      // Auto open login if not authenticated
      setIsAuthModalOpen(true);
    } else {
      fetchMedicos();
      fetchMetadata();
    }
  }, [isAuthenticated, fetchMedicos, fetchMetadata]);

  // Filter handlers
  const handleFilterChange = (newFilters: Partial<FilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 0,
      size: 10,
      sortBy: 'id',
      sortDir: 'desc',
      search: '',
      especialidad: '',
      estado: '',
      centroId: '',
      visitadorId: '',
    });
    info('Filtros restablecidos');
  };

  // Doctor CRUD
  const handleOpenNuevoMedico = () => {
    setMedicoToEdit(null);
    setIsMedicoModalOpen(true);
  };

  const handleOpenEditMedico = (medico: Medico) => {
    setMedicoToEdit(medico);
    setIsMedicoModalOpen(true);
  };

  const handleOpenViewMedico = (medico: Medico) => {
    setSelectedMedico(medico);
    setIsDetailModalOpen(true);
  };

  const handleOpenDeleteMedico = (medico: Medico) => {
    setMedicoToDelete(medico);
    setIsDeleteModalOpen(true);
  };

  const handleSaveMedico = async (data: MedicoRequest) => {
    try {
      if (medicoToEdit) {
        await medicoService.actualizar(medicoToEdit.id, data);
        success('Médico actualizado', `Dr(a). ${data.nombres} ${data.apellidos} guardado exitosamente.`);
      } else {
        await medicoService.crear(data);
        success('Médico registrado', `Dr(a). ${data.nombres} ${data.apellidos} ha sido asignado a su catálogo.`);
      }
      fetchMedicos();
      fetchMetadata();
    } catch (err: any) {
      error(
        medicoToEdit ? 'Error al actualizar médico' : 'Error al registrar médico',
        err.message || 'Verifique los datos ingresados.'
      );
      throw err;
    }
  };

  const handleConfirmDelete = async (id: number) => {
    try {
      await medicoService.eliminar(id);
      success('Médico eliminado', 'El registro y sus asociaciones fueron eliminados correctamente.');
      fetchMedicos();
      fetchMetadata();
    } catch (err: any) {
      error('Error al eliminar', err.message);
    }
  };

  // Medical Centers CRUD
  const handleSaveCentro = async (data: CentroMedicoRequest, id?: number) => {
    try {
      if (id) {
        await centroMedicoService.actualizar(id, data);
        success('Centro médico actualizado', data.nombre);
      } else {
        await centroMedicoService.crear(data);
        success('Centro médico registrado', data.nombre);
      }
      const updatedCentros = await centroMedicoService.listarTodos();
      setCentros(updatedCentros);
      fetchMetadata();
      fetchMedicos();
    } catch (err: any) {
      error('Error en centro médico', err.message);
      throw err;
    }
  };

  const handleDeleteCentro = async (id: number) => {
    try {
      await centroMedicoService.eliminar(id);
      success('Centro médico eliminado');
      const updatedCentros = await centroMedicoService.listarTodos();
      setCentros(updatedCentros);
      fetchMetadata();
      fetchMedicos();
    } catch (err: any) {
      error('Error al eliminar centro', err.message);
    }
  };

  const handleCentroCreated = (nuevoCentro: CentroMedico) => {
    setCentros((prev) => {
      if (prev.some((c) => c.id === nuevoCentro.id)) return prev;
      return [...prev, nuevoCentro].sort((a, b) => a.nombre.localeCompare(b.nombre));
    });
    success('Centro disponible', nuevoCentro.nombre);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation Bar */}
      <Navbar
        onOpenNuevoMedico={handleOpenNuevoMedico}
        onOpenCentros={() => setIsCentrosModalOpen(true)}
        onOpenAdminPanel={handleOpenAdminPanel}
        onOpenAuth={() => {
          setAuthDefaultMode('login');
          setIsAuthModalOpen(true);
        }}
        unreadNotifsCount={unreadNotifsCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAuthenticated && (
          <div className="p-8 mb-6 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
            {!adminExists ? (
              <>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-2">
                  👑 Configuración Inicial Requerida
                </div>
                <h2 className="text-xl font-bold text-slate-900">Bienvenido a MediCare</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  El sistema está listo para su empresa. Como primer usuario, regístrese a continuación para crear la cuenta de{' '}
                  <strong>Administrador General</strong> y habilitar la plataforma.
                </p>
                <button
                  onClick={() => {
                    setAuthDefaultMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="mt-4 px-6 py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition"
                >
                  Registrar Empresa y Administrador
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-900">Bienvenido a MediCare</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Inicie sesión con sus credenciales o solicite una cuenta como visitador médico para acceder al directorio.
                </p>
                <button
                  onClick={() => {
                    setAuthDefaultMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="mt-4 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
                >
                  Ingresar al Sistema
                </button>
              </>
            )}
          </div>
        )}

        {/* View for Admin */}
        {isAuthenticated && isAdmin && (
          <AdminView
            usuario={usuario}
            medicos={medicos}
            stats={stats}
            statsLoading={statsLoading}
            centros={centros}
            especialidades={especialidades}
            visitadores={visitadores}
            unreadNotifsCount={unreadNotifsCount}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            pageData={pageData}
            loading={loading}
            onOpenNuevoMedico={handleOpenNuevoMedico}
            onOpenCentros={handleOpenCentros}
            onOpenAdminPanel={handleOpenAdminPanel}
            onViewMedico={handleOpenViewMedico}
            onEditMedico={handleOpenEditMedico}
            onDeleteMedico={handleOpenDeleteMedico}
          />
        )}

        {/* Dedicated View for Visitador */}
        {isAuthenticated && !isAdmin && (
          <VisitadorView
            usuario={usuario}
            medicos={medicos}
            stats={stats}
            statsLoading={statsLoading}
            centros={centros}
            especialidades={especialidades}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            pageData={pageData}
            loading={loading}
            onOpenNuevoMedico={handleOpenNuevoMedico}
            onOpenCentros={handleOpenCentros}
            onViewMedico={handleOpenViewMedico}
            onEditMedico={handleOpenEditMedico}
            onDeleteMedico={handleOpenDeleteMedico}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          Directorio Médico MediCare • Roles ADMIN & VISITADOR con Aislamiento Estricto y Centros Compartidos
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setIsRecoveryMode(false);
        }}
        defaultMode={authDefaultMode}
      />

      <AdminPanelModal
        isOpen={isAdminPanelOpen && isAdmin}
        onClose={() => setIsAdminPanelOpen(false)}
        initialTab={adminPanelInitialTab}
        onDataChanged={() => {
          fetchMetadata();
          fetchMedicos();
        }}
      />

      <MedicoModal
        isOpen={isMedicoModalOpen}
        onClose={() => setIsMedicoModalOpen(false)}
        onSave={handleSaveMedico}
        medicoToEdit={medicoToEdit}
        centrosDisponibles={centros}
        especialidadesSugeridas={especialidades}
        onCentroCreated={handleCentroCreated}
      />

      <MedicoDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        medico={selectedMedico}
        onEdit={handleOpenEditMedico}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        medico={medicoToDelete}
        onConfirm={handleConfirmDelete}
      />

      <CentroMedicoModal
        isOpen={isCentrosModalOpen}
        onClose={() => setIsCentrosModalOpen(false)}
        centros={centros}
        isAdmin={isAdmin}
        onSaveCentro={handleSaveCentro}
        onDeleteCentro={handleDeleteCentro}
      />
    </div>
  );
};
