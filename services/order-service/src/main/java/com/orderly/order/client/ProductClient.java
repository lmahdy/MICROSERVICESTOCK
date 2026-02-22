package com.orderly.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

/**
 * Feign client for synchronous communication with product-service.
 * Uses Eureka service name "product-service" — no hard-coded URL needed.
 * Spring Cloud discovers the actual address via Eureka.
 */
@FeignClient(name = "product-service", configuration = FeignConfig.class)
public interface ProductClient {

    @GetMapping("/api/products/{id}")
    ProductDTO getProductById(@PathVariable("id") Long id);

    @GetMapping("/api/products")
    List<ProductDTO> getAllProducts();
}
