package com.medicare.appvisitas.service;

import com.medicare.appvisitas.domain.model.Rol;
import com.medicare.appvisitas.dto.UsuarioResponseDTO;
import com.medicare.appvisitas.dto.UsuarioUpdateRequestDTO;
import java.util.List;

public interface UsuarioService {

    List<UsuarioResponseDTO> listarTodos();

    UsuarioResponseDTO obtenerPorId(Long id);

    UsuarioResponseDTO obtenerPorCorreo(String correo);

    UsuarioResponseDTO actualizar(Long id, UsuarioUpdateRequestDTO dto);

    UsuarioResponseDTO cambiarEstado(Long id, boolean activo);

    UsuarioResponseDTO cambiarRol(Long id, Rol rol);
}
