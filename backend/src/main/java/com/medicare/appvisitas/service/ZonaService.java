package com.medicare.appvisitas.service;

import com.medicare.appvisitas.dto.ZonaDTO;
import java.util.List;

public interface ZonaService {

    List<ZonaDTO> listarTodas();

    List<ZonaDTO> listarActivas();

    ZonaDTO obtenerPorId(Long id);

    ZonaDTO crear(ZonaDTO dto);

    ZonaDTO actualizar(Long id, ZonaDTO dto);

    void eliminar(Long id);
}
