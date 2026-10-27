package com.medicare.appvisitas.dto;

import com.medicare.appvisitas.domain.model.Zona;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ZonaDTO {

    private Long id;

    @NotBlank(message = "El nombre de la zona es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String nombre;

    @Size(max = 255, message = "La descripción no puede exceder 255 caracteres")
    private String descripcion;

    private boolean activo = true;

    public ZonaDTO() {
    }

    public static ZonaDTO fromEntity(Zona zona) {
        if (zona == null) return null;
        ZonaDTO dto = new ZonaDTO();
        dto.setId(zona.getId());
        dto.setNombre(zona.getNombre());
        dto.setDescripcion(zona.getDescripcion());
        dto.setActivo(zona.isActivo());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }
}
