package com.medicare.appvisitas.service;

import static org.junit.jupiter.api.Assertions.*;

import com.medicare.appvisitas.domain.model.*;
import com.medicare.appvisitas.domain.repository.*;
import com.medicare.appvisitas.dto.*;
import com.medicare.appvisitas.exception.DuplicateResourceException;
import com.medicare.appvisitas.exception.ResourceNotFoundException;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MedicoServiceTest {

    @Autowired
    private MedicoService medicoService;

    @Autowired
    private CentroMedicoService centroMedicoService;

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired
    private CentroMedicoRepository centroMedicoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ZonaRepository zonaRepository;

    @Autowired
    private NotificacionRepository notificacionRepository;

    private Usuario visitadorA;
    private Usuario visitadorB;
    private Usuario admin;
    private Long centroId1;
    private Long centroId2;

    @BeforeEach
    void setUp() {
        medicoRepository.deleteAll();
        centroMedicoRepository.deleteAll();
        usuarioRepository.deleteAll();
        zonaRepository.deleteAll();
        notificacionRepository.deleteAll();

        Zona zona1 = zonaRepository.save(new Zona("Zona Central", "Distrito Nacional", true));
        Zona zona2 = zonaRepository.save(new Zona("Zona Norte", "Santiago", true));

        visitadorA = usuarioRepository.save(new Usuario("Carlos", "Pérez", "carlos@medicare.do", "hash", Rol.VISITADOR, zona1));
        visitadorB = usuarioRepository.save(new Usuario("Laura", "Gómez", "laura@medicare.do", "hash", Rol.VISITADOR, zona2));
        admin = usuarioRepository.save(new Usuario("Admin", "Global", "admin@medicare.do", "hash", Rol.ADMIN, null));

        CentroMedico c1 = centroMedicoRepository.save(new CentroMedico("Hospital A", "Calle 1", "809111", "Santiago", EstadoMedico.ACTIVO));
        CentroMedico c2 = centroMedicoRepository.save(new CentroMedico("Clínica B", "Calle 2", "809222", "Santo Domingo", EstadoMedico.ACTIVO));
        centroId1 = c1.getId();
        centroId2 = c2.getId();
    }

    @Test
    @DisplayName("Fase 2: Visitador puede crear y consultar sus propios médicos")
    void debeCrearYConsultarSusPropiosMedicos() {
        MedicoRequestDTO dto = new MedicoRequestDTO();
        dto.setNombres("Juan");
        dto.setApellidos("Pérez");
        dto.setCedula("402-1234567-1");
        dto.setExequatur("EX-5544");
        dto.setEspecialidad("Cardiología");
        dto.setTelefono("809-555-1212");
        dto.setCorreo("juan.perez@test.com");
        dto.setDireccionProfesional("Torre Médica A");
        dto.setEstado(EstadoMedico.ACTIVO);
        dto.setCentrosMedicosIds(Set.of(centroId1, centroId2));

        MedicoResponseDTO creado = medicoService.crear(dto, visitadorA);

        assertNotNull(creado.getId());
        assertEquals("Juan Pérez", creado.getNombreCompleto());
        assertEquals(visitadorA.getId(), creado.getVisitadorId());

        MedicoResponseDTO consultado = medicoService.obtenerPorId(creado.getId(), visitadorA);
        assertEquals(creado.getId(), consultado.getId());
    }

    @Test
    @DisplayName("Fase 2 (Prueba obligatoria): Visitador no puede consultar médico de otro visitador")
    void debeImpedirAVisitadorConsultarMedicoDeOtro() {
        // Médico creado por visitador A
        MedicoRequestDTO dto = new MedicoRequestDTO();
        dto.setNombres("Juan");
        dto.setApellidos("Pérez");
        dto.setCedula("402-1234567-1");
        dto.setExequatur("EX-5544");
        dto.setEspecialidad("Cardiología");
        dto.setTelefono("809-555-1212");
        dto.setCorreo("juan@test.com");
        dto.setDireccionProfesional("Torre A");
        dto.setEstado(EstadoMedico.ACTIVO);
        MedicoResponseDTO medicoA = medicoService.crear(dto, visitadorA);

        // Visitador B intenta consultar médico de A -> debe lanzar AccessDeniedException
        assertThrows(AccessDeniedException.class, () -> medicoService.obtenerPorId(medicoA.getId(), visitadorB));
    }

    @Test
    @DisplayName("Fase 2 (Prueba obligatoria): Visitador no puede editar ni eliminar médico de otro visitador")
    void debeImpedirAVisitadorEditarOEliminarMedicoDeOtro() {
        // Médico creado por visitador A
        MedicoRequestDTO dto = new MedicoRequestDTO();
        dto.setNombres("Juan");
        dto.setApellidos("Pérez");
        dto.setCedula("402-1234567-1");
        dto.setExequatur("EX-5544");
        dto.setEspecialidad("Cardiología");
        dto.setTelefono("809-555-1212");
        dto.setCorreo("juan@test.com");
        dto.setDireccionProfesional("Torre A");
        dto.setEstado(EstadoMedico.ACTIVO);
        MedicoResponseDTO medicoA = medicoService.crear(dto, visitadorA);

        // Visitador B intenta modificar el médico de A
        dto.setNombres("Juan Modificado");
        assertThrows(AccessDeniedException.class, () -> medicoService.actualizar(medicoA.getId(), dto, visitadorB));

        // Visitador B intenta eliminar el médico de A
        assertThrows(AccessDeniedException.class, () -> medicoService.eliminar(medicoA.getId(), visitadorB));
    }

    @Test
    @DisplayName("Fase 2 (Prueba obligatoria): Administrador sí puede consultar todos los médicos")
    void debePermitirAlAdminConsultarTodosLosMedicos() {
        // Médico de Visitador A
        MedicoRequestDTO dto1 = new MedicoRequestDTO();
        dto1.setNombres("Juan");
        dto1.setApellidos("Pérez");
        dto1.setCedula("402-1111111-1");
        dto1.setExequatur("EX-1111");
        dto1.setEspecialidad("Cardiología");
        dto1.setTelefono("809-111-1111");
        dto1.setCorreo("juan@test.com");
        dto1.setDireccionProfesional("Torre A");
        dto1.setEstado(EstadoMedico.ACTIVO);
        MedicoResponseDTO m1 = medicoService.crear(dto1, visitadorA);

        // Médico de Visitador B
        MedicoRequestDTO dto2 = new MedicoRequestDTO();
        dto2.setNombres("Pedro");
        dto2.setApellidos("Gómez");
        dto2.setCedula("402-2222222-2");
        dto2.setExequatur("EX-2222");
        dto2.setEspecialidad("Pediatría");
        dto2.setTelefono("809-222-2222");
        dto2.setCorreo("pedro@test.com");
        dto2.setDireccionProfesional("Torre B");
        dto2.setEstado(EstadoMedico.ACTIVO);
        MedicoResponseDTO m2 = medicoService.crear(dto2, visitadorB);

        // El Administrador consulta m1 y m2 sin problemas
        MedicoResponseDTO res1 = medicoService.obtenerPorId(m1.getId(), admin);
        MedicoResponseDTO res2 = medicoService.obtenerPorId(m2.getId(), admin);
        assertEquals(m1.getId(), res1.getId());
        assertEquals(m2.getId(), res2.getId());

        // El listado de admin ve ambos médicos
        PageResponseDTO<MedicoResponseDTO> listadoAdmin = medicoService.listarMedicos(
                admin, PageRequest.of(0, 10), null, null, null, null, null
        );
        assertEquals(2, listadoAdmin.getTotalElements());

        // El listado de visitador A solo ve 1 médico
        PageResponseDTO<MedicoResponseDTO> listadoVisitadorA = medicoService.listarMedicos(
                visitadorA, PageRequest.of(0, 10), null, null, null, null, null
        );
        assertEquals(1, listadoVisitadorA.getTotalElements());
    }

    @Test
    @DisplayName("Fase 3: Si un centro médico ya existe, crearOReutilizar lo reutiliza")
    void debeReutilizarCentroMedicoSiExiste() {
        CentroMedicoRequestDTO nuevoCentro = new CentroMedicoRequestDTO(
                "Hospital A", "Calle 1", "809111", "Santiago", EstadoMedico.ACTIVO
        );

        CentroMedicoResponseDTO resultado = centroMedicoService.crearOReutilizar(nuevoCentro);

        // Debe reutilizar el ID existente de Hospital A
        assertEquals(centroId1, resultado.getId());
        assertEquals(2, centroMedicoRepository.count());
    }

    @Test
    @DisplayName("Fase 3: Visitador no puede eliminar un centro utilizado por médicos de otro visitador")
    void debeImpedirAVisitadorEliminarCentroUsadoPorOtro() {
        // Asociar centroId1 al médico de Visitador B
        MedicoRequestDTO dto = new MedicoRequestDTO();
        dto.setNombres("Pedro");
        dto.setApellidos("Gómez");
        dto.setCedula("402-3333333-3");
        dto.setExequatur("EX-3333");
        dto.setEspecialidad("Pediatría");
        dto.setTelefono("809-333-3333");
        dto.setCorreo("pedro3@test.com");
        dto.setDireccionProfesional("Torre B");
        dto.setEstado(EstadoMedico.ACTIVO);
        dto.setCentrosMedicosIds(Set.of(centroId1));
        medicoService.crear(dto, visitadorB);

        // Visitador A intenta eliminar el centroId1 usado por Visitador B
        assertThrows(AccessDeniedException.class, () -> centroMedicoService.eliminar(centroId1, visitadorA));
    }

    @Test
    @DisplayName("Fase 5: Notificación interna al registrar nuevo usuario y prevención de duplicados")
    void debeCrearNotificacionYPrevenirDuplicados() {
        Usuario nuevoUsuario = usuarioRepository.save(
                new Usuario("Ana", "Méndez", "ana@medicare.do", "hash", Rol.VISITADOR, null)
        );

        notificacionService.crearNotificacionNuevoUsuario(nuevoUsuario);
        assertEquals(1, notificacionRepository.count());
        assertTrue(notificacionRepository.countByLeidaFalse() > 0);

        // Reintento: no debe crear duplicado
        notificacionService.crearNotificacionNuevoUsuario(nuevoUsuario);
        assertEquals(1, notificacionRepository.count());
    }
}
