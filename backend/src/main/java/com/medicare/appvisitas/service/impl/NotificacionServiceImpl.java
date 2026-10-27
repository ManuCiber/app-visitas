package com.medicare.appvisitas.service.impl;

import com.medicare.appvisitas.domain.model.Notificacion;
import com.medicare.appvisitas.domain.model.Usuario;
import com.medicare.appvisitas.domain.repository.NotificacionRepository;
import com.medicare.appvisitas.dto.NotificacionResponseDTO;
import com.medicare.appvisitas.exception.ResourceNotFoundException;
import com.medicare.appvisitas.service.NotificacionService;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotificacionServiceImpl implements NotificacionService {

    private final NotificacionRepository notificacionRepository;

    public NotificacionServiceImpl(NotificacionRepository notificacionRepository) {
        this.notificacionRepository = notificacionRepository;
    }

    @Override
    public void crearNotificacionNuevoUsuario(Usuario usuario) {
        if (usuario == null || usuario.getId() == null) {
            return;
        }

        // Prevención de duplicados ante reintentos
        if (notificacionRepository.existsByTipoAndUsuarioRegistradoId("NUEVO_USUARIO", usuario.getId())) {
            return;
        }

        String zonaTexto = (usuario.getZona() != null) ? usuario.getZona().getNombre() : "Sin zona asignada";
        String estadoTexto = usuario.isActivo() ? "Habilitada (Activa)" : "Pendiente de Aprobación";
        String fechaRegistro = usuario.getCreatedAt() != null
                ? usuario.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                : "Reciente";

        String titulo;
        String mensaje;

        if (usuario.getRol() == com.medicare.appvisitas.domain.model.Rol.ADMIN) {
            titulo = "Sistema Inicializado: Administrador Registrado";
            mensaje = String.format(
                    "Se ha registrado el Administrador General de la empresa: %s (%s).\nFecha: %s",
                    usuario.getNombreCompleto(),
                    usuario.getCorreo(),
                    fechaRegistro
            );
        } else {
            titulo = "Nuevo visitador pendiente de aprobación: " + usuario.getNombreCompleto();
            mensaje = String.format(
                    "El visitador %s (%s) se ha registrado y requiere aprobación para acceder al catálogo.\nZona: %s | Estado: %s | Fecha: %s",
                    usuario.getNombreCompleto(),
                    usuario.getCorreo(),
                    zonaTexto,
                    estadoTexto,
                    fechaRegistro
            );
        }

        Notificacion notif = new Notificacion("NUEVO_USUARIO", titulo, mensaje, usuario.getId());
        notificacionRepository.save(notif);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificacionResponseDTO> listarTodas() {
        return notificacionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(NotificacionResponseDTO::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long contarPendientes() {
        return notificacionRepository.countByLeidaFalse();
    }

    @Override
    public NotificacionResponseDTO marcarComoLeida(Long id) {
        Notificacion notif = notificacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notificación no encontrada con id: " + id));
        notif.setLeida(true);
        Notificacion guardada = notificacionRepository.save(notif);
        return NotificacionResponseDTO.fromEntity(guardada);
    }

    @Override
    public void marcarTodasComoLeidas() {
        List<Notificacion> pendientes = notificacionRepository.findByLeidaFalseOrderByCreatedAtDesc();
        for (Notificacion n : pendientes) {
            n.setLeida(true);
        }
        notificacionRepository.saveAll(pendientes);
    }
}
