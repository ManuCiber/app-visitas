package com.medicare.appvisitas.service.impl;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.medicare.appvisitas.domain.model.AuthProvider;
import com.medicare.appvisitas.domain.model.Rol;
import com.medicare.appvisitas.domain.model.Usuario;
import com.medicare.appvisitas.domain.model.Zona;
import com.medicare.appvisitas.domain.repository.UsuarioRepository;
import com.medicare.appvisitas.domain.repository.ZonaRepository;
import com.medicare.appvisitas.dto.AuthResponseDTO;
import com.medicare.appvisitas.dto.GoogleAuthRequestDTO;
import com.medicare.appvisitas.dto.LoginRequestDTO;
import com.medicare.appvisitas.dto.RegisterRequestDTO;
import com.medicare.appvisitas.dto.SetupStatusDTO;
import com.medicare.appvisitas.dto.UsuarioResponseDTO;
import com.medicare.appvisitas.exception.DuplicateResourceException;
import com.medicare.appvisitas.exception.ResourceNotFoundException;
import com.medicare.appvisitas.security.JwtService;
import com.medicare.appvisitas.service.AuthService;
import com.medicare.appvisitas.service.NotificacionService;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final ZonaRepository zonaRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final NotificacionService notificacionService;

    @Value("${application.security.google.client-id:}")
    private String googleClientId;

    public AuthServiceImpl(
            UsuarioRepository usuarioRepository,
            ZonaRepository zonaRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager,
            NotificacionService notificacionService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.zonaRepository = zonaRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.notificacionService = notificacionService;
    }

    @Override
    @Transactional(readOnly = true)
    public SetupStatusDTO checkSetupStatus() {
        boolean adminExists = usuarioRepository.existsByRol(Rol.ADMIN);
        long totalUsuarios = usuarioRepository.count();
        return new SetupStatusDTO(adminExists, totalUsuarios);
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO dto) {
        String correoLimpio = dto.getCorreo().trim().toLowerCase();

        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(correoLimpio)
                .orElseThrow(() -> new ResourceNotFoundException("Credenciales incorrectas o usuario no encontrado"));

        if (!usuario.isActivo()) {
            throw new DisabledException("Su cuenta está pendiente de aprobación por el Administrador de la empresa o ha sido desactivada. Comuníquese con el administrador.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(correoLimpio, dto.getPassword())
        );

        String token = jwtService.generateToken(usuario);
        return new AuthResponseDTO(token, UsuarioResponseDTO.fromEntity(usuario), "Inicio de sesión exitoso.");
    }

    @Override
    public AuthResponseDTO register(RegisterRequestDTO dto) {
        String correoLimpio = dto.getCorreo().trim().toLowerCase();

        if (usuarioRepository.existsByCorreoIgnoreCase(correoLimpio)) {
            throw new DuplicateResourceException("Ya existe una cuenta registrada con el correo: " + correoLimpio);
        }

        Zona zona = null;
        if (dto.getZonaId() != null) {
            zona = zonaRepository.findById(dto.getZonaId()).orElse(null);
        }

        // Si no existe ningún administrador en la empresa/sistema, este primer registro será el ADMINISTRADOR.
        // Los siguientes registros serán VISITADORES y quedarán pendientes de aprobación.
        boolean esPrimerUsuario = !usuarioRepository.existsByRol(Rol.ADMIN);

        Usuario usuario = new Usuario();
        usuario.setNombres(dto.getNombres().trim());
        usuario.setApellidos(dto.getApellidos().trim());
        usuario.setCorreo(correoLimpio);
        usuario.setPassword(passwordEncoder.encode(dto.getPassword().trim()));
        usuario.setZona(zona);
        usuario.setAuthProvider(AuthProvider.LOCAL);

        if (esPrimerUsuario) {
            usuario.setRol(Rol.ADMIN);
            usuario.setActivo(true);
            Usuario guardado = usuarioRepository.save(usuario);

            notificacionService.crearNotificacionNuevoUsuario(guardado);
            String token = jwtService.generateToken(guardado);
            return new AuthResponseDTO(token, UsuarioResponseDTO.fromEntity(guardado), "Cuenta de Administrador General creada e inicializada exitosamente.");
        } else {
            usuario.setRol(Rol.VISITADOR);
            usuario.setActivo(false); // Requiere aprobación del administrador
            Usuario guardado = usuarioRepository.save(usuario);

            notificacionService.crearNotificacionNuevoUsuario(guardado);
            return new AuthResponseDTO(
                    null,
                    UsuarioResponseDTO.fromEntity(guardado),
                    "Registro completado exitosamente. Su cuenta está pendiente de aprobación por el Administrador antes de poder iniciar sesión."
            );
        }
    }

    @Override
    public AuthResponseDTO autenticarConGoogle(GoogleAuthRequestDTO dto) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new IllegalStateException("La autenticación con Google no está configurada en el servidor. Debe definirse la variable de entorno GOOGLE_CLIENT_ID.");
        }

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken;
        try {
            idToken = verifier.verify(dto.getIdToken());
        } catch (Exception e) {
            throw new IllegalArgumentException("Error al verificar el token de Google: " + e.getMessage());
        }

        if (idToken == null) {
            throw new IllegalArgumentException("Token de Google inválido o expirado");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String googleId = payload.getSubject();
        String email = payload.getEmail().toLowerCase();
        String givenName = (String) payload.get("given_name");
        String familyName = (String) payload.get("family_name");

        if (givenName == null) givenName = "Usuario";
        if (familyName == null) familyName = "Google";

        // 1. Buscar si ya existe por Google ID
        Optional<Usuario> usuarioPorGoogle = usuarioRepository.findByGoogleId(googleId);
        if (usuarioPorGoogle.isPresent()) {
            Usuario u = usuarioPorGoogle.get();
            if (!u.isActivo()) {
                throw new DisabledException("Su cuenta está pendiente de aprobación por el Administrador de la empresa o ha sido desactivada.");
            }
            String token = jwtService.generateToken(u);
            return new AuthResponseDTO(token, UsuarioResponseDTO.fromEntity(u), "Sesión iniciada con Google.");
        }

        // 2. Buscar si ya existe por correo electrónico
        Optional<Usuario> usuarioPorCorreo = usuarioRepository.findByCorreoIgnoreCase(email);
        if (usuarioPorCorreo.isPresent()) {
            Usuario u = usuarioPorCorreo.get();
            // SEGURIDAD: No vincular automáticamente solo por coincidencia de correo
            if (u.getAuthProvider() == AuthProvider.LOCAL && u.getGoogleId() == null) {
                throw new DuplicateResourceException(
                        "Ya existe una cuenta con este correo registrada mediante contraseña local. " +
                        "Por seguridad, inicie sesión con su contraseña local en lugar de vincular automáticamente."
                );
            }
        }

        // 3. Crear nuevo usuario mediante Google
        Zona zona = null;
        if (dto.getZonaId() != null) {
            zona = zonaRepository.findById(dto.getZonaId()).orElse(null);
        }

        boolean esPrimerUsuario = !usuarioRepository.existsByRol(Rol.ADMIN);

        Usuario nuevo = new Usuario();
        nuevo.setNombres(givenName);
        nuevo.setApellidos(familyName);
        nuevo.setCorreo(email);
        // Password aleatorio seguro e inútil ya que autentica vía Google
        nuevo.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        nuevo.setZona(zona);
        nuevo.setGoogleId(googleId);
        nuevo.setAuthProvider(AuthProvider.GOOGLE);

        if (esPrimerUsuario) {
            nuevo.setRol(Rol.ADMIN);
            nuevo.setActivo(true);
            Usuario guardado = usuarioRepository.save(nuevo);
            notificacionService.crearNotificacionNuevoUsuario(guardado);
            String token = jwtService.generateToken(guardado);
            return new AuthResponseDTO(token, UsuarioResponseDTO.fromEntity(guardado), "Cuenta de Administrador General registrada con Google.");
        } else {
            nuevo.setRol(Rol.VISITADOR);
            nuevo.setActivo(false); // Requiere aprobación
            Usuario guardado = usuarioRepository.save(nuevo);
            notificacionService.crearNotificacionNuevoUsuario(guardado);
            return new AuthResponseDTO(
                    null,
                    UsuarioResponseDTO.fromEntity(guardado),
                    "Registro con Google exitoso. Su cuenta está pendiente de aprobación por el Administrador antes de poder ingresar."
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtenerPerfil(String correo) {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con correo: " + correo));
        return UsuarioResponseDTO.fromEntity(usuario);
    }
}
