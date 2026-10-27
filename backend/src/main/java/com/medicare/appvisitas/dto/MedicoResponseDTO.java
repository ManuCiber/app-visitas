package com.medicare.appvisitas.dto;

import com.medicare.appvisitas.domain.model.EstadoMedico;
import com.medicare.appvisitas.domain.model.Medico;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class MedicoResponseDTO {

    private Long id;
    private String nombres;
    private String apellidos;
    private String nombreCompleto;
    private String cedula;
    private String exequatur;
    private String especialidad;
    private String telefono;
    private String correo;
    private String direccionProfesional;
    private EstadoMedico estado;
    private String observaciones;
    private Long visitadorId;
    private String visitadorNombre;
    private String visitadorCorreo;
    private String zonaNombre;
    private List<CentroMedicoResponseDTO> centrosMedicos = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MedicoResponseDTO() {
    }

    public static MedicoResponseDTO fromEntity(Medico medico) {
        if (medico == null) return null;
        MedicoResponseDTO dto = new MedicoResponseDTO();
        dto.setId(medico.getId());
        dto.setNombres(medico.getNombres());
        dto.setApellidos(medico.getApellidos());
        dto.setNombreCompleto(medico.getNombres() + " " + medico.getApellidos());
        dto.setCedula(medico.getCedula());
        dto.setExequatur(medico.getExequatur());
        dto.setEspecialidad(medico.getEspecialidad());
        dto.setTelefono(medico.getTelefono());
        dto.setCorreo(medico.getCorreo());
        dto.setDireccionProfesional(medico.getDireccionProfesional());
        dto.setEstado(medico.getEstado());
        dto.setObservaciones(medico.getObservaciones());
        if (medico.getUsuario() != null) {
            dto.setVisitadorId(medico.getUsuario().getId());
            dto.setVisitadorNombre(medico.getUsuario().getNombreCompleto());
            dto.setVisitadorCorreo(medico.getUsuario().getCorreo());
            try {
                if (medico.getUsuario().getZona() != null) {
                    dto.setZonaNombre(medico.getUsuario().getZona().getNombre());
                }
            } catch (Exception ignored) {
                // Protección ante proxies de zona no inicializados fuera de sesión
            }
        }
        dto.setCreatedAt(medico.getCreatedAt());
        dto.setUpdatedAt(medico.getUpdatedAt());

        if (medico.getCentrosMedicos() != null) {
            List<CentroMedicoResponseDTO> centros = medico.getCentrosMedicos().stream()
                    .map(cm -> {
                        CentroMedicoResponseDTO cmDto = new CentroMedicoResponseDTO();
                        cmDto.setId(cm.getId());
                        cmDto.setNombre(cm.getNombre());
                        cmDto.setDireccion(cm.getDireccion());
                        cmDto.setTelefono(cm.getTelefono());
                        cmDto.setCiudad(cm.getCiudad());
                        cmDto.setEstado(cm.getEstado());
                        return cmDto;
                    })
                    .sorted(Comparator.comparing(CentroMedicoResponseDTO::getNombre, String.CASE_INSENSITIVE_ORDER))
                    .toList();
            dto.setCentrosMedicos(centros);
        }

        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
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

    public Long getVisitadorId() {
        return visitadorId;
    }

    public void setVisitadorId(Long visitadorId) {
        this.visitadorId = visitadorId;
    }

    public String getVisitadorNombre() {
        return visitadorNombre;
    }

    public void setVisitadorNombre(String visitadorNombre) {
        this.visitadorNombre = visitadorNombre;
    }

    public String getVisitadorCorreo() {
        return visitadorCorreo;
    }

    public void setVisitadorCorreo(String visitadorCorreo) {
        this.visitadorCorreo = visitadorCorreo;
    }

    public String getZonaNombre() {
        return zonaNombre;
    }

    public void setZonaNombre(String zonaNombre) {
        this.zonaNombre = zonaNombre;
    }

    public List<CentroMedicoResponseDTO> getCentrosMedicos() {
        return centrosMedicos;
    }

    public void setCentrosMedicos(List<CentroMedicoResponseDTO> centrosMedicos) {
        this.centrosMedicos = centrosMedicos != null ? centrosMedicos : new ArrayList<>();
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
