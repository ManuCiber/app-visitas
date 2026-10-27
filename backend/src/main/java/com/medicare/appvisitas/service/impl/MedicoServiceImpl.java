package com.medicare.appvisitas.service.impl;

import com.medicare.appvisitas.domain.model.CentroMedico;
import com.medicare.appvisitas.domain.model.EstadoMedico;
import com.medicare.appvisitas.domain.model.Medico;
import com.medicare.appvisitas.domain.model.Rol;
import com.medicare.appvisitas.domain.model.Usuario;
import com.medicare.appvisitas.domain.repository.CentroMedicoRepository;
import com.medicare.appvisitas.domain.repository.MedicoRepository;
import com.medicare.appvisitas.domain.repository.UsuarioRepository;
import com.medicare.appvisitas.dto.MedicoRequestDTO;
import com.medicare.appvisitas.dto.MedicoResponseDTO;
import com.medicare.appvisitas.dto.PageResponseDTO;
import com.medicare.appvisitas.exception.DuplicateResourceException;
import com.medicare.appvisitas.exception.ResourceNotFoundException;
import com.medicare.appvisitas.service.MedicoService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MedicoServiceImpl implements MedicoService {

    private final MedicoRepository medicoRepository;
    private final CentroMedicoRepository centroMedicoRepository;
    private final UsuarioRepository usuarioRepository;

    public MedicoServiceImpl(
            MedicoRepository medicoRepository,
            CentroMedicoRepository centroMedicoRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.medicoRepository = medicoRepository;
        this.centroMedicoRepository = centroMedicoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<MedicoResponseDTO> listarMedicos(
            Usuario usuarioActual,
            Pageable pageable,
            String search,
            String especialidad,
            EstadoMedico estado,
            Long centroId,
            Long filtroVisitadorId
    ) {
        // SEGURIDAD & AISLAMIENTO ESTRICTO:
        // Si el usuario es VISITADOR, se fuerza su propio ID; no puede ver los médicos de otros.
        // Si es ADMIN, puede consultar todos los médicos o filtrar por un visitador específico.
        Long scopedUsuarioId = (usuarioActual.getRol() == Rol.ADMIN) ? filtroVisitadorId : usuarioActual.getId();

        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        String cleanEsp = (especialidad != null && !especialidad.isBlank()) ? especialidad.trim() : null;

        Page<Medico> page = medicoRepository.findByFiltros(scopedUsuarioId, cleanSearch, cleanEsp, estado, centroId, pageable);
        List<MedicoResponseDTO> dtos = page.getContent().stream()
                .map(MedicoResponseDTO::fromEntity)
                .toList();

        return PageResponseDTO.of(page, dtos);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicoResponseDTO obtenerPorId(Long id, Usuario usuarioActual) {
        Medico medico = medicoRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médico no encontrado con el ID: " + id));

        // AISLAMIENTO: Verificar propiedad si es visitador
        validarPropiedadMedico(medico, usuarioActual, "consultar");

        return MedicoResponseDTO.fromEntity(medico);
    }

    @Override
    public MedicoResponseDTO crear(MedicoRequestDTO dto, Usuario usuarioActual) {
        String cedulaLimpia = dto.getCedula().trim();
        String exequaturLimpio = dto.getExequatur().trim();

        if (medicoRepository.existsByCedula(cedulaLimpia)) {
            throw new DuplicateResourceException("Ya existe un médico registrado con la cédula: " + cedulaLimpia);
        }

        if (medicoRepository.existsByExequatur(exequaturLimpio)) {
            throw new DuplicateResourceException("Ya existe un médico registrado con el exequátur: " + exequaturLimpio);
        }

        Medico medico = new Medico();
        mapearDatosBasicos(dto, medico);

        // Asignación obligatoria del visitador responsable cargado en la sesión de persistencia actual
        Usuario usuarioPersistente = (usuarioActual != null && usuarioActual.getId() != null)
                ? usuarioRepository.findByIdWithZona(usuarioActual.getId()).orElse(usuarioActual)
                : usuarioActual;
        medico.setUsuario(usuarioPersistente);

        // Asociar centros médicos
        if (dto.getCentrosMedicosIds() != null && !dto.getCentrosMedicosIds().isEmpty()) {
            List<CentroMedico> centros = centroMedicoRepository.findAllById(dto.getCentrosMedicosIds());
            for (CentroMedico centro : centros) {
                medico.addCentroMedico(centro);
            }
        }

        Medico guardado = medicoRepository.save(medico);
        return MedicoResponseDTO.fromEntity(guardado);
    }

    @Override
    public MedicoResponseDTO actualizar(Long id, MedicoRequestDTO dto, Usuario usuarioActual) {
        Medico medico = medicoRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médico no encontrado con el ID: " + id));

        // AISLAMIENTO: Verificar propiedad si es visitador
        validarPropiedadMedico(medico, usuarioActual, "modificar");

        String cedulaLimpia = dto.getCedula().trim();
        String exequaturLimpio = dto.getExequatur().trim();

        if (medicoRepository.existsByCedulaAndIdNot(cedulaLimpia, id)) {
            throw new DuplicateResourceException("Ya existe otro médico registrado con la cédula: " + cedulaLimpia);
        }

        if (medicoRepository.existsByExequaturAndIdNot(exequaturLimpio, id)) {
            throw new DuplicateResourceException("Ya existe otro médico registrado con el exequátur: " + exequaturLimpio);
        }

        mapearDatosBasicos(dto, medico);

        // Actualizar centros médicos asociados
        medico.clearCentrosMedicos();
        if (dto.getCentrosMedicosIds() != null && !dto.getCentrosMedicosIds().isEmpty()) {
            List<CentroMedico> centros = centroMedicoRepository.findAllById(dto.getCentrosMedicosIds());
            for (CentroMedico centro : centros) {
                medico.addCentroMedico(centro);
            }
        }

        Medico actualizado = medicoRepository.save(medico);
        return MedicoResponseDTO.fromEntity(actualizado);
    }

    @Override
    public void eliminar(Long id, Usuario usuarioActual) {
        Medico medico = medicoRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médico no encontrado con el ID: " + id));

        // AISLAMIENTO: Verificar propiedad si es visitador
        validarPropiedadMedico(medico, usuarioActual, "eliminar");

        medico.clearCentrosMedicos();
        medicoRepository.delete(medico);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> obtenerEspecialidades(Usuario usuarioActual) {
        Long scopedUsuarioId = (usuarioActual.getRol() == Rol.ADMIN) ? null : usuarioActual.getId();
        return medicoRepository.findDistinctEspecialidades(scopedUsuarioId);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerEstadisticas(Usuario usuarioActual) {
        Map<String, Object> stats = new HashMap<>();

        if (usuarioActual.getRol() == Rol.ADMIN) {
            stats.put("totalMedicos", medicoRepository.count());
            stats.put("medicosActivos", medicoRepository.countByEstado(EstadoMedico.ACTIVO));
            stats.put("medicosInactivos", medicoRepository.countByEstado(EstadoMedico.INACTIVO));
            stats.put("totalEspecialidades", medicoRepository.findDistinctEspecialidades(null).size());
            stats.put("totalCentros", centroMedicoRepository.count());
        } else {
            Long userId = usuarioActual.getId();
            stats.put("totalMedicos", medicoRepository.countByUsuario_Id(userId));
            stats.put("medicosActivos", medicoRepository.countByUsuario_IdAndEstado(userId, EstadoMedico.ACTIVO));
            stats.put("medicosInactivos", medicoRepository.countByUsuario_IdAndEstado(userId, EstadoMedico.INACTIVO));
            stats.put("totalEspecialidades", medicoRepository.findDistinctEspecialidades(userId).size());
            stats.put("totalCentros", centroMedicoRepository.count());
        }

        return stats;
    }

    private void validarPropiedadMedico(Medico medico, Usuario usuarioActual, String accion) {
        if (usuarioActual.getRol() == Rol.ADMIN) {
            return; // El administrador tiene acceso a todos los médicos
        }

        if (medico.getUsuario() == null || !medico.getUsuario().getId().equals(usuarioActual.getId())) {
            throw new AccessDeniedException("Acceso denegado: no tiene autorización para " + accion + " los datos de un médico asignado a otro visitador.");
        }
    }

    private void mapearDatosBasicos(MedicoRequestDTO dto, Medico medico) {
        medico.setNombres(dto.getNombres().trim());
        medico.setApellidos(dto.getApellidos().trim());
        medico.setCedula(dto.getCedula().trim());
        medico.setExequatur(dto.getExequatur().trim());
        medico.setEspecialidad(dto.getEspecialidad().trim());
        medico.setTelefono(dto.getTelefono().trim());
        medico.setCorreo(dto.getCorreo().trim());
        medico.setDireccionProfesional(dto.getDireccionProfesional().trim());
        medico.setEstado(dto.getEstado() != null ? dto.getEstado() : EstadoMedico.ACTIVO);
        medico.setObservaciones(dto.getObservaciones() != null ? dto.getObservaciones().trim() : null);
    }
}
