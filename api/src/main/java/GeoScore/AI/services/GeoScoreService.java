package GeoScore.AI.services;

import GeoScore.AI.dto.EnvironmentScoreResponse;
import GeoScore.AI.dto.PoiDistanciaDTO;
import GeoScore.AI.repositories.PoiRepository;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GeoScoreService {

    private final PoiRepository poiRepository;

    // CU-09: Coeficientes de ponderación
    private static final Map<String, Map<String, Double>> PROFILE_WEIGHTS = Map.of(
            "student", Map.of("educacion", 0.40, "transporte", 0.35, "deporte", 0.15, "salud", 0.10),
            "fitness", Map.of("deporte", 0.50, "salud", 0.20, "transporte", 0.20, "educacion", 0.10),
            "health",  Map.of("salud", 0.50, "deporte", 0.20, "transporte", 0.20, "educacion", 0.10),
            "mobility", Map.of("transporte", 0.55, "educacion", 0.15, "salud", 0.15, "deporte", 0.15)
    );

    // CU-07 A2: Pesos neutros
    private static final Map<String, Double> NEUTRAL_WEIGHTS = Map.of(
            "educacion", 0.25, "transporte", 0.25, "salud", 0.25, "deporte", 0.25
    );

    public GeoScoreService(PoiRepository poiRepository) {
        this.poiRepository = poiRepository;
    }

    public EnvironmentScoreResponse calculateScore(Point ubicacionPropiedad, String userProfile) {
        try {
            // 1. Ejecutar consulta espacial
            List<PoiDistanciaDTO> rawPois = poiRepository.findPoisInRange(ubicacionPropiedad);

            // CU-07 A1: No hay POIs
            if (rawPois.isEmpty()) {
                return EnvironmentScoreResponse.fallback(userProfile);
            }

            // 2. Determinar pesos (CU-09)
            Map<String, Double> weights = (userProfile != null && PROFILE_WEIGHTS.containsKey(userProfile))
                    ? PROFILE_WEIGHTS.get(userProfile)
                    : NEUTRAL_WEIGHTS;

            // 3. Agrupar POIs y calcular puntajes base
            Map<String, Double> rawScores = new HashMap<>();
            Map<String, Integer> countPOIs = new HashMap<>();
            List<EnvironmentScoreResponse.PoiResponseDTO> poiDTOs = new ArrayList<>();

            for (PoiDistanciaDTO poi : rawPois) {
                // Cálculo de proximidad (máx 2.5 pts por POI)
                double pts = Math.max(0, 2.5 - (poi.getDistanciaMetros() / 800.0));
                rawScores.merge(poi.getCategoria(), pts, Double::sum);
                countPOIs.merge(poi.getCategoria(), 1, Integer::sum);

                poiDTOs.add(new EnvironmentScoreResponse.PoiResponseDTO(
                        poi.getId().toString(), poi.getNombre(), poi.getCategoria(), poi.getTipo(), poi.getDistanciaMetros()
                ));
            }

            // 4. Armar el desglose de categorías y sumar score ponderado
            List<EnvironmentScoreResponse.CategoryScoreDTO> catDTOs = new ArrayList<>();
            double finalScore = 0.0;

            for (String cat : weights.keySet()) {
                double catRaw = Math.min(10.0, rawScores.getOrDefault(cat, 0.0));
                double weight = weights.get(cat);
                finalScore += catRaw * weight;

                catDTOs.add(new EnvironmentScoreResponse.CategoryScoreDTO(
                        cat.substring(0, 1).toUpperCase() + cat.substring(1), // Capitalize
                        Math.round(catRaw * 10.0) / 10.0,
                        weight,
                        countPOIs.getOrDefault(cat, 0)
                ));
            }

            return new EnvironmentScoreResponse(Math.round(finalScore * 10.0) / 10.0, catDTOs, poiDTOs, 2, userProfile);

        } catch (Exception e) {
            // CU-09 A2: Fallo de cálculo
            return EnvironmentScoreResponse.fallback(userProfile);
        }
    }
}