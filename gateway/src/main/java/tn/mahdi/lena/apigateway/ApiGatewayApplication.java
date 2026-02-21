package tn.mahdi.lena.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("users", r -> r.path("/api/users/**").uri("lb://user-service"))
                .route("stores", r -> r.path("/api/stores/**").uri("lb://store-service"))
                .route("products", r -> r.path("/api/products/**").uri("lb://product-service"))
                .route("orders", r -> r.path("/api/orders/**").uri("lb://order-service"))
                .route("deliveries", r -> r.path("/api/deliveries/**").uri("lb://delivery-service"))
                .route("complaints", r -> r.path("/api/complaints/**").uri("lb://complaint-service"))
                .route("notifications", r -> r.path("/api/notifications/**").uri("lb://notification-service"))
                .build();
    }
}
