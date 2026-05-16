package GeoScore.AI.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Buscamos el header de autorización
        final String authHeader = request.getHeader("Authorization");

        // Si no hay token, seguimos de largo
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 2. Agarramos el token limpio (sin la palabra Bearer)
            String token = authHeader.substring(7);

            // 3. Separamos el JWT en sus 3 partes (Header, Payload, Signature)
            String[] chunks = token.split("\\.");
            if (chunks.length != 3) {
                throw new RuntimeException("Formato de token JWT inválido");
            }

            // 4. Decodificamos solo el Payload (que está en Base64 URL Safe)
            String payload = new String(Base64.getUrlDecoder().decode(chunks[1]));

            // 5. Leemos el JSON para extraer el "sub" (que es el ID del usuario en Supabase)
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(payload);
            String userId = jsonNode.get("sub").asText();

            // 6. Autenticamos al usuario en Spring Security
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userId, null, new ArrayList<>());

            SecurityContextHolder.getContext().setAuthentication(authToken);

        } catch (Exception e) {
            System.out.println("Error decodificando el JWT de Supabase: " + e.getMessage());
        }

        // Dejamos que la petición siga su curso hacia el Controlador
        filterChain.doFilter(request, response);
    }
}