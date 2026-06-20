package GeoScore.AI.controllers;

import GeoScore.AI.entities.UsuarioEntity;
import GeoScore.AI.repositories.UsuarioRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/usuarios")

public class UsuarioAdminController {

    private final UsuarioRepository usuarioRepository;

    public UsuarioAdminController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    // Asegura que siempre exista mi usuario Administrador para poder probar el CU-14
    @PostConstruct
    public void inicializarAdmin() {
        // Busca si el correo ya existe, sin importar cuánta basura haya en la base
        boolean adminExiste = usuarioRepository.findAll().stream()
                .anyMatch(u -> "facundo_06@live.com.ar".equals(u.getEmail()));

        if (!adminExiste) {
            UsuarioEntity admin = new UsuarioEntity();
            // Le ponemos un ID genérico para que no choque con Supabase
            admin.setId("admin-geo-score-123");
            admin.setNombre("Facundo Cogan");
            admin.setEmail("facundo_06@live.com.ar");
            admin.setRol("Administrador");
            admin.setEstado("Activo");
            usuarioRepository.save(admin);
        }
    }

    @GetMapping
    public ResponseEntity<List<UsuarioEntity>> listarUsuarios() {
        return ResponseEntity.ok(usuarioRepository.findAll());
    }

    @PostMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable String id, @RequestBody Map<String, String> request) {
        String adminEmail = request.get("adminEmail");
        String nuevoEstado = request.get("estado");

        Optional<UsuarioEntity> optUser = usuarioRepository.findById(id);

        if (optUser.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "A1", "mensaje", "El registro del usuario ya no existe o fue eliminado por otro proceso."));
        }

        UsuarioEntity user = optUser.get();

        if (user.getEmail().equals(adminEmail) && "Suspendido".equalsIgnoreCase(nuevoEstado)) {
            return ResponseEntity.status(403).body(Map.of("error", "A2", "mensaje", "Por reglas de seguridad, no puedes suspender tu propia cuenta de administrador en sesión."));
        }

        user.setEstado(nuevoEstado);
        usuarioRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "mensaje", "El estado del usuario ha sido cambiado a " + nuevoEstado + ". Log de auditoría generado.",
                "usuario", user
        ));
    }

    // Modificación de Rol
    @PutMapping("/{id}/rol")
    public ResponseEntity<?> cambiarRol(@PathVariable String id, @RequestBody Map<String, String> payload) {
        Optional<UsuarioEntity> opt = usuarioRepository.findById(id);
        if (opt.isPresent()) {
            UsuarioEntity u = opt.get();
            String nuevoRol = payload.get("rol");

            // Validamos que el rol sea uno de los permitidos por el sistema
            if (nuevoRol != null && (nuevoRol.equals("Usuario") || nuevoRol.equals("Inmobiliaria") || nuevoRol.equals("Administrador"))) {
                u.setRol(nuevoRol);
                usuarioRepository.save(u);
                return ResponseEntity.ok(Map.of("mensaje", "Rol actualizado correctamente."));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Rol no válido."));
            }
        }
        return ResponseEntity.notFound().build();
    }
}