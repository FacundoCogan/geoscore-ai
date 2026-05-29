package GeoScore.AI.repositories;

import GeoScore.AI.entities.InmuebleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InmuebleRepository extends JpaRepository<InmuebleEntity, Long> {
}