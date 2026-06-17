package GeoScore.AI.controllers;

import GeoScore.AI.entities.NotificacionEntity;
import GeoScore.AI.repositories.NotificacionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notificaciones")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificacionController {

    private final NotificacionRepository notificacionRepository;

    public NotificacionController(NotificacionRepository notificacionRepository) {
        this.notificacionRepository = notificacionRepository;
    }

    @GetMapping("/{email}")
    public ResponseEntity<List<NotificacionEntity>> getNotificaciones(@PathVariable String email) {
        return ResponseEntity.ok(notificacionRepository.findByUsuarioEmailOrderByFechaDesc(email));
    }

    @PutMapping("/{id}/leer")
    public ResponseEntity<?> marcarLeida(@PathVariable Long id) {
        Optional<NotificacionEntity> opt = notificacionRepository.findById(id);
        if (opt.isPresent()) {
            NotificacionEntity n = opt.get();
            n.setLeida(true);
            notificacionRepository.save(n);
            return ResponseEntity.ok(Map.of("mensaje", "Leída"));
        }
        return ResponseEntity.notFound().build();
    }

    // Endpoint para eliminar notificaciones
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarNotificacion(@PathVariable Long id) {
        if (notificacionRepository.existsById(id)) {
            notificacionRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("mensaje", "Eliminada"));
        }
        return ResponseEntity.notFound().build();
    }
}