package GeoScore.AI.controllers;

import GeoScore.AI.entities.Usuario;
import GeoScore.AI.repositories.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/perfil")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/crear")
    public ResponseEntity<Usuario> crearPerfil(@RequestBody Usuario usuario) {
        // Obtenemos el UUID que el filtro JWT extrajo del token de Supabase
        String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        usuario.setId(UUID.fromString(userId));

        Usuario guardado = usuarioRepository.save(usuario);
        return ResponseEntity.ok(guardado);
    }

    @GetMapping("/me")
    public ResponseEntity<Usuario> obtenerMiPerfil() {
        String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return usuarioRepository.findById(UUID.fromString(userId))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}