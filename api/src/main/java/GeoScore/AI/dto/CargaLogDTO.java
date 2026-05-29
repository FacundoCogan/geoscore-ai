package GeoScore.AI.dto;

public class CargaLogDTO {
    private String hora;
    private String estado; // OK, WARN, ERROR
    private String mensaje;

    public CargaLogDTO(String hora, String estado, String mensaje) {
        this.hora = hora;
        this.estado = estado;
        this.mensaje = mensaje;
    }

    public String getHora() { return hora; }
    public String getEstado() { return estado; }
    public String getMensaje() { return mensaje; }
}