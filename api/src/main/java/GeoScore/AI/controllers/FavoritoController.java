package GeoScore.AI.controllers;

import GeoScore.AI.dto.FavoritoRequest;
import GeoScore.AI.services.FavoritoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favoritos")
@CrossOrigin(origins = "http://localhost:3000")
public class FavoritoController {
    private final FavoritoService favoritoService;

    public FavoritoController(FavoritoService favoritoService) {
        this.favoritoService = favoritoService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<String>> getFavoritos(@PathVariable String userId) {
        return ResponseEntity.ok(favoritoService.getFavoritosIds(userId));
    }

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, String>> toggleFavorito(@RequestBody FavoritoRequest request) {
        String accion = favoritoService.toggleFavorito(request.getUserId(), request.getInmuebleId());
        return ResponseEntity.ok(Map.of("status", "success", "accion", accion));
    }
}