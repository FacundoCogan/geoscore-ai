package GeoScore.AI.controllers;

import GeoScore.AI.entities.InmuebleEntity;
import GeoScore.AI.entities.PoiEntity;
import GeoScore.AI.entities.UsuarioEntity;
import GeoScore.AI.repositories.InmuebleRepository;
import GeoScore.AI.repositories.PoiRepository;
import GeoScore.AI.repositories.UsuarioRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardAdminController {

    private final InmuebleRepository inmuebleRepository;
    private final UsuarioRepository usuarioRepository;
    private final PoiRepository poiRepository;

    public DashboardAdminController(InmuebleRepository inmuebleRepository, UsuarioRepository usuarioRepository, PoiRepository poiRepository) {
        this.inmuebleRepository = inmuebleRepository;
        this.usuarioRepository = usuarioRepository;
        this.poiRepository = poiRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("hasData", true);

        List<UsuarioEntity> usuarios = usuarioRepository.findAll();

        // 1. Estadísticas de Roles
        long admin = usuarios.stream().filter(u -> "Administrador".equals(u.getRol())).count();
        long inmo = usuarios.stream().filter(u -> "Inmobiliaria".equals(u.getRol()) || "Agente Inmobiliario".equals(u.getRol())).count();
        long usr = usuarios.stream().filter(u -> "Usuario".equals(u.getRol())).count();
        stats.put("perfiles", Map.of("Administradores", admin, "Inmobiliarias", inmo, "Usuarios Estandar", usr));

        // 2. Estadísticas de ESTILOS DE VIDA (Intereses de Usuarios)
        long perfilSalud = usuarios.stream().filter(u -> "salud".equalsIgnoreCase(u.getPerfil())).count();
        long perfilEstudiante = usuarios.stream().filter(u -> "estudiante".equalsIgnoreCase(u.getPerfil())).count();
        long perfilMovilidad = usuarios.stream().filter(u -> "movilidad".equalsIgnoreCase(u.getPerfil())).count();
        long perfilFitness = usuarios.stream().filter(u -> "fitness".equalsIgnoreCase(u.getPerfil())).count();

        long totalPerfiles = perfilSalud + perfilEstudiante + perfilMovilidad + perfilFitness;
        long divisor = totalPerfiles == 0 ? 1 : totalPerfiles; // Evitar división por cero en el frontend

        stats.put("estilosVida", Map.of(
                "Salud", perfilSalud,
                "Estudiante", perfilEstudiante,
                "Movilidad", perfilMovilidad,
                "Fitness", perfilFitness,
                "Total", totalPerfiles,
                "Divisor", divisor
        ));

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportReport() {
        List<InmuebleEntity> inmuebles = inmuebleRepository.findAll();
        List<UsuarioEntity> usuarios = usuarioRepository.findAll();

        long aprobados = inmuebles.stream().filter(i -> "Aprobado".equalsIgnoreCase(i.getEstadoAprobacion()) || i.getEstadoAprobacion() == null).count();

        // Calculamos la tendencia predominante para redactar el CSV
        long perfilEstudiante = usuarios.stream().filter(u -> "estudiante".equalsIgnoreCase(u.getPerfil())).count();
        long totalConPerfil = usuarios.stream().filter(u -> u.getPerfil() != null && !u.getPerfil().isEmpty()).count();
        double pctEstudiante = totalConPerfil == 0 ? 0 : (perfilEstudiante * 100.0 / totalConPerfil);

        StringBuilder csv = new StringBuilder();

        csv.append("=========================================================\n");
        csv.append("       REPORTE ANALITICO ESTRATEGICO - GEOSCORE AI       \n");
        csv.append("=========================================================\n");
        csv.append("Fecha de generacion: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))).append("\n\n");

        csv.append("[ RESUMEN DE INTELIGENCIA DE NEGOCIO ]\n");
        csv.append("- Tendencia de Demanda: El ").append(Math.round(pctEstudiante)).append("% de los usuarios con perfil activo priorizan inmuebles para 'Estudiantes'.\n");
        csv.append("- Estado del Negocio: El catalogo cuenta con un total de ").append(inmuebles.size()).append(" inmuebles. ").append(aprobados).append(" estan activos y visibles para el publico.\n");
        csv.append("- Traccion de Usuarios: La plataforma tiene registrados ").append(usuarios.size()).append(" usuarios operando en el sistema actualmente.\n\n");
        csv.append("=========================================================\n\n");

        csv.append("[ DETALLE DE INMUEBLES ]\n");
        csv.append("ID,Titulo,Barrio,Precio (USD),Ambientes,Superficie,Estado\n");

        for (InmuebleEntity i : inmuebles) {
            String tituloLimpio = i.getTitulo() != null ? i.getTitulo().replace("\"", "\"\"") : "Sin titulo";
            String barrioLimpio = i.getBarrio() != null ? i.getBarrio() : "N/A";
            String estado = i.getEstadoAprobacion() != null ? i.getEstadoAprobacion() : "Aprobado";
            String superficie = i.getSuperficie() != null ? i.getSuperficie().toString() : "N/A";

            csv.append(i.getId()).append(",")
                    .append("\"").append(tituloLimpio).append("\",")
                    .append("\"").append(barrioLimpio).append("\",")
                    .append(i.getPrecio()).append(",")
                    .append(i.getAmbientes()).append(",")
                    .append(superficie).append(",")
                    .append(estado)
                    .append("\n");
        }

        byte[] data = csv.toString().getBytes();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "Reporte_Analitico_GeoScore.csv");

        return ResponseEntity.ok().headers(headers).body(data);
    }
}