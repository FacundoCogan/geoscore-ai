package GeoScore.AI.controllers;

import GeoScore.AI.entities.UsuarioEntity;
import GeoScore.AI.repositories.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")

public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody Map<String, String> payload) {
        String id = payload.get("id");
        Optional<UsuarioEntity> existente = usuarioRepository.findById(id);

        if (existente.isPresent()) {
            return ResponseEntity.ok(Map.of("mensaje", "Usuario ya registrado"));
        }

        UsuarioEntity nuevo = new UsuarioEntity();
        nuevo.setId(id);
        nuevo.setNombre(payload.get("nombre"));
        nuevo.setEmail(payload.get("email"));
        nuevo.setRol(payload.get("rol"));
        nuevo.setFechaRegistro(LocalDateTime.now());

        usuarioRepository.save(nuevo);
        return ResponseEntity.ok(Map.of("mensaje", "Usuario registrado exitosamente"));
    }

    @PostMapping("/perfil")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        // Convierto a minúsculas para asegurar compatibilidad total
        String profile = payload.get("profile") != null ? payload.get("profile").toLowerCase() : "";

        Optional<UsuarioEntity> opt = usuarioRepository.findById(userId);
        if (opt.isPresent()) {
            UsuarioEntity u = opt.get();
            u.setPerfil(profile);
            usuarioRepository.save(u);
            return ResponseEntity.ok(Map.of("mensaje", "Perfil actualizado correctamente"));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{userId}/perfil")
    public ResponseEntity<String> getProfile(@PathVariable String userId) {
        Optional<UsuarioEntity> opt = usuarioRepository.findById(userId);
        if (opt.isPresent() && opt.get().getPerfil() != null) {
            return ResponseEntity.ok(opt.get().getPerfil());
        }
        return ResponseEntity.status(404).body("No configurado");
    }
}