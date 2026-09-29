package com.jobtracker.jobtracker;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // CORS configuration
                .cors(cors -> cors
                        .configurationSource(corsConfigurationSource())
                )

                // CSRF disabled because we are using JWT
                .csrf(csrf -> csrf.disable())

                // No HTTP session; JWT handles authentication
                .sessionManagement(session -> session
                        .sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // Authorization rules
                .authorizeHttpRequests(auth -> auth

                        // Login and registration are public
                        .requestMatchers("/api/auth/**").permitAll()

                        // ADMIN endpoints
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        // STUDENT endpoints
                        .requestMatchers("/api/student/**")
                        .hasRole("STUDENT")

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )

                // Authentication / authorization error handling
                .exceptionHandling(ex -> ex

                        // No valid authentication
                        .authenticationEntryPoint(
                                (request, response, authException) -> {
                                    response.setStatus(
                                            HttpServletResponse.SC_UNAUTHORIZED
                                    );
                                    response.getWriter()
                                            .write("Unauthorized");
                                }
                        )

                        // User is authenticated but lacks required role
                        .accessDeniedHandler(
                                (request, response, accessDeniedException) -> {
                                    response.setStatus(
                                            HttpServletResponse.SC_FORBIDDEN
                                    );
                                    response.getWriter()
                                            .write("Forbidden");
                                }
                        )
                )

                // Run JWT filter before Spring's username/password filter
                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        config.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        config.setAllowedHeaders(
                List.of("*")
        );

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                config
        );

        return source;
    }
}