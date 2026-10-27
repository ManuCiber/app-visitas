package com.medicare.appvisitas.service;

import com.medicare.appvisitas.dto.AuthResponseDTO;
import com.medicare.appvisitas.dto.GoogleAuthRequestDTO;
import com.medicare.appvisitas.dto.LoginRequestDTO;
import com.medicare.appvisitas.dto.RegisterRequestDTO;
import com.medicare.appvisitas.dto.SetupStatusDTO;
import com.medicare.appvisitas.dto.UsuarioResponseDTO;

public interface AuthService {

    AuthResponseDTO login(LoginRequestDTO dto);

    AuthResponseDTO register(RegisterRequestDTO dto);

    AuthResponseDTO autenticarConGoogle(GoogleAuthRequestDTO dto);

    UsuarioResponseDTO obtenerPerfil(String correo);

    SetupStatusDTO checkSetupStatus();
}
