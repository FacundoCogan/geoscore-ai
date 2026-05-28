package GeoScore.AI.repositories;

import GeoScore.AI.entities.FavoritoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoritoRepository extends JpaRepository<FavoritoEntity, Long> {
    List<FavoritoEntity> findByUserId(String userId);
    Optional<FavoritoEntity> findByUserIdAndInmuebleId(String userId, String inmuebleId);
    void deleteByUserIdAndInmuebleId(String userId, String inmuebleId);
}