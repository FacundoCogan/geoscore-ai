package GeoScore.AI.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "favoritos")
public class FavoritoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "inmueble_id")
    private String inmuebleId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getInmuebleId() { return inmuebleId; }
    public void setInmuebleId(String inmuebleId) { this.inmuebleId = inmuebleId; }
}