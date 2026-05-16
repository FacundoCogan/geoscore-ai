package GeoScore.AI.controllers;

import GeoScore.AI.dto.ProfileUpdateRequest;
import GeoScore.AI.services.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:3000")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/perfil")
    public ResponseEntity<String> updateProfile(@RequestBody ProfileUpdateRequest request) {
        // CU-06: Guardado del perfil en base de datos
        try {
            usuarioService.updateLifestyleProfile(request.getUserId(), request.getProfile());
            return ResponseEntity.ok("¡Perfil actualizado exitosamente!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al guardar el perfil");
        }
    }

    @GetMapping("/{userId}/perfil")
    public ResponseEntity<String> getProfile(@PathVariable String userId) {
        String perfil = usuarioService.getLifestyleProfile(userId);
        if (perfil != null) {
            return ResponseEntity.ok(perfil);
        }
        return ResponseEntity.noContent().build(); // Retorna 204 si el usuario todavía no eligió nada
    }
}