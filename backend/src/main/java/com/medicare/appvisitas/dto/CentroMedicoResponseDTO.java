package com.medicare.appvisitas.dto;

import com.medicare.appvisitas.domain.model.CentroMedico;
import com.medicare.appvisitas.domain.model.EstadoMedico;
import java.time.LocalDateTime;

public class CentroMedicoResponseDTO {

    private Long id;
    private String nombre;
    private String direccion;
    private String telefono;
    private String ciudad;
    private EstadoMedico estado;
    private int cantidadMedicos;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CentroMedicoResponseDTO() {
    }

    public static CentroMedicoResponseDTO fromEntity(CentroMedico centro) {
        if (centro == null) return null;
        CentroMedicoResponseDTO dto = new CentroMedicoResponseDTO();
        dto.setId(centro.getId());
        dto.setNombre(centro.getNombre());
        dto.setDireccion(centro.getDireccion());
        dto.setTelefono(centro.getTelefono());
        dto.setCiudad(centro.getCiudad());
        dto.setEstado(centro.getEstado());
        dto.setCantidadMedicos(centro.getMedicos() != null ? centro.getMedicos().size() : 0);
        dto.setCreatedAt(centro.getCreatedAt());
        dto.setUpdatedAt(centro.getUpdatedAt());
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

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getCiudad() {
        return ciudad;
    }

    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }

    public EstadoMedico getEstado() {
        return estado;
    }

    public void setEstado(EstadoMedico estado) {
        this.estado = estado;
    }

    public int getCantidadMedicos() {
        return cantidadMedicos;
    }

    public void setCantidadMedicos(int cantidadMedicos) {
        this.cantidadMedicos = cantidadMedicos;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
