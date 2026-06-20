package GeoScore.AI.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Accesos públicos al catálogo y mapa
                        .requestMatchers(HttpMethod.GET, "/api/inmuebles").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/inmuebles/*/analisis").permitAll()

                        // Permitir el registro público
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/registro").permitAll()

                        // Accesos Administrativos y Dashboards
                        .requestMatchers(HttpMethod.GET, "/api/admin/usuarios").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/admin/usuarios/*/estado").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/admin/usuarios/*/rol").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/admin/dashboard/**").permitAll()

                        .requestMatchers("/api/notificaciones", "/api/notificaciones/**").permitAll()

                        // Liberar Perfiles
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/usuarios/**").permitAll()

                        // Liberar Favoritos
                        .requestMatchers("/api/favoritos", "/api/favoritos/**").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/inmuebles/**").permitAll()

                        // Liberar la sincronización de mapas
                        .requestMatchers(HttpMethod.POST, "/api/geo/sync").permitAll()

                        // Liberar el CRUD del portal de Inmuebles
                        .requestMatchers("/api/admin/inmuebles", "/api/admin/inmuebles/**").permitAll()

                        // El resto requiere usuario logueado
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "https://geoscore-ai-pu66-a9wccqs14-facundocogans-projects.vercel.app"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}