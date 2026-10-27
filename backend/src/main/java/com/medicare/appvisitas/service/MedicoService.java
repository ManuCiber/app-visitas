package com.medicare.appvisitas.service;

import com.medicare.appvisitas.domain.model.EstadoMedico;
import com.medicare.appvisitas.domain.model.Usuario;
import com.medicare.appvisitas.dto.MedicoRequestDTO;
import com.medicare.appvisitas.dto.MedicoResponseDTO;
import com.medicare.appvisitas.dto.PageResponseDTO;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Pageable;

public interface MedicoService {

    PageResponseDTO<MedicoResponseDTO> listarMedicos(
            Usuario usuarioActual,
            Pageable pageable,
            String search,
            String especialidad,
            EstadoMedico estado,
            Long centroId,
            Long filtroVisitadorId
    );

    MedicoResponseDTO obtenerPorId(Long id, Usuario usuarioActual);

    MedicoResponseDTO crear(MedicoRequestDTO dto, Usuario usuarioActual);

    MedicoResponseDTO actualizar(Long id, MedicoRequestDTO dto, Usuario usuarioActual);

    void eliminar(Long id, Usuario usuarioActual);

    List<String> obtenerEspecialidades(Usuario usuarioActual);

    Map<String, Object> obtenerEstadisticas(Usuario usuarioActual);
}
