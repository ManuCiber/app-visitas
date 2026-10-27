package com.medicare.appvisitas.service;

import com.medicare.appvisitas.domain.model.Usuario;
import com.medicare.appvisitas.dto.CentroMedicoRequestDTO;
import com.medicare.appvisitas.dto.CentroMedicoResponseDTO;
import java.util.List;

public interface CentroMedicoService {

    List<CentroMedicoResponseDTO> listarTodos();

    List<CentroMedicoResponseDTO> listarActivos();

    CentroMedicoResponseDTO obtenerPorId(Long id);

    CentroMedicoResponseDTO crear(CentroMedicoRequestDTO dto);

    CentroMedicoResponseDTO crearOReutilizar(CentroMedicoRequestDTO dto);

    CentroMedicoResponseDTO actualizar(Long id, CentroMedicoRequestDTO dto, Usuario usuarioActual);

    void eliminar(Long id, Usuario usuarioActual);
}
