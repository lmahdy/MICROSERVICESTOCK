package com.orderly.product.controller;

import com.orderly.product.dto.ProductRequest;
import com.orderly.product.dto.ProductResponse;
import com.orderly.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProductResponse> all() { return service.findAll(); }

    @GetMapping("/{id}")
    public ProductResponse one(@PathVariable Long id) { return service.findById(id); }

    @GetMapping("/store/{storeId}")
    public List<ProductResponse> byStore(@PathVariable Long storeId) { return service.findByStore(storeId); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductRequest request) { return service.create(request); }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) { return service.update(id, request); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
