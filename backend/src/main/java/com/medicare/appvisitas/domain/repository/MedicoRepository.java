package com.medicare.appvisitas.domain.repository;

import com.medicare.appvisitas.domain.model.EstadoMedico;
import com.medicare.appvisitas.domain.model.Medico;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, Long> {

    boolean existsByCedula(String cedula);

    boolean existsByCedulaAndIdNot(String cedula, Long id);

    boolean existsByExequatur(String exequatur);

    boolean existsByExequaturAndIdNot(String exequatur, Long id);

    @Query("SELECT m FROM Medico m LEFT JOIN FETCH m.usuario u LEFT JOIN FETCH u.zona LEFT JOIN FETCH m.centrosMedicos WHERE m.id = :id")
    Optional<Medico> findByIdWithDetails(@Param("id") Long id);

    @Query("""
        SELECT DISTINCT m FROM Medico m
        LEFT JOIN m.centrosMedicos cm
        LEFT JOIN FETCH m.usuario u
        LEFT JOIN FETCH u.zona
        WHERE (:usuarioId IS NULL OR m.usuario.id = :usuarioId)
          AND (:search IS NULL OR :search = '' OR
               LOWER(m.nombres) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(m.apellidos) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(CONCAT(m.nombres, ' ', m.apellidos)) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(m.cedula) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(m.exequatur) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:especialidad IS NULL OR :especialidad = '' OR LOWER(m.especialidad) = LOWER(:especialidad))
          AND (:estado IS NULL OR m.estado = :estado)
          AND (:centroId IS NULL OR cm.id = :centroId)
    """)
    Page<Medico> findByFiltros(
            @Param("usuarioId") Long usuarioId,
            @Param("search") String search,
            @Param("especialidad") String especialidad,
            @Param("estado") EstadoMedico estado,
            @Param("centroId") Long centroId,
            Pageable pageable
    );

    @Query("""
        SELECT DISTINCT m.especialidad FROM Medico m
        WHERE (:usuarioId IS NULL OR m.usuario.id = :usuarioId)
          AND m.especialidad IS NOT NULL AND m.especialidad <> ''
        ORDER BY m.especialidad ASC
    """)
    List<String> findDistinctEspecialidades(@Param("usuarioId") Long usuarioId);

    long countByUsuario_Id(Long usuarioId);

    long countByUsuario_IdAndEstado(Long usuarioId, EstadoMedico estado);

    long countByEstado(EstadoMedico estado);

    long countByCentrosMedicos_Id(Long centroId);

    @Query("SELECT COUNT(m) FROM Medico m JOIN m.centrosMedicos cm WHERE cm.id = :centroId AND m.usuario.id <> :usuarioId")
    long countCentrosUsadosPorOtros(@Param("centroId") Long centroId, @Param("usuarioId") Long usuarioId);
}
