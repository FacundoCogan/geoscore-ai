package GeoScore.AI.dto;

import java.util.List;

public class EnvironmentScoreResponse {
    private Double scoreTotal;
    private List<CategoryScoreDTO> categorias;
    private List<PoiResponseDTO> pois;
    private Integer radioKm;
    private String perfilAplicado;

    public EnvironmentScoreResponse(Double scoreTotal, List<CategoryScoreDTO> categorias, List<PoiResponseDTO> pois, Integer radioKm, String perfilAplicado) {
        this.scoreTotal = scoreTotal;
        this.categorias = categorias;
        this.pois = pois;
        this.radioKm = radioKm;
        this.perfilAplicado = perfilAplicado;
    }

    // Constructor estático para el Camino Alternativo A1 (Sin POIs) y A2 (Fallo lógico)
    public static EnvironmentScoreResponse fallback(String perfil) {
        return new EnvironmentScoreResponse(1.0, List.of(), List.of(), 2, perfil);
    }

    // Getters y Setters
    public Double getScoreTotal() { return scoreTotal; }
    public List<CategoryScoreDTO> getCategorias() { return categorias; }
    public List<PoiResponseDTO> getPois() { return pois; }
    public Integer getRadioKm() { return radioKm; }
    public String getPerfilAplicado() { return perfilAplicado; }

    // Clases anidadas para simplificar
    public static class CategoryScoreDTO {
        private String categoria;
        private Double score;
        private Double peso;
        private Integer cantidadPOIs;

        public CategoryScoreDTO(String categoria, Double score, Double peso, Integer cantidadPOIs) {
            this.categoria = categoria; this.score = score; this.peso = peso; this.cantidadPOIs = cantidadPOIs;
        }
        // Getters...
        public String getCategoria() { return categoria; }
        public Double getScore() { return score; }
        public Double getPeso() { return peso; }
        public Integer getCantidadPOIs() { return cantidadPOIs; }
    }

    public static class PoiResponseDTO {
        private String id;
        private String nombre;
        private String categoria;
        private String tipo;
        private Double distancia;

        public PoiResponseDTO(String id, String nombre, String categoria, String tipo, Double distancia) {
            this.id = id; this.nombre = nombre; this.categoria = categoria; this.tipo = tipo; this.distancia = distancia;
        }
        // Getters...
        public String getId() { return id; }
        public String getNombre() { return nombre; }
        public String getCategoria() { return categoria; }
        public String getTipo() { return tipo; }
        public Double getDistancia() { return distancia; }
    }
}