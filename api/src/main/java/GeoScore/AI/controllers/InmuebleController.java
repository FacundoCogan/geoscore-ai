package GeoScore.AI.controllers;

import GeoScore.AI.entities.InmuebleEntity;
import GeoScore.AI.repositories.InmuebleRepository;
import GeoScore.AI.repositories.PoiRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inmuebles")
public class InmuebleController {

    private final InmuebleRepository inmuebleRepository;
    private final PoiRepository poiRepository;
    private final ObjectMapper mapper = new ObjectMapper();

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

    private Map<String, Double> calcularScoresIndividuales(long cantSalud, long cantEducacion, long cantTransporte, long cantDeporte) {
        double scoreSalud = Math.min(10.0, 2.0 + (cantSalud * 1.5));
        double scoreEducacion = Math.min(10.0, 2.0 + (cantEducacion * 0.3));
        double scoreTransporte = Math.min(10.0, 2.0 + (cantTransporte * 1.0));
        double scoreDeporte = Math.min(10.0, 2.0 + (cantDeporte * 1.2));

        return Map.of(
                "salud", Math.round(scoreSalud * 10.0) / 10.0,
                "educacion", Math.round(scoreEducacion * 10.0) / 10.0,
                "transporte", Math.round(scoreTransporte * 10.0) / 10.0,
                "deporte", Math.round(scoreDeporte * 10.0) / 10.0
        );
    }

    private double calcularScorePonderado(List<Map<String, Object>> pois, String perfil) {
        long cSalud = pois.stream().filter(p -> "Salud".equalsIgnoreCase((String)p.get("categoria"))).count();
        long cEduc = pois.stream().filter(p -> "Educacion".equalsIgnoreCase((String)p.get("categoria"))).count();
        long cTrans = pois.stream().filter(p -> "Transporte".equalsIgnoreCase((String)p.get("categoria"))).count();
        long cDep = pois.stream().filter(p -> "Deporte".equalsIgnoreCase((String)p.get("categoria"))).count();

        Map<String, Double> scores = calcularScoresIndividuales(cSalud, cEduc, cTrans, cDep);

        double wSalud = 0.25, wEduc = 0.25, wTrans = 0.25, wDep = 0.25;

        if (perfil != null && !perfil.isEmpty()) {
            if ("salud".equalsIgnoreCase(perfil)) { wSalud = 0.7; wEduc = 0.1; wTrans = 0.1; wDep = 0.1; }
            else if ("estudiante".equalsIgnoreCase(perfil)) { wEduc = 0.7; wSalud = 0.1; wTrans = 0.1; wDep = 0.1; }
            else if ("movilidad".equalsIgnoreCase(perfil)) { wTrans = 0.7; wSalud = 0.1; wEduc = 0.1; wDep = 0.1; }
            else if ("fitness".equalsIgnoreCase(perfil)) { wDep = 0.7; wSalud = 0.1; wEduc = 0.1; wTrans = 0.1; }
        }

        double sGen = (scores.get("salud") * wSalud) + (scores.get("educacion") * wEduc) +
                (scores.get("transporte") * wTrans) + (scores.get("deporte") * wDep);

        return Math.round(sGen * 10.0) / 10.0;
    }

    private Map<String, Object> mapearInmueble(InmuebleEntity i, String perfil) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", i.getId().toString());
        map.put("titulo", i.getTitulo());
        map.put("descripcion", i.getDescripcion() != null && !i.getDescripcion().isEmpty() ? i.getDescripcion() : "Excelente oportunidad.");
        map.put("precio", i.getPrecio());
        map.put("ambientes", i.getAmbientes() != null ? i.getAmbientes() : 2);
        map.put("superficie", i.getSuperficie() != null ? i.getSuperficie() : (i.getAmbientes() != null ? i.getAmbientes() * 25 : 50));
        map.put("barrio", i.getBarrio() != null ? i.getBarrio() : "Capital Federal");
        map.put("direccion", i.getDireccion() != null ? i.getDireccion() : "CABA");
        map.put("telefono", i.getTelefono());

        String tipoOp = i.getTipoOperacion() != null ? i.getTipoOperacion() : ((i.getPrecio() < 130000 || i.getId() % 2 != 0) ? "alquiler" : "venta");
        map.put("tipoOperacion", tipoOp);
        map.put("estadoAprobacion", i.getEstadoAprobacion() != null ? i.getEstadoAprobacion() : "Aprobado");

        List<String> images = new ArrayList<>();
        try { if (i.getImagenes() != null && i.getImagenes().startsWith("[")) images = mapper.readValue(i.getImagenes(), List.class); } catch (Exception e) {}
        if (images.isEmpty() && i.getImagen() != null && !i.getImagen().isEmpty()) images.add(i.getImagen());
        if (images.isEmpty()) images.add(IMAGENES.get((int) (i.getId() % IMAGENES.size())));
        map.put("imagenes", images);

        if (i.getUbicacion() != null) {
            map.put("lat", i.getUbicacion().getY());
            map.put("lng", i.getUbicacion().getX());
            map.put("ubicacion", Map.of("x", i.getUbicacion().getX(), "y", i.getUbicacion().getY()));
            List<Map<String, Object>> pois = poiRepository.findPoisForMapAndScore(i.getUbicacion());
            map.put("geoScore", calcularScorePonderado(pois, perfil));
        } else {
            map.put("geoScore", 7.5);
        }
        return map;
    }

    // MEMORIA CACHÉ HABILITADA: Devuelve todos los inmuebles de forma instantánea.
    // Genera una clave distinta en Redis según el "perfil" del usuario (estudiante, salud, etc.)
    @Cacheable(value = "catalogoInmuebles", key = "#perfil != null ? #perfil : 'default'")
    @GetMapping
    public List<Map<String, Object>> getInmuebles(@RequestParam(required = false) String perfil) {
        // Devolvemos directamente la Lista. Spring le asignará el 200 OK automáticamente.
        return inmuebleRepository.findAll().stream()
                .filter(i -> i.getEstadoAprobacion() == null || "Aprobado".equalsIgnoreCase(i.getEstadoAprobacion()))
                .map(i -> mapearInmueble(i, perfil))
                .collect(Collectors.toList());
    }

    // MEMORIA CACHÉ HABILITADA: Guarda el análisis complejo de PostGIS en RAM
    @Cacheable(value = "analisisInmuebles", key = "#id.toString() + '-' + (#perfil != null ? #perfil : 'default')")
    @GetMapping("/{id}/analisis")
    public Map<String, Object> getAnalisisEntorno(@PathVariable Long id, @RequestParam(required = false) String perfil) {
        InmuebleEntity inmueble = inmuebleRepository.findById(id).orElseThrow();
        if(inmueble.getUbicacion() == null) {
            return Map.of("scoreGeneral", 0.0, "detalles", Map.of(), "conteo", Map.of(), "poisReales", List.of());
        }

        List<Map<String, Object>> poisOriginales = poiRepository.findPoisForMapAndScore(inmueble.getUbicacion());
        List<Map<String, Object>> poisParaReact = poisOriginales.stream().map(p -> {
            Map<String, Object> format = new HashMap<>();
            format.put("id", p.get("id"));
            format.put("nombre", p.get("nombre"));
            format.put("categoria", p.get("categoria").toString().toLowerCase());
            format.put("lat", p.get("latitud") != null ? p.get("latitud") : p.get("lat"));
            format.put("lng", p.get("longitud") != null ? p.get("longitud") : p.get("lng"));
            format.put("distancia", p.get("distancia") != null ? p.get("distancia") : "");
            return format;
        }).collect(Collectors.toList());

        long cantSalud = poisParaReact.stream().filter(p -> "salud".equals(p.get("categoria"))).count();
        long cantEducacion = poisParaReact.stream().filter(p -> "educacion".equals(p.get("categoria"))).count();
        long cantTransporte = poisParaReact.stream().filter(p -> "transporte".equals(p.get("categoria"))).count();
        long cantDeporte = poisParaReact.stream().filter(p -> "deporte".equals(p.get("categoria"))).count();

        Map<String, Double> scoresBase = calcularScoresIndividuales(cantSalud, cantEducacion, cantTransporte, cantDeporte);
        double scoreGeneral = calcularScorePonderado(poisOriginales, perfil);

        Map<String, Object> response = new HashMap<>();
        response.put("scoreGeneral", scoreGeneral);
        response.put("detalles", scoresBase);
        response.put("conteo", Map.of("salud", cantSalud, "educacion", cantEducacion, "transporte", cantTransporte, "deporte", cantDeporte));
        response.put("poisReales", poisParaReact);

        // Devolvemos el Map directo
        return response;
    }
}