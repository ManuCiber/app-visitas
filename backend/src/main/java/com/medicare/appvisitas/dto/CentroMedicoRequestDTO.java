package com.medicare.appvisitas.dto;

import com.medicare.appvisitas.domain.model.EstadoMedico;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CentroMedicoRequestDTO {

    @NotBlank(message = "El nombre del centro médico es obligatorio")
    @Size(max = 150, message = "El nombre no puede exceder 150 caracteres")
    private String nombre;

    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 255, message = "La dirección no puede exceder 255 caracteres")
    private String direccion;

    @Size(max = 30, message = "El teléfono no puede exceder 30 caracteres")
    private String telefono;

    @Size(max = 100, message = "La ciudad no puede exceder 100 caracteres")
    private String ciudad;

    private EstadoMedico estado = EstadoMedico.ACTIVO;

    public CentroMedicoRequestDTO() {
    }

    public CentroMedicoRequestDTO(String nombre, String direccion, String telefono, String ciudad, EstadoMedico estado) {
        this.nombre = nombre;
        this.direccion = direccion;
        this.telefono = telefono;
        this.ciudad = ciudad;
        this.estado = estado != null ? estado : EstadoMedico.ACTIVO;
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
}
