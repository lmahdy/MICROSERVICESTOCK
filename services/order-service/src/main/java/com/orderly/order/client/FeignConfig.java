package com.orderly.order.client;

import feign.RequestInterceptor;
import feign.codec.ErrorDecoder;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

/**
 * Feign configuration — used only by @FeignClient(configuration = FeignConfig.class).
 * Do NOT add @Configuration here; Spring Cloud OpenFeign registers these beans per-client.
 */
public class FeignConfig {

    /**
     * Propagates the incoming JWT token to outgoing Feign requests.
     * This is critical for service-to-service authentication when
     * the target service (e.g., product-service) requires a valid JWT.
     */
    @Bean
    public RequestInterceptor jwtPropagatingInterceptor() {
        return requestTemplate -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth instanceof JwtAuthenticationToken jwtAuth) {
                String tokenValue = jwtAuth.getToken().getTokenValue();
                requestTemplate.header("Authorization", "Bearer " + tokenValue);
            }
        };
    }

    @Bean
    public ErrorDecoder feignErrorDecoder() {
        return (methodKey, response) -> {
            if (response.status() == 404) {
                return new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Product not found — please use a valid productId");
            }
            return new ResponseStatusException(HttpStatus.valueOf(response.status()),
                    "Error calling product-service: " + response.reason());
        };
    }
}
