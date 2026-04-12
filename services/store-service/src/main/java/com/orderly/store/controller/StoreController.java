package com.orderly.store.controller;

import com.orderly.store.dto.StoreRequest;
import com.orderly.store.dto.StoreResponse;
import com.orderly.store.service.StoreService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
public class StoreController {

    private final StoreService service;

    public StoreController(StoreService service) { this.service = service; }

    @GetMapping
    public List<StoreResponse> all() { return service.findAll(); }

    @GetMapping("/{id}")
    public StoreResponse one(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StoreResponse create(@Valid @RequestBody StoreRequest request) { return service.create(request); }

    @PutMapping("/{id}")
    public StoreResponse update(@PathVariable Long id, @Valid @RequestBody StoreRequest request) { return service.update(id, request); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
