package com.orderly.delivery.controller;

import com.orderly.delivery.dto.DeliveryRequest;
import com.orderly.delivery.dto.DeliveryResponse;
import com.orderly.delivery.model.DeliveryStatus;
import com.orderly.delivery.service.DeliveryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryService service;

    public DeliveryController(DeliveryService service) {
        this.service = service;
    }

    @GetMapping
    public List<DeliveryResponse> all() { return service.findAll(); }

    @GetMapping("/{id}")
    public DeliveryResponse one(@PathVariable Long id) { return service.findById(id); }

    @GetMapping("/courier/{courierId}")
    public List<DeliveryResponse> byCourier(@PathVariable Long courierId) { return service.findByCourier(courierId); }

    @GetMapping("/order/{orderId}")
    public List<DeliveryResponse> byOrder(@PathVariable Long orderId) { return service.findByOrder(orderId); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DeliveryResponse create(@Valid @RequestBody DeliveryRequest request) { return service.create(request); }

    @PutMapping("/{id}")
    public DeliveryResponse update(@PathVariable Long id, @Valid @RequestBody DeliveryRequest request) { return service.update(id, request); }

    @PatchMapping("/{id}/status/{status}")
    public DeliveryResponse updateStatus(@PathVariable Long id, @PathVariable DeliveryStatus status) { return service.updateStatus(id, status); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
