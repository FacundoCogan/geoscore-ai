package GeoScore.AI.controllers;

import GeoScore.AI.services.PoiSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/geo")
@CrossOrigin(origins = "http://localhost:3000")
public class PoiAdminController {

    private final PoiSyncService poiSyncService;

    public PoiAdminController(PoiSyncService poiSyncService) {
        this.poiSyncService = poiSyncService;
    }

    @PostMapping("/sync")
    public ResponseEntity<List<Map<String, String>>> syncBaData(@RequestParam(defaultValue = "NORMAL") String modo) {
        return ResponseEntity.ok(poiSyncService.sincronizarBaData(modo));
    }
}