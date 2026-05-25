package com.ikon.taskmanagement.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.ikon.webservice.security.IkonJwtTokenConverter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private Converter<Jwt, JwtAuthenticationToken> ikonJwtTokenConverter = new IkonJwtTokenConverter(
            new JwtGrantedAuthoritiesConverter());

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // ENABLE CORS - This is critical for cross-origin requests
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests((authorize) -> {
                    authorize
                            // 1. Allow all actuator health endpoints first
                            .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                            // 2. Authenticate all other requests
                            .anyRequest().authenticated();
                })
                .oauth2ResourceServer((oauth2) -> {
                    oauth2.jwt((jwt) -> jwt.jwtAuthenticationConverter(ikonJwtTokenConverter));
                });

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow requests from localhost (for development) and your production domain
        configuration.setAllowedOriginPatterns(
                Arrays.asList(
                        "http://localhost:*", // Local development
                        "https://*.keross.com", // Production domain
                        "http://103.121.157.108", // Your server IP
                        "http://103.121.157.108:*" // Your server IP with any port
                ));

        // Allow all standard HTTP methods
        configuration.setAllowedMethods(
                Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));

        // Allow all headers (or specify specific ones)
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Allow credentials (cookies, authorization headers, etc.)
        configuration.setAllowCredentials(true);

        // Cache preflight response for 1 hour
        configuration.setMaxAge(3600L);

        // Expose headers that the client can access
        configuration.setExposedHeaders(
                Arrays.asList(
                        "Authorization",
                        "Content-Type",
                        "Content-Disposition",
                        "X-Total-Count" // If you use pagination headers
                ));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}