package com.medicare.appvisitas.domain.repository;

import com.medicare.appvisitas.domain.model.CentroMedico;
import com.medicare.appvisitas.domain.model.EstadoMedico;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CentroMedicoRepository extends JpaRepository<CentroMedico, Long> {

    Optional<CentroMedico> findByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    List<CentroMedico> findByEstadoOrderByNombreAsc(EstadoMedico estado);

    List<CentroMedico> findAllByOrderByNombreAsc();
}
