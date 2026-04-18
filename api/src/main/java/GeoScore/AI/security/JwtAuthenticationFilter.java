package GeoScore.AI.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${supabase.jwt.secret}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Buscamos el header de autorización
        final String authHeader = request.getHeader("Authorization");

        // Si no hay token, o no empieza con "Bearer ", seguimos de largo (quizás es un invitado)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 2. Extraemos el token (sacamos la palabra "Bearer")
            final String jwt = authHeader.substring(7);

            // 3. Preparamos la llave secreta para desencriptar
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

            // 4. Leemos el token y verificamos la firma
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(jwt)
                    .getPayload();

            // En Supabase, el campo "sub" (Subject) contiene el UUID único del usuario
            String userId = claims.getSubject();

            // 5. Si el token es válido y no hay nadie logueado en este hilo, lo registramos
            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Creamos la credencial interna de Spring
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userId, null, new ArrayList<>() // Acá podríamos sumar Roles si usáramos (Admin, User)
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Usuario autenticado para esta petición
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            // Si el token expiró o la firma es falsa, ignoramos el token.
            // Más adelante Spring Security le devolverá un Error 401 (No autorizado).
            System.out.println("Token JWT inválido o expirado: " + e.getMessage());
        }

        // Dejamos que la petición siga su curso
        filterChain.doFilter(request, response);
    }
}