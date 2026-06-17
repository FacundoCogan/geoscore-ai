package GeoScore.AI.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
public class UsuarioEntity {

    @Id
    private String id;

    private String nombre;
    private String email;
    private String rol;
    private String estado;
    private String perfil;

    public UsuarioEntity() {}

    public UsuarioEntity(String id) {
        this.id = id;
    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getPerfil() { return perfil; }
    public void setPerfil(String perfil) { this.perfil = perfil; }

    public void setFechaRegistro(LocalDateTime now) {
    }
}