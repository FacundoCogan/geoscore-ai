package GeoScore.AI.repositories;

import GeoScore.AI.entities.PoiEntity;
import GeoScore.AI.dto.PoiDistanciaDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.locationtech.jts.geom.Point;

import java.util.List;
import java.util.Map;

@Repository
public interface PoiRepository extends JpaRepository<PoiEntity, Long> {

    // Metodo para evitar duplicados
    boolean existsByNombreAndUbicacion(String nombre, Point ubicacion);

    // Metodo para el motor de Score interno
    @Query("SELECT new GeoScore.AI.dto.PoiDistanciaDTO(p.id, p.nombre, p.categoria, p.tipo, (ST_Distance(p.ubicacion, :ubicacion) * 111000.0)) " +
            "FROM PoiEntity p WHERE ST_Distance(p.ubicacion, :ubicacion) <= 0.018")
    List<PoiDistanciaDTO> findPoisInRange(@Param("ubicacion") Point ubicacion);

    // Usamos ST_Y y ST_X nativos de PostGIS en lugar de .y / .x
    @Query("SELECT new map(p.id as id, p.nombre as nombre, p.categoria as categoria, p.tipo as tipo, ST_Y(p.ubicacion) as lat, ST_X(p.ubicacion) as lng, (ST_Distance(p.ubicacion, :ubicacion) * 111000.0) as distancia) " +
            "FROM PoiEntity p WHERE ST_Distance(p.ubicacion, :ubicacion) <= 0.018")
    List<Map<String, Object>> findPoisForMapAndScore(@Param("ubicacion") Point ubicacion);
}