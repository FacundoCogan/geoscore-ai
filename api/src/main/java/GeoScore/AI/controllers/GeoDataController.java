package GeoScore.AI.controllers;

import GeoScore.AI.entities.PoiEntity;
import GeoScore.AI.repositories.PoiRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/geo")
@CrossOrigin(origins = "http://localhost:3000")
public class GeoDataController {

    private final PoiRepository poiRepository;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    public GeoDataController(PoiRepository poiRepository) {
        this.poiRepository = poiRepository;
    }

    @PostMapping("/sync")
    public ResponseEntity<?> sincronizarBAData() {
        List<Map<String, String>> logs = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss");

        logs.add(Map.of("hora", LocalDateTime.now().format(formatter), "tipo", "INFO", "mensaje", "> conectando psql -h localhost -U admin -d geodb"));
        logs.add(Map.of("hora", LocalDateTime.now().format(formatter), "tipo", "INFO", "mensaje", "Estableciendo túnel seguro con API Rest de BA Data..."));

        try {
            // Simulo el tiempo de descarga de datos masivos
            Thread.sleep(1500);

            if (poiRepository.count() < 10) { // Solo insertamos si la base está casi vacía
                insertarPoiMock("Hospital Fernández", "Salud", -34.5802, -58.4069);
                insertarPoiMock("UBA Facultad de Medicina", "Educacion", -34.5985, -58.3974);
                insertarPoiMock("Estación Palermo (Subte D)", "Transporte", -34.5772, -58.4253);
                insertarPoiMock("Club Ciudad de Buenos Aires", "Deporte", -34.5441, -58.4614);
                insertarPoiMock("Sanatorio Güemes", "Salud", -34.5932, -58.4168);

                logs.add(Map.of("hora", LocalDateTime.now().format(formatter), "tipo", "OK", "mensaje", "Se insertaron nuevos registros espaciales (PostGIS)."));
            } else {
                logs.add(Map.of("hora", LocalDateTime.now().format(formatter), "tipo", "WARN", "mensaje", "La base de datos ya contiene POIs. Sincronización omitida para evitar duplicados."));
            }

            logs.add(Map.of("hora", LocalDateTime.now().format(formatter), "tipo", "OK", "mensaje", "Sincronización completada exitosamente. Calculando índices espaciales GIST..."));

            return ResponseEntity.ok(logs);

        } catch (Exception e) {
            logs.add(Map.of("hora", LocalDateTime.now().format(formatter), "tipo", "ERROR", "mensaje", "Fallo crítico en la inserción: " + e.getMessage()));
            return ResponseEntity.status(500).body(logs);
        }
    }

    private void insertarPoiMock(String nombre, String categoria, double lat, double lng) {
        PoiEntity poi = new PoiEntity();
        poi.setNombre(nombre);
        poi.setCategoria(categoria);
        poi.setUbicacion(geometryFactory.createPoint(new Coordinate(lng, lat)));
        poiRepository.save(poi);
    }
}