package com.medicare.appvisitas.domain.repository;

import com.medicare.appvisitas.domain.model.Rol;
import com.medicare.appvisitas.domain.model.Usuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCorreoIgnoreCase(String correo);

    @Query("SELECT u FROM Usuario u LEFT JOIN FETCH u.zona WHERE LOWER(u.correo) = LOWER(:correo)")
    Optional<Usuario> findByCorreoWithZona(@Param("correo") String correo);

    boolean existsByCorreoIgnoreCase(String correo);

    boolean existsByCorreoIgnoreCaseAndIdNot(String correo, Long id);

    Optional<Usuario> findByGoogleId(String googleId);

    boolean existsByRol(Rol rol);

    long countByRol(Rol rol);

    List<Usuario> findByRolOrderByApellidosAscNombresAsc(Rol rol);

    @Query("SELECT u FROM Usuario u LEFT JOIN FETCH u.zona ORDER BY u.rol ASC, u.nombres ASC")
    List<Usuario> findAllWithZona();

    @Query("SELECT u FROM Usuario u LEFT JOIN FETCH u.zona WHERE u.id = :id")
    Optional<Usuario> findByIdWithZona(@Param("id") Long id);
}
