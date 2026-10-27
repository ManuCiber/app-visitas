package com.medicare.appvisitas.service;

import com.medicare.appvisitas.domain.model.Usuario;
import com.medicare.appvisitas.dto.NotificacionResponseDTO;
import java.util.List;

public interface NotificacionService {

    void crearNotificacionNuevoUsuario(Usuario usuario);

    List<NotificacionResponseDTO> listarTodas();

    long contarPendientes();

    NotificacionResponseDTO marcarComoLeida(Long id);

    void marcarTodasComoLeidas();
}
