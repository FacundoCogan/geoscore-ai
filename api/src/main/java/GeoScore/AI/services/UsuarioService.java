package GeoScore.AI.services;

import GeoScore.AI.entities.LifestyleProfile;
import GeoScore.AI.entities.UsuarioEntity;
import GeoScore.AI.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public void updateLifestyleProfile(String userId, String profile) {
        UsuarioEntity usuario = usuarioRepository.findById(userId)
                .orElse(new UsuarioEntity(userId));

        // Convierte el String "fitness" al Enum LifestyleProfile.fitness
        usuario.setPerfil(LifestyleProfile.valueOf(profile));

        usuarioRepository.save(usuario);
    }

    public String getLifestyleProfile(String userId) {
        return usuarioRepository.findById(userId)
                .map(usuario -> usuario.getPerfil() != null ? usuario.getPerfil().name() : null)
                .orElse(null);
    }
}