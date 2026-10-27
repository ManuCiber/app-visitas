package com.medicare.appvisitas.controller;

import com.medicare.appvisitas.domain.model.Usuario;
import com.medicare.appvisitas.dto.AuthResponseDTO;
import com.medicare.appvisitas.dto.GoogleAuthRequestDTO;
import com.medicare.appvisitas.dto.LoginRequestDTO;
import com.medicare.appvisitas.dto.RegisterRequestDTO;
import com.medicare.appvisitas.dto.SetupStatusDTO;
import com.medicare.appvisitas.dto.UsuarioResponseDTO;
import com.medicare.appvisitas.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/setup-status")
    public ResponseEntity<SetupStatusDTO> checkSetupStatus() {
        return ResponseEntity.ok(authService.checkSetupStatus());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO dto) {
        AuthResponseDTO response = authService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponseDTO> googleAuth(@Valid @RequestBody GoogleAuthRequestDTO dto) {
        return ResponseEntity.ok(authService.autenticarConGoogle(dto));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> getProfile(@AuthenticationPrincipal Usuario usuarioActual) {
        return ResponseEntity.ok(authService.obtenerPerfil(usuarioActual.getUsername()));
    }
}
