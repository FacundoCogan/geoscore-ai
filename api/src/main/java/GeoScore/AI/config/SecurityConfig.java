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
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Invitados
                        .requestMatchers(HttpMethod.GET, "/api/inmuebles/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/evaluaciones/publicas").permitAll()

                        // Registrados
                        .requestMatchers(HttpMethod.POST, "/api/inmuebles/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/evaluaciones/**").authenticated()
                        .requestMatchers("/api/perfil/**").authenticated()

                        // Bloquear por defecto
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}