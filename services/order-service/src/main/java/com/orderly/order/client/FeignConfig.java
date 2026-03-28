package com.orderly.order.client;

import feign.codec.ErrorDecoder;
import org.springframework.context.annotation.Bean;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

/**
 * Feign configuration — used only by @FeignClient(configuration = FeignConfig.class).
 * Do NOT add @Configuration here; Spring Cloud OpenFeign registers these beans per-client.
 * Default Spring decoder/encoder handles Jackson deserialization (ignores unknown fields).
 */
public class FeignConfig {

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
