package com.orderly.order.controller;

import com.orderly.order.client.ProductDTO;
import com.orderly.order.dto.OrderRequest;
import com.orderly.order.dto.OrderResponse;
import com.orderly.order.model.OrderStatus;
import com.orderly.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<OrderResponse> all() {
        return orderService.findAll();
    }

    @GetMapping("/{id}")
    public OrderResponse one(@PathVariable Long id) {
        return orderService.findById(id);
    }

    @GetMapping("/client/{clientId}")
    public List<OrderResponse> byClient(@PathVariable String clientId) {
        return orderService.findByClient(clientId);
    }

    /**
     * SYNCHRONOUS FEIGN — calls product-service to get product details for this order.
     * Demonstrates inter-service communication: Order Service → Product Service via OpenFeign.
     */
    @GetMapping("/{id}/products")
    public List<ProductDTO> getOrderProducts(@PathVariable Long id) {
        return orderService.getProductsForOrder(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse create(@Valid @RequestBody OrderRequest request) {
        return orderService.create(request);
    }

    @PutMapping("/{id}")
    public OrderResponse update(@PathVariable Long id, @Valid @RequestBody OrderRequest request) {
        return orderService.update(id, request);
    }

    @PatchMapping("/{id}/status/{status}")
    public OrderResponse updateStatus(@PathVariable Long id, @PathVariable OrderStatus status) {
        return orderService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        orderService.delete(id);
    }
}

