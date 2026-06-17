package GeoScore.AI.repositories;

import GeoScore.AI.entities.NotificacionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<NotificacionEntity, Long> {
    List<NotificacionEntity> findByUsuarioEmailOrderByFechaDesc(String usuarioEmail);
}