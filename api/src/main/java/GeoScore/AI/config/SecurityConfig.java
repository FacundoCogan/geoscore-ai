package GeoScore.AI.config;

import GeoScore.AI.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

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
                // 1. CORS primero: para que el navegador sepa si tiene permiso antes de seguir
                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
                    corsConfiguration.setAllowedOrigins(java.util.List.of("http://localhost:3000"));
                    corsConfiguration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    corsConfiguration.setAllowedHeaders(java.util.List.of("*"));
                    return corsConfiguration;
                }))
                // 2. Desactivar CSRF (estamos en una API Stateless)
                .csrf(csrf -> csrf.disable())
                // 3. Manejo de sesión
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // 4. Autorizaciones
                .authorizeHttpRequests(auth -> auth
                        // Invitados
                        .requestMatchers(HttpMethod.GET, "/api/inmuebles/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/evaluaciones/publicas").permitAll()
                        // Registrados
                        .requestMatchers(HttpMethod.POST, "/api/inmuebles/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/evaluaciones/**").authenticated()
                        .requestMatchers("/api/perfil/**").authenticated()
                        .anyRequest().authenticated()
                )
                // 5. Filtro JWT
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}