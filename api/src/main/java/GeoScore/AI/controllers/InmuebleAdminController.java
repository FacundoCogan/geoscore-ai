package GeoScore.AI.controllers;

import GeoScore.AI.entities.InmuebleEntity;
import GeoScore.AI.entities.UsuarioEntity;
import GeoScore.AI.entities.NotificacionEntity;
import GeoScore.AI.repositories.InmuebleRepository;
import GeoScore.AI.repositories.UsuarioRepository;
import GeoScore.AI.repositories.NotificacionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/inmuebles")
@CrossOrigin(origins = "http://localhost:3000")
public class InmuebleAdminController {

    private final InmuebleRepository inmuebleRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionRepository notificacionRepository;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
    private final ObjectMapper mapper = new ObjectMapper();

    public InmuebleAdminController(InmuebleRepository inmuebleRepository, UsuarioRepository usuarioRepository, NotificacionRepository notificacionRepository) {
        this.inmuebleRepository = inmuebleRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificacionRepository = notificacionRepository;
    }

    private Map<String, Object> mapToDTO(InmuebleEntity i) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", i.getId());
        dto.put("titulo", i.getTitulo());
        dto.put("descripcion", i.getDescripcion());
        dto.put("precio", i.getPrecio());
        dto.put("ambientes", i.getAmbientes());
        dto.put("superficie", i.getSuperficie());
        dto.put("barrio", i.getBarrio());
        dto.put("tipoOperacion", i.getTipoOperacion());
        dto.put("estadoAprobacion", i.getEstadoAprobacion() != null ? i.getEstadoAprobacion() : "Aprobado");
        dto.put("propietarioId", i.getPropietarioId());
        dto.put("direccion", i.getDireccion());
        dto.put("telefono", i.getTelefono());
        dto.put("imagen", i.getImagen());

        try {
            if (i.getImagenes() != null && i.getImagenes().startsWith("[")) {
                dto.put("imagenes", mapper.readValue(i.getImagenes(), List.class));
            } else {
                dto.put("imagenes", List.of());
            }
        } catch (Exception e) { dto.put("imagenes", List.of()); }

        if (i.getUbicacion() != null) {
            Map<String, Double> ubi = new HashMap<>();
            ubi.put("x", i.getUbicacion().getX());
            ubi.put("y", i.getUbicacion().getY());
            dto.put("ubicacion", ubi);
        }
        return dto;
    }

    @GetMapping("/todos")
    public ResponseEntity<?> getAllInmuebles() {
        List<Map<String, Object>> lista = inmuebleRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/propietario/{propietarioId}")
    public ResponseEntity<?> getMisInmuebles(@PathVariable String propietarioId) {
        List<Map<String, Object>> mis = inmuebleRepository.findAll().stream()
                .filter(i -> propietarioId.equals(i.getPropietarioId()))
                .map(this::mapToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(mis);
    }

    // EL MOTOR DE CACHÉ: Cada vez que un agente guarda o modifica, destruimos la caché obsoleta de Redis
    @Caching(evict = {
            @CacheEvict(value = "catalogoInmuebles", allEntries = true),
            @CacheEvict(value = "analisisInmuebles", allEntries = true)
    })
    @PostMapping
    public ResponseEntity<?> guardarInmueble(@RequestBody Map<String, Object> payload) {
        try {
            Long id = null;
            if (payload.containsKey("id") && payload.get("id") != null && !payload.get("id").toString().isEmpty()) {
                id = Long.parseLong(payload.get("id").toString());
            }

            boolean isEdit = (id != null);
            InmuebleEntity inmueble = isEdit ? inmuebleRepository.findById(id).orElse(new InmuebleEntity()) : new InmuebleEntity();

            inmueble.setTitulo((String) payload.get("titulo"));
            inmueble.setDescripcion((String) payload.get("descripcion"));
            inmueble.setPrecio(Double.parseDouble(payload.get("precio").toString()));
            inmueble.setAmbientes(Integer.parseInt(payload.get("ambientes").toString()));
            if (payload.get("superficie") != null && !payload.get("superficie").toString().isEmpty()) {
                inmueble.setSuperficie(Integer.parseInt(payload.get("superficie").toString()));
            }
            inmueble.setBarrio((String) payload.get("barrio"));
            inmueble.setDireccion((String) payload.get("direccion"));
            inmueble.setTelefono((String) payload.get("telefono"));
            inmueble.setTipoOperacion((String) payload.get("tipoOperacion"));
            inmueble.setPropietarioId((String) payload.get("propietarioId"));

            if (payload.get("imagenes") != null) {
                inmueble.setImagenes(mapper.writeValueAsString(payload.get("imagenes")));
            }

            double lat = Double.parseDouble(payload.get("latitud").toString());
            double lng = Double.parseDouble(payload.get("longitud").toString());
            inmueble.setUbicacion(geometryFactory.createPoint(new Coordinate(lng, lat)));

            String rol = (String) payload.get("rol");
            if ("Administrador".equalsIgnoreCase(rol)) {
                inmueble.setEstadoAprobacion("Aprobado");
            } else {
                inmueble.setEstadoAprobacion(isEdit ? "Pausado" : "Pendiente");

                String accionTexto = isEdit ? "modificó" : "creó";
                NotificacionEntity noti = new NotificacionEntity();
                noti.setUsuarioEmail("facundo_06@live.com.ar");
                noti.setMensaje("🔔 Revisión pendiente: El agente " + accionTexto + " la publicación '" + inmueble.getTitulo() + "'.");
                notificacionRepository.save(noti);
            }

            inmuebleRepository.save(inmueble);
            return ResponseEntity.ok(Map.of("mensaje", "Guardado exitosamente."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error interno: " + e.getMessage()));
        }
    }

    // EL MOTOR DE CACHÉ: Al eliminar una propiedad, limpiamos la memoria RAM para que no figure más
    @Caching(evict = {
            @CacheEvict(value = "catalogoInmuebles", allEntries = true),
            @CacheEvict(value = "analisisInmuebles", allEntries = true)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarInmueble(@PathVariable Long id, @RequestParam String rol, @RequestParam String userId) {
        inmuebleRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("mensaje", "Inmueble eliminado permanentemente."));
    }

    // EL MOTOR DE CACHÉ: Cuando el admin aprueba, se limpia el caché para forzar a que aparezca en el mapa público
    @Caching(evict = {
            @CacheEvict(value = "catalogoInmuebles", allEntries = true),
            @CacheEvict(value = "analisisInmuebles", allEntries = true)
    })
    @PutMapping("/{id}/aprobar")
    public ResponseEntity<?> aprobar(@PathVariable Long id) {
        Optional<InmuebleEntity> opt = inmuebleRepository.findById(id);
        if (opt.isPresent()) {
            InmuebleEntity i = opt.get();
            i.setEstadoAprobacion("Aprobado");
            inmuebleRepository.save(i);

            Optional<UsuarioEntity> propOpt = usuarioRepository.findById(i.getPropietarioId());
            if (propOpt.isPresent()) {
                NotificacionEntity noti = new NotificacionEntity();
                noti.setUsuarioEmail(propOpt.get().getEmail());
                noti.setMensaje("✅ ¡Aprobada! Tu publicación '" + i.getTitulo() + "' ya es visible en el catálogo público.");
                notificacionRepository.save(noti);
            }
            return ResponseEntity.ok(Map.of("mensaje", "Aprobado exitosamente."));
        }
        return ResponseEntity.notFound().build();
    }

    // EL MOTOR DE CACHÉ: Cuando el admin rechaza, limpiamos la memoria RAM
    @Caching(evict = {
            @CacheEvict(value = "catalogoInmuebles", allEntries = true),
            @CacheEvict(value = "analisisInmuebles", allEntries = true)
    })
    @PutMapping("/{id}/rechazar")
    public ResponseEntity<?> rechazar(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Optional<InmuebleEntity> opt = inmuebleRepository.findById(id);
        if (opt.isPresent()) {
            InmuebleEntity i = opt.get();
            i.setEstadoAprobacion("Rechazado");
            inmuebleRepository.save(i);

            Optional<UsuarioEntity> propOpt = usuarioRepository.findById(i.getPropietarioId());
            if (propOpt.isPresent()) {
                NotificacionEntity noti = new NotificacionEntity();
                noti.setUsuarioEmail(propOpt.get().getEmail());
                noti.setMensaje("❌ Rechazada: Tu publicación '" + i.getTitulo() + "'. Motivo: " + payload.get("motivo"));
                notificacionRepository.save(noti);
            }
            return ResponseEntity.ok(Map.of("mensaje", "Rechazado correctamente."));
        }
        return ResponseEntity.notFound().build();
    }
}