package com.orderly.user.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // TEMPORARILY DISABLED AUTHENTICATION FOR TESTING
        // TODO: Re-enable OAuth2 JWT when Keycloak is running
        http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll());
        
        // Keep frame options disabled for H2 console
        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));
        
        /* ORIGINAL CONFIG - RE-ENABLE WHEN KEYCLOAK IS READY:
        http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/h2-console/**").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));
        */
        
        return http.build();
    }
}
