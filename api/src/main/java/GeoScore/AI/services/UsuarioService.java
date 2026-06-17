package GeoScore.AI.services;

import GeoScore.AI.entities.UsuarioEntity;
import GeoScore.AI.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public void updateLifestyleProfile(String userId, String perfil) {
        // Buscamos al usuario. Si por algún motivo no existe en PostgreSQL, lo instanciamos.
        UsuarioEntity usuario = usuarioRepository.findById(userId)
                .orElse(new UsuarioEntity(userId));

        // Le asignamos el nuevo perfil de vida
        usuario.setPerfil(perfil);

        // Guardamos los cambios
        usuarioRepository.save(usuario);
    }

    public String getLifestyleProfile(String userId) {
        Optional<UsuarioEntity> usuario = usuarioRepository.findById(userId);
        return usuario.map(UsuarioEntity::getPerfil).orElse(null);
    }
}