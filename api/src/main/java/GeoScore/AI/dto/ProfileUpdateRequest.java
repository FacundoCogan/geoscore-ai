package GeoScore.AI.dto;

public class ProfileUpdateRequest {
    private String userId; // El UUID que viene de Supabase
    private String profile; // student, fitness, health, mobility

    // Getters y Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getProfile() { return profile; }
    public void setProfile(String profile) { this.profile = profile; }
}