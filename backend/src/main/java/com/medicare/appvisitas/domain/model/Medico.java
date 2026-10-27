package com.medicare.appvisitas.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(
    name = "medicos",
    indexes = {
        @Index(name = "idx_medico_cedula", columnList = "cedula", unique = true),
        @Index(name = "idx_medico_exequatur", columnList = "exequatur", unique = true),
        @Index(name = "idx_medico_especialidad", columnList = "especialidad"),
        @Index(name = "idx_medico_estado", columnList = "estado")
    }
)
@EntityListeners(AuditingEntityListener.class)
public class Medico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombres;

    @Column(nullable = false, length = 100)
    private String apellidos;

    @Column(nullable = false, unique = true, length = 20)
    private String cedula;

    @Column(nullable = false, unique = true, length = 30)
    private String exequatur;

    @Column(nullable = false, length = 100)
    private String especialidad;

    @Column(nullable = false, length = 30)
    private String telefono;

    @Column(nullable = false, length = 120)
    private String correo;

    @Column(name = "direccion_profesional", nullable = false, length = 255)
    private String direccionProfesional;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoMedico estado = EstadoMedico.ACTIVO;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "medico_centro_medico",
        joinColumns = @JoinColumn(name = "medico_id", referencedColumnName = "id"),
        inverseJoinColumns = @JoinColumn(name = "centro_medico_id", referencedColumnName = "id"),
        uniqueConstraints = @UniqueConstraint(name = "uk_medico_centro_medico", columnNames = {"medico_id", "centro_medico_id"})
    )
    private Set<CentroMedico> centrosMedicos = new HashSet<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Medico() {
    }

    public void addCentroMedico(CentroMedico centro) {
        if (centro != null) {
            this.centrosMedicos.add(centro);
        }
    }

    public void removeCentroMedico(CentroMedico centro) {
        if (centro != null) {
            this.centrosMedicos.remove(centro);
        }
    }

    public void clearCentrosMedicos() {
        this.centrosMedicos.clear();
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

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Set<CentroMedico> getCentrosMedicos() {
        return centrosMedicos;
    }

    public void setCentrosMedicos(Set<CentroMedico> centrosMedicos) {
        this.centrosMedicos = centrosMedicos != null ? centrosMedicos : new HashSet<>();
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Medico medico = (Medico) o;
        return Objects.equals(id, medico.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
