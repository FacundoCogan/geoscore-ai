package GeoScore.AI.dto;

public class PoiDistanciaDTO {
    private Long id;
    private String nombre;
    private String categoria;
    private String tipo;
    private Double distanciaMetros;

    public PoiDistanciaDTO() {
    }

    public PoiDistanciaDTO(Long id, String nombre, String categoria, String tipo, Double distanciaMetros) {
        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.tipo = tipo;
        this.distanciaMetros = distanciaMetros;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public Double getDistanciaMetros() { return distanciaMetros; }
    public void setDistanciaMetros(Double distanciaMetros) { this.distanciaMetros = distanciaMetros; }
}