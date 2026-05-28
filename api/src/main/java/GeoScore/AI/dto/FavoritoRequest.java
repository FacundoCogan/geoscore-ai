package GeoScore.AI.dto;

public class FavoritoRequest {
    private String userId;
    private String inmuebleId;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getInmuebleId() { return inmuebleId; }
    public void setInmuebleId(String inmuebleId) { this.inmuebleId = inmuebleId; }
}