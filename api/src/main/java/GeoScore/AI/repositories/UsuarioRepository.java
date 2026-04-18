package GeoScore.AI.repositories;

import GeoScore.AI.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    Usuario findByEmail(String email);
}