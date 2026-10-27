package com.medicare.appvisitas.domain.repository;

import com.medicare.appvisitas.domain.model.Notificacion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findAllByOrderByCreatedAtDesc();

    List<Notificacion> findByLeidaFalseOrderByCreatedAtDesc();

    long countByLeidaFalse();

    boolean existsByTipoAndUsuarioRegistradoId(String tipo, Long usuarioRegistradoId);
}
