package GeoScore.AI.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "perfiles")
@Data
public class Usuario {

    @Id
    private UUID id;

    private String nombre;

    @Column(unique = true)
    private String email;

}