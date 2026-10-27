package com.medicare.appvisitas.dto;

import com.medicare.appvisitas.domain.model.EstadoMedico;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.HashSet;
import java.util.Set;

public class MedicoRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    private String nombres;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(min = 2, max = 100, message = "El apellido debe tener entre 2 y 100 caracteres")
    private String apellidos;

    @NotBlank(message = "La cédula es obligatoria")
    @Pattern(regexp = "^\\d{3}-?\\d{7}-?\\d{1}$", message = "Formato de cédula inválido (ejemplo: 001-1234567-8)")
    private String cedula;

    @NotBlank(message = "El exequátur es obligatorio")
    @Size(min = 3, max = 30, message = "El exequátur debe tener entre 3 y 30 caracteres")
    private String exequatur;

    @NotBlank(message = "La especialidad es obligatoria")
    @Size(min = 3, max = 100, message = "La especialidad debe tener entre 3 y 100 caracteres")
    private String especialidad;

    @NotBlank(message = "El teléfono es obligatorio")
    @Size(min = 7, max = 30, message = "El teléfono debe tener un formato válido")
    private String telefono;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El formato del correo electrónico no es válido")
    @Size(max = 120, message = "El correo no puede exceder 120 caracteres")
    private String correo;

    @NotBlank(message = "La dirección profesional es obligatoria")
    @Size(min = 5, max = 255, message = "La dirección profesional debe tener entre 5 y 255 caracteres")
    private String direccionProfesional;

    @NotNull(message = "El estado es obligatorio")
    private EstadoMedico estado = EstadoMedico.ACTIVO;

    @Size(max = 1000, message = "Las observaciones no pueden exceder 1000 caracteres")
    private String observaciones;

    private Set<Long> centrosMedicosIds = new HashSet<>();

    public MedicoRequestDTO() {
    }

    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public String getExequatur() {
        return exequatur;
    }

    public void setExequatur(String exequatur) {
        this.exequatur = exequatur;
    }

    public String getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(String especialidad) {
        this.especialidad = especialidad;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getDireccionProfesional() {
        return direccionProfesional;
    }

    public void setDireccionProfesional(String direccionProfesional) {
        this.direccionProfesional = direccionProfesional;
    }

    public EstadoMedico getEstado() {
        return estado;
    }

    public void setEstado(EstadoMedico estado) {
        this.estado = estado;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public Set<Long> getCentrosMedicosIds() {
        return centrosMedicosIds;
    }

    public void setCentrosMedicosIds(Set<Long> centrosMedicosIds) {
        this.centrosMedicosIds = centrosMedicosIds != null ? centrosMedicosIds : new HashSet<>();
    }
}
