package GeoScore.AI.repositories;

import GeoScore.AI.entities.PoiEntity;
import GeoScore.AI.dto.PoiDistanciaDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.locationtech.jts.geom.Point;
import java.util.List;

@Repository
public interface PoiRepository extends JpaRepository<PoiEntity, Long> {

    // PostGIS: ST_DWithin busca en un radio de 2000 metros (2km)
    // ST_Distance calcula la distancia exacta para devolverla al front
    @Query(value = "SELECT id, nombre, categoria, tipo, ST_Distance(ubicacion, :propUbicacion, true) as distanciaMetros " +
            "FROM pois " +
            "WHERE ST_DWithin(ubicacion, :propUbicacion, 2000, true)",
            nativeQuery = true)
    List<PoiDistanciaDTO> findPoisInRange(@Param("propUbicacion") Point propUbicacion);
}