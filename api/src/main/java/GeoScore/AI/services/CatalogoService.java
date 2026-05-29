package GeoScore.AI.services;

import GeoScore.AI.dto.CargaLogDTO;
import GeoScore.AI.entities.InmuebleEntity;
import GeoScore.AI.repositories.InmuebleRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class CatalogoService {

    private final InmuebleRepository inmuebleRepository;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");

    public CatalogoService(InmuebleRepository inmuebleRepository) {
        this.inmuebleRepository = inmuebleRepository;
    }

    public List<CargaLogDTO> procesarArchivoCSV(MultipartFile archivo) {
        List<CargaLogDTO> logs = new ArrayList<>();
        List<InmuebleEntity> inmueblesGuardar = new ArrayList<>();
        int omitidos = 0;

        try (BufferedReader br = new BufferedReader(new InputStreamReader(archivo.getInputStream()))) {
            String line = br.readLine();

            // A1: Archivo con formato incompatible (Validamos columnas)
            if (line == null || !line.contains("lat") || !line.contains("lng") || !line.contains("precio")) {
                logs.add(crearLog("ERROR", "Error FATAL: Estructura de archivo incompatible."));
                logs.add(crearLog("ERROR", "Faltan columnas requeridas: 'lat', 'lng', 'precio'."));
                logs.add(crearLog("WARN", "Proceso de importación detenido. Base de datos sin cambios."));
                return logs;
            }

            logs.add(crearLog("OK", "Archivo validado correctamente. Iniciando procesamiento..."));
            String[] headers = line.split(",");
            int filaIndex = 1;

            while ((line = br.readLine()) != null) {
                filaIndex++;
                String[] values = line.split(",");
                try {
                    String titulo = values[0];
                    Double precio = Double.parseDouble(values[1]);
                    Integer ambientes = Integer.parseInt(values[2]);
                    Double lat = Double.parseDouble(values[3]);
                    Double lng = Double.parseDouble(values[4]);

                    // A2: Error en la geolocalización (Validar si está dentro de CABA aprox)
                    if (lat > -34.50 || lat < -34.70 || lng > -58.30 || lng < -58.55) {
                        logs.add(crearLog("WARN", "Fila " + filaIndex + " omitida: Coordenadas (" + lat + ", " + lng + ") fuera de CABA."));
                        omitidos++;
                        continue;
                    }

                    InmuebleEntity inmueble = new InmuebleEntity();
                    inmueble.setTitulo(titulo);
                    inmueble.setPrecio(precio);
                    inmueble.setAmbientes(ambientes);
                    Point punto = geometryFactory.createPoint(new Coordinate(lng, lat));
                    inmueble.setUbicacion(punto);

                    inmueblesGuardar.add(inmueble);

                } catch (Exception e) {
                    logs.add(crearLog("WARN", "Fila " + filaIndex + " omitida: Datos corruptos o vacíos."));
                    omitidos++;
                }
            }

            // Camino Normal: Guardar en Base de Datos
            inmuebleRepository.saveAll(inmueblesGuardar);
            logs.add(crearLog("OK", inmueblesGuardar.size() + " registros procesados correctamente. " + omitidos + " omitidos."));

        } catch (Exception e) {
            logs.add(crearLog("ERROR", "Error al leer el archivo: " + e.getMessage()));
        }

        return logs;
    }

    private CargaLogDTO crearLog(String estado, String mensaje) {
        return new CargaLogDTO(LocalTime.now().format(timeFormatter), estado, mensaje);
    }
}