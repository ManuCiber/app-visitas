package com.medicare.appvisitas.domain.repository;

import com.medicare.appvisitas.domain.model.Zona;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ZonaRepository extends JpaRepository<Zona, Long> {

    Optional<Zona> findByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    List<Zona> findByActivoTrueOrderByNombreAsc();

    List<Zona> findAllByOrderByNombreAsc();
}
