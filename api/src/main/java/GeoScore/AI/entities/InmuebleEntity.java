package GeoScore.AI.entities;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Point;

@Entity
@Table(name = "inmuebles")
public class InmuebleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private Double precio;
    private Integer ambientes;
    private Integer superficie;
    private String barrio;

    private String imagen;

    // Columna para soportar MUCHAS imágenes en Base64 sin límite de caracteres
    @Column(columnDefinition = "TEXT")
    private String imagenes;

    private String tipoOperacion;
    private String propietarioId;
    private String direccion;
    private String telefono;
    private String estadoAprobacion = "Aprobado";

    @Column(columnDefinition = "geometry(Point,4326)")
    private Point ubicacion;

    public InmuebleEntity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }
    public Integer getAmbientes() { return ambientes; }
    public void setAmbientes(Integer ambientes) { this.ambientes = ambientes; }
    public Integer getSuperficie() { return superficie; }
    public void setSuperficie(Integer superficie) { this.superficie = superficie; }
    public String getBarrio() { return barrio; }
    public void setBarrio(String barrio) { this.barrio = barrio; }
    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }
    public String getImagenes() { return imagenes; }
    public void setImagenes(String imagenes) { this.imagenes = imagenes; }
    public String getTipoOperacion() { return tipoOperacion; }
    public void setTipoOperacion(String tipoOperacion) { this.tipoOperacion = tipoOperacion; }
    public String getPropietarioId() { return propietarioId; }
    public void setPropietarioId(String propietarioId) { this.propietarioId = propietarioId; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getEstadoAprobacion() { return estadoAprobacion; }
    public void setEstadoAprobacion(String estadoAprobacion) { this.estadoAprobacion = estadoAprobacion; }
    public Point getUbicacion() { return ubicacion; }
    public void setUbicacion(Point ubicacion) { this.ubicacion = ubicacion; }
}