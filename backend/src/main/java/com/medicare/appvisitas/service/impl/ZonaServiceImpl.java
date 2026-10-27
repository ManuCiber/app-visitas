package com.medicare.appvisitas.service.impl;

import com.medicare.appvisitas.domain.model.Zona;
import com.medicare.appvisitas.domain.repository.ZonaRepository;
import com.medicare.appvisitas.dto.ZonaDTO;
import com.medicare.appvisitas.exception.DuplicateResourceException;
import com.medicare.appvisitas.exception.ResourceNotFoundException;
import com.medicare.appvisitas.service.ZonaService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ZonaServiceImpl implements ZonaService {

    private final ZonaRepository zonaRepository;

    public ZonaServiceImpl(ZonaRepository zonaRepository) {
        this.zonaRepository = zonaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ZonaDTO> listarTodas() {
        return zonaRepository.findAllByOrderByNombreAsc()
                .stream()
                .map(ZonaDTO::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ZonaDTO> listarActivas() {
        return zonaRepository.findByActivoTrueOrderByNombreAsc()
                .stream()
                .map(ZonaDTO::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ZonaDTO obtenerPorId(Long id) {
        Zona zona = zonaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zona no encontrada con id: " + id));
        return ZonaDTO.fromEntity(zona);
    }

    @Override
    public ZonaDTO crear(ZonaDTO dto) {
        String nombreLimpio = dto.getNombre().trim();
        if (zonaRepository.existsByNombreIgnoreCase(nombreLimpio)) {
            throw new DuplicateResourceException("Ya existe una zona registrada con el nombre: " + nombreLimpio);
        }

        Zona zona = new Zona(nombreLimpio, dto.getDescripcion() != null ? dto.getDescripcion().trim() : null, dto.isActivo());
        Zona guardada = zonaRepository.save(zona);
        return ZonaDTO.fromEntity(guardada);
    }

    @Override
    public ZonaDTO actualizar(Long id, ZonaDTO dto) {
        Zona zona = zonaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zona no encontrada con id: " + id));

        String nombreLimpio = dto.getNombre().trim();
        if (zonaRepository.existsByNombreIgnoreCaseAndIdNot(nombreLimpio, id)) {
            throw new DuplicateResourceException("Ya existe otra zona registrada con el nombre: " + nombreLimpio);
        }

        zona.setNombre(nombreLimpio);
        zona.setDescripcion(dto.getDescripcion() != null ? dto.getDescripcion().trim() : null);
        zona.setActivo(dto.isActivo());

        Zona guardada = zonaRepository.save(zona);
        return ZonaDTO.fromEntity(guardada);
    }

    @Override
    public void eliminar(Long id) {
        Zona zona = zonaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zona no encontrada con id: " + id));
        zonaRepository.delete(zona);
    }
}
