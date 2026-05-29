package GeoScore.AI.controllers;

import GeoScore.AI.dto.CargaLogDTO;
import GeoScore.AI.services.CatalogoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final CatalogoService catalogoService;

    public AdminController(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    @PostMapping("/upload-catalogo")
    public ResponseEntity<List<CargaLogDTO>> uploadCatalogo(@RequestParam("file") MultipartFile file) {
        List<CargaLogDTO> logs = catalogoService.procesarArchivoCSV(file);
        return ResponseEntity.ok(logs);
    }
}