package com.medicare.appvisitas.service.impl;

import com.medicare.appvisitas.domain.model.CentroMedico;
import com.medicare.appvisitas.domain.model.EstadoMedico;
import com.medicare.appvisitas.domain.model.Rol;
import com.medicare.appvisitas.domain.model.Usuario;
import com.medicare.appvisitas.domain.repository.CentroMedicoRepository;
import com.medicare.appvisitas.domain.repository.MedicoRepository;
import com.medicare.appvisitas.dto.CentroMedicoRequestDTO;
import com.medicare.appvisitas.dto.CentroMedicoResponseDTO;
import com.medicare.appvisitas.exception.DuplicateResourceException;
import com.medicare.appvisitas.exception.ResourceNotFoundException;
import com.medicare.appvisitas.service.CentroMedicoService;
import java.util.List;
import java.util.Optional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CentroMedicoServiceImpl implements CentroMedicoService {

    private final CentroMedicoRepository centroMedicoRepository;
    private final MedicoRepository medicoRepository;

    public CentroMedicoServiceImpl(
            CentroMedicoRepository centroMedicoRepository,
            MedicoRepository medicoRepository
    ) {
        this.centroMedicoRepository = centroMedicoRepository;
        this.medicoRepository = medicoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CentroMedicoResponseDTO> listarTodos() {
        return centroMedicoRepository.findAllByOrderByNombreAsc()
                .stream()
                .map(CentroMedicoResponseDTO::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CentroMedicoResponseDTO> listarActivos() {
        return centroMedicoRepository.findByEstadoOrderByNombreAsc(EstadoMedico.ACTIVO)
                .stream()
                .map(CentroMedicoResponseDTO::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CentroMedicoResponseDTO obtenerPorId(Long id) {
        CentroMedico centro = centroMedicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Centro médico no encontrado con el id: " + id));
        return CentroMedicoResponseDTO.fromEntity(centro);
    }

    @Override
    public CentroMedicoResponseDTO crear(CentroMedicoRequestDTO dto) {
        String nombreNormalizado = normalizarNombre(dto.getNombre());

        if (centroMedicoRepository.existsByNombreIgnoreCase(nombreNormalizado)) {
            throw new DuplicateResourceException("Ya existe un centro médico registrado con el nombre: " + nombreNormalizado);
        }

        CentroMedico centro = new CentroMedico();
        mapearDtoAEntidad(dto, centro, nombreNormalizado);

        CentroMedico guardado = centroMedicoRepository.save(centro);
        return CentroMedicoResponseDTO.fromEntity(guardado);
    }

    @Override
    public CentroMedicoResponseDTO crearOReutilizar(CentroMedicoRequestDTO dto) {
        String nombreNormalizado = normalizarNombre(dto.getNombre());

        // Si ya existe, se reutiliza
        Optional<CentroMedico> existente = centroMedicoRepository.findByNombreIgnoreCase(nombreNormalizado);
        if (existente.isPresent()) {
            return CentroMedicoResponseDTO.fromEntity(existente.get());
        }

        CentroMedico centro = new CentroMedico();
        mapearDtoAEntidad(dto, centro, nombreNormalizado);

        CentroMedico guardado = centroMedicoRepository.save(centro);
        return CentroMedicoResponseDTO.fromEntity(guardado);
    }

    @Override
    public CentroMedicoResponseDTO actualizar(Long id, CentroMedicoRequestDTO dto, Usuario usuarioActual) {
        CentroMedico centro = centroMedicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Centro médico no encontrado con el id: " + id));

        // Control de autorización para visitadores: no modificar centros usados por otros usuarios
        if (usuarioActual != null && usuarioActual.getRol() == Rol.VISITADOR) {
            long usadosPorOtros = medicoRepository.countCentrosUsadosPorOtros(id, usuarioActual.getId());
            if (usadosPorOtros > 0) {
                throw new AccessDeniedException("No tiene autorización para modificar un centro médico utilizado por otros visitadores.");
            }
        }

        String nombreNormalizado = normalizarNombre(dto.getNombre());
        if (centroMedicoRepository.existsByNombreIgnoreCaseAndIdNot(nombreNormalizado, id)) {
            throw new DuplicateResourceException("Ya existe otro centro médico registrado con el nombre: " + nombreNormalizado);
        }

        mapearDtoAEntidad(dto, centro, nombreNormalizado);
        CentroMedico actualizado = centroMedicoRepository.save(centro);
        return CentroMedicoResponseDTO.fromEntity(actualizado);
    }

    @Override
    public void eliminar(Long id, Usuario usuarioActual) {
        CentroMedico centro = centroMedicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Centro médico no encontrado con el id: " + id));

        // Control de autorización para visitadores: no eliminar centros usados por otros usuarios
        if (usuarioActual != null && usuarioActual.getRol() == Rol.VISITADOR) {
            long usadosPorOtros = medicoRepository.countCentrosUsadosPorOtros(id, usuarioActual.getId());
            if (usadosPorOtros > 0) {
                throw new AccessDeniedException("No tiene autorización para eliminar un centro médico compartido utilizado por otros visitadores.");
            }
        }

        long totalUsos = medicoRepository.countByCentrosMedicos_Id(id);
        if (totalUsos > 0 && (usuarioActual == null || usuarioActual.getRol() != Rol.ADMIN)) {
            throw new DuplicateResourceException("No se puede eliminar el centro médico porque está asignado a " + totalUsos + " médico(s). Desvincúlelo primero.");
        }

        centroMedicoRepository.delete(centro);
    }

    private String normalizarNombre(String nombre) {
        if (nombre == null) return "";
        return nombre.trim().replaceAll("\\s+", " ");
    }

    private void mapearDtoAEntidad(CentroMedicoRequestDTO dto, CentroMedico centro, String nombreNormalizado) {
        centro.setNombre(nombreNormalizado);
        centro.setDireccion(dto.getDireccion() != null ? dto.getDireccion().trim() : "");
        centro.setTelefono(dto.getTelefono() != null ? dto.getTelefono().trim() : null);
        centro.setCiudad(dto.getCiudad() != null ? dto.getCiudad().trim() : null);
        centro.setEstado(dto.getEstado() != null ? dto.getEstado() : EstadoMedico.ACTIVO);
    }
}
