package com.medicare.appvisitas.service.impl;

import com.medicare.appvisitas.domain.model.Rol;
import com.medicare.appvisitas.domain.model.Usuario;
import com.medicare.appvisitas.domain.model.Zona;
import com.medicare.appvisitas.domain.repository.UsuarioRepository;
import com.medicare.appvisitas.domain.repository.ZonaRepository;
import com.medicare.appvisitas.dto.UsuarioResponseDTO;
import com.medicare.appvisitas.dto.UsuarioUpdateRequestDTO;
import com.medicare.appvisitas.exception.ResourceNotFoundException;
import com.medicare.appvisitas.service.UsuarioService;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ZonaRepository zonaRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioServiceImpl(
            UsuarioRepository usuarioRepository,
            ZonaRepository zonaRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.zonaRepository = zonaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAllWithZona()
                .stream()
                .map(UsuarioResponseDTO::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtenerPorId(Long id) {
        Usuario usuario = usuarioRepository.findByIdWithZona(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
        return UsuarioResponseDTO.fromEntity(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtenerPorCorreo(String correo) {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con correo: " + correo));
        return UsuarioResponseDTO.fromEntity(usuario);
    }

    @Override
    public UsuarioResponseDTO actualizar(Long id, UsuarioUpdateRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));

        usuario.setNombres(dto.getNombres().trim());
        usuario.setApellidos(dto.getApellidos().trim());

        if (dto.getRol() != null) {
            usuario.setRol(dto.getRol());
        }

        if (dto.getZonaId() != null) {
            Zona zona = zonaRepository.findById(dto.getZonaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Zona no encontrada con id: " + dto.getZonaId()));
            usuario.setZona(zona);
        } else if (dto.getRol() == Rol.ADMIN) {
            usuario.setZona(null);
        }

        if (dto.getActivo() != null) {
            usuario.setActivo(dto.getActivo());
        }

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(dto.getPassword().trim()));
        }

        Usuario guardado = usuarioRepository.save(usuario);
        return UsuarioResponseDTO.fromEntity(guardado);
    }

    @Override
    public UsuarioResponseDTO cambiarEstado(Long id, boolean activo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
        usuario.setActivo(activo);
        Usuario guardado = usuarioRepository.save(usuario);
        return UsuarioResponseDTO.fromEntity(guardado);
    }

    @Override
    public UsuarioResponseDTO cambiarRol(Long id, Rol nuevoRol) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));

        if (usuario.getRol() == nuevoRol) {
            return UsuarioResponseDTO.fromEntity(usuario);
        }

        // Salvaguarda: si se intenta revocar el rol de administrador, verificar que quede al menos otro administrador
        if (usuario.getRol() == Rol.ADMIN && nuevoRol != Rol.ADMIN) {
            long adminsTotal = usuarioRepository.countByRol(Rol.ADMIN);
            if (adminsTotal <= 1) {
                throw new IllegalStateException("No se puede revocar el rol del único administrador del sistema.");
            }
        }

        usuario.setRol(nuevoRol);

        // Al ascender a ADMIN, la cuenta se habilita de inmediato y se desasigna de zona médica exclusiva
        if (nuevoRol == Rol.ADMIN) {
            usuario.setActivo(true);
            usuario.setZona(null);
        }

        Usuario guardado = usuarioRepository.save(usuario);
        return UsuarioResponseDTO.fromEntity(guardado);
    }
}
