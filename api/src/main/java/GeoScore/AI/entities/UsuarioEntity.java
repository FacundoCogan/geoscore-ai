package GeoScore.AI.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class UsuarioEntity {
    @Id
    private String id; // UUID de Supabase Auth

    private String email;

    @Enumerated(EnumType.STRING)
    private LifestyleProfile perfil; // student, fitness, health, mobility

    // 1. Constructor vacío obligatorio para JPA/Hibernate
    public UsuarioEntity() {
    }

    // 2. Constructor con ID que usamos en el Servicio
    public UsuarioEntity(String id) {
        this.id = id;
    }

    // 3. Getters y Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LifestyleProfile getPerfil() {
        return perfil;
    }

    public void setPerfil(LifestyleProfile perfil) {
        this.perfil = perfil;
    }
}