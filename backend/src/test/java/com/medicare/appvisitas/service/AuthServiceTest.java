package com.medicare.appvisitas.service;

import static org.junit.jupiter.api.Assertions.*;

import com.medicare.appvisitas.domain.model.Rol;
import com.medicare.appvisitas.domain.repository.NotificacionRepository;
import com.medicare.appvisitas.domain.repository.UsuarioRepository;
import com.medicare.appvisitas.dto.AuthResponseDTO;
import com.medicare.appvisitas.dto.LoginRequestDTO;
import com.medicare.appvisitas.dto.RegisterRequestDTO;
import com.medicare.appvisitas.dto.SetupStatusDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.DisabledException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private NotificacionRepository notificacionRepository;

    @BeforeEach
    void setUp() {
        notificacionRepository.deleteAll();
        usuarioRepository.deleteAll();
    }

    @Test
    @DisplayName("El primer usuario en registrarse debe ser ADMIN y quedar activo automáticamente")
    void primerUsuarioDebeSerAdminYActivo() {
        SetupStatusDTO statusInicial = authService.checkSetupStatus();
        assertFalse(statusInicial.isAdminExists(), "Inicialmente no debe existir admin");

        RegisterRequestDTO dtoAdmin = new RegisterRequestDTO();
        dtoAdmin.setNombres("Super");
        dtoAdmin.setApellidos("Admin");
        dtoAdmin.setCorreo("admin.empresa@test.com");
        dtoAdmin.setPassword("AdminPass123!");

        AuthResponseDTO respAdmin = authService.register(dtoAdmin);

        assertNotNull(respAdmin.getToken(), "El administrador debe recibir token inmediato");
        assertEquals(Rol.ADMIN, respAdmin.getUsuario().getRol());
        assertTrue(respAdmin.getUsuario().isActivo());

        SetupStatusDTO statusDespues = authService.checkSetupStatus();
        assertTrue(statusDespues.isAdminExists(), "Ahora sí debe existir admin");
    }

    @Test
    @DisplayName("Los usuarios posteriores deben registrarse como VISITADOR inactivos (pendientes de aprobación)")
    void usuariosPosterioresDebenSerVisitadoresInactivos() {
        // 1. Registro del primer admin
        RegisterRequestDTO dtoAdmin = new RegisterRequestDTO();
        dtoAdmin.setNombres("Super");
        dtoAdmin.setApellidos("Admin");
        dtoAdmin.setCorreo("admin@test.com");
        dtoAdmin.setPassword("AdminPass123!");
        authService.register(dtoAdmin);

        // 2. Registro de segundo usuario (visitador)
        RegisterRequestDTO dtoVisitador = new RegisterRequestDTO();
        dtoVisitador.setNombres("Visitador");
        dtoVisitador.setApellidos("Nuevo");
        dtoVisitador.setCorreo("visitador.nuevo@test.com");
        dtoVisitador.setPassword("VisitadorPass123!");

        AuthResponseDTO respVisitador = authService.register(dtoVisitador);

        assertNull(respVisitador.getToken(), "El visitador no debe recibir token hasta ser aprobado");
        assertEquals(Rol.VISITADOR, respVisitador.getUsuario().getRol());
        assertFalse(respVisitador.getUsuario().isActivo(), "Debe quedar inactivo / pendiente");

        // 3. Intento de login debe lanzar DisabledException
        LoginRequestDTO loginDto = new LoginRequestDTO();
        loginDto.setCorreo("visitador.nuevo@test.com");
        loginDto.setPassword("VisitadorPass123!");

        assertThrows(DisabledException.class, () -> authService.login(loginDto),
                "Debe denegar inicio de sesión a usuarios no aprobados");

        // 4. Admin aprueba la cuenta
        usuarioService.cambiarEstado(respVisitador.getUsuario().getId(), true);

        // 5. Ahora sí puede iniciar sesión
        AuthResponseDTO loginExitoso = authService.login(loginDto);
        assertNotNull(loginExitoso.getToken(), "Tras aprobación debe recibir token válido");
        assertTrue(loginExitoso.getUsuario().isActivo());
    }

    @Test
    @DisplayName("El administrador puede promover a otro usuario al rol ADMIN")
    void adminPuedePromoverAOtroUsuarioAAdmin() {
        // 1. Registro del primer admin
        RegisterRequestDTO dtoAdmin = new RegisterRequestDTO();
        dtoAdmin.setNombres("Primer");
        dtoAdmin.setApellidos("Admin");
        dtoAdmin.setCorreo("primer.admin@test.com");
        dtoAdmin.setPassword("Pass123!");
        AuthResponseDTO admin1 = authService.register(dtoAdmin);

        // 2. Registro de un visitador
        RegisterRequestDTO dtoVisitador = new RegisterRequestDTO();
        dtoVisitador.setNombres("Usuario");
        dtoVisitador.setApellidos("Visitador");
        dtoVisitador.setCorreo("visitador@test.com");
        dtoVisitador.setPassword("Pass123!");
        AuthResponseDTO visitador = authService.register(dtoVisitador);
        assertEquals(Rol.VISITADOR, visitador.getUsuario().getRol());

        // 3. Administrador promueve al visitador a ADMIN
        var usuarioPromovido = usuarioService.cambiarRol(visitador.getUsuario().getId(), Rol.ADMIN);
        assertEquals(Rol.ADMIN, usuarioPromovido.getRol());
        assertTrue(usuarioPromovido.isActivo(), "Al ascender a admin la cuenta debe quedar habilitada");

        // 4. Se comprueba que ahora existen 2 administradores
        assertEquals(2, usuarioRepository.countByRol(Rol.ADMIN));
    }
}
