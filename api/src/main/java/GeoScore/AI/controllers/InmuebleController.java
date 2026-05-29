package GeoScore.AI.controllers;

import GeoScore.AI.entities.InmuebleEntity;
import GeoScore.AI.repositories.InmuebleRepository;
import GeoScore.AI.repositories.PoiRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inmuebles")
@CrossOrigin(origins = "http://localhost:3000")
public class InmuebleController {

    private final InmuebleRepository inmuebleRepository;
    private final PoiRepository poiRepository;

    private static final List<String> IMAGENES = List.of(
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
            "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80",
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
            "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80"
    );

    public InmuebleController(InmuebleRepository inmuebleRepository, PoiRepository poiRepository) {
        this.inmuebleRepository = inmuebleRepository;
        this.poiRepository = poiRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getInmuebles(@RequestParam(required = false) String perfil) {
        List<Map<String, Object>> result = inmuebleRepository.findAll().stream().map(i -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", i.getId().toString());
            map.put("titulo", i.getTitulo());
            map.put("direccion", "CABA");
            map.put("barrio", "Capital Federal");
            map.put("precio", i.getPrecio());
            map.put("ambientes", i.getAmbientes());
            map.put("superficie", i.getAmbientes() * 25);

            String tipoOp = (i.getPrecio() < 130000 || i.getId() % 2 != 0) ? "alquiler" : "venta";
            map.put("tipoOperacion", tipoOp);

            int index = (int) (i.getId() % IMAGENES.size());
            map.put("imagen", IMAGENES.get(index));

            if (i.getUbicacion() != null) {
                map.put("lat", i.getUbicacion().getY());
                map.put("lng", i.getUbicacion().getX());

                List<Map<String, Object>> pois = poiRepository.findPoisForMapAndScore(i.getUbicacion());
                map.put("geoScore", calcularScorePonderado(pois, perfil));
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/analisis")
    public ResponseEntity<Map<String, Object>> getAnalisisEntorno(@PathVariable Long id, @RequestParam(required = false) String perfil) {
        InmuebleEntity inmueble = inmuebleRepository.findById(id).orElseThrow();
        List<Map<String, Object>> pois = poiRepository.findPoisForMapAndScore(inmueble.getUbicacion());

        long cantSalud = pois.stream().filter(p -> "Salud".equalsIgnoreCase((String)p.get("categoria"))).count();
        long cantEducacion = pois.stream().filter(p -> "Educacion".equalsIgnoreCase((String)p.get("categoria"))).count();
        long cantTransporte = pois.stream().filter(p -> "Transporte".equalsIgnoreCase((String)p.get("categoria"))).count();
        long cantDeporte = pois.stream().filter(p -> "Deporte".equalsIgnoreCase((String)p.get("categoria"))).count();

        // Calculamos los scores base con la nueva curva de dificultad
        Map<String, Double> scoresBase = calcularScoresIndividuales(cantSalud, cantEducacion, cantTransporte, cantDeporte);
        double scoreGeneral = calcularScorePonderado(pois, perfil);

        Map<String, Object> response = new HashMap<>();
        response.put("scoreGeneral", scoreGeneral);
        response.put("detalles", scoresBase);
        response.put("conteo", Map.of("salud", cantSalud, "educacion", cantEducacion, "transporte", cantTransporte, "deporte", cantDeporte));
        response.put("poisReales", pois);

        return ResponseEntity.ok(response);
    }

    // 1. EL NÚCLEO MATEMÁTICO: Una curva de puntuación mucho más estricta
    private Map<String, Double> calcularScoresIndividuales(long cantSalud, long cantEducacion, long cantTransporte, long cantDeporte) {
        // Base baja (2.0) y multiplicadores bajos para que cueste sumar puntos.
        double scoreSalud = Math.min(10.0, 2.0 + (cantSalud * 1.5));      // Necesita ~6 POIs para un 10
        double scoreEducacion = Math.min(10.0, 2.0 + (cantEducacion * 0.3)); // Necesita ~27 POIs para un 10
        double scoreTransporte = Math.min(10.0, 2.0 + (cantTransporte * 1.0)); // Necesita ~8 POIs para un 10
        double scoreDeporte = Math.min(10.0, 2.0 + (cantDeporte * 1.2));    // Necesita ~7 POIs para un 10

        return Map.of(
                "salud", Math.round(scoreSalud * 10.0) / 10.0,
                "educacion", Math.round(scoreEducacion * 10.0) / 10.0,
                "transporte", Math.round(scoreTransporte * 10.0) / 10.0,
                "deporte", Math.round(scoreDeporte * 10.0) / 10.0
        );
    }

    // 2. APLICADOR DE PERFIL: Multiplica las notas duras por el peso del perfil
    private double calcularScorePonderado(List<Map<String, Object>> pois, String perfil) {
        long cSalud = pois.stream().filter(p -> "Salud".equalsIgnoreCase((String)p.get("categoria"))).count();
        long cEduc = pois.stream().filter(p -> "Educacion".equalsIgnoreCase((String)p.get("categoria"))).count();
        long cTrans = pois.stream().filter(p -> "Transporte".equalsIgnoreCase((String)p.get("categoria"))).count();
        long cDep = pois.stream().filter(p -> "Deporte".equalsIgnoreCase((String)p.get("categoria"))).count();

        Map<String, Double> scores = calcularScoresIndividuales(cSalud, cEduc, cTrans, cDep);

        double wSalud = 0.25, wEduc = 0.25, wTrans = 0.25, wDep = 0.25;

        // Ponderación dinámica basada en los intereses del usuario
        if (perfil != null && !perfil.isEmpty()) {
            if ("salud".equalsIgnoreCase(perfil)) { wSalud = 0.7; wEduc = 0.1; wTrans = 0.1; wDep = 0.1; }
            else if ("estudiante".equalsIgnoreCase(perfil)) { wEduc = 0.7; wSalud = 0.1; wTrans = 0.1; wDep = 0.1; }
            else if ("movilidad".equalsIgnoreCase(perfil)) { wTrans = 0.7; wSalud = 0.1; wEduc = 0.1; wDep = 0.1; }
            else if ("fitness".equalsIgnoreCase(perfil)) { wDep = 0.7; wSalud = 0.1; wEduc = 0.1; wTrans = 0.1; }
        }

        double sGen = (scores.get("salud") * wSalud) +
                (scores.get("educacion") * wEduc) +
                (scores.get("transporte") * wTrans) +
                (scores.get("deporte") * wDep);

        return Math.round(sGen * 10.0) / 10.0;
    }
}