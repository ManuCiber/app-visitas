package com.medicare.appvisitas.dto;

import com.medicare.appvisitas.domain.model.Notificacion;
import java.time.LocalDateTime;

public class NotificacionResponseDTO {

    private Long id;
    private String tipo;
    private String titulo;
    private String mensaje;
    private Long usuarioRegistradoId;
    private boolean leida;
    private LocalDateTime createdAt;

    public NotificacionResponseDTO() {
    }

    public static NotificacionResponseDTO fromEntity(Notificacion notif) {
        if (notif == null) return null;
        NotificacionResponseDTO dto = new NotificacionResponseDTO();
        dto.setId(notif.getId());
        dto.setTipo(notif.getTipo());
        dto.setTitulo(notif.getTitulo());
        dto.setMensaje(notif.getMensaje());
        dto.setUsuarioRegistradoId(notif.getUsuarioRegistradoId());
        dto.setLeida(notif.isLeida());
        dto.setCreatedAt(notif.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public Long getUsuarioRegistradoId() {
        return usuarioRegistradoId;
    }

    public void setUsuarioRegistradoId(Long usuarioRegistradoId) {
        this.usuarioRegistradoId = usuarioRegistradoId;
    }

    public boolean isLeida() {
        return leida;
    }

    public void setLeida(boolean leida) {
        this.leida = leida;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
