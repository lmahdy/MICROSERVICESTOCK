package com.orderly.complaint.controller;

import com.orderly.complaint.dto.ComplaintRequest;
import com.orderly.complaint.dto.ComplaintResponse;
import com.orderly.complaint.model.ComplaintStatus;
import com.orderly.complaint.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService service;

    public ComplaintController(ComplaintService service) { this.service = service; }

    @GetMapping
    public List<ComplaintResponse> all() { return service.findAll(); }

    @GetMapping("/{id}")
    public ComplaintResponse one(@PathVariable Long id) { return service.findById(id); }

    @GetMapping("/client/{clientId}")
    public List<ComplaintResponse> byClient(@PathVariable Long clientId) { return service.byClient(clientId); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ComplaintResponse create(@Valid @RequestBody ComplaintRequest request) { return service.create(request); }

    @PutMapping("/{id}")
    public ComplaintResponse update(@PathVariable Long id, @Valid @RequestBody ComplaintRequest request) { return service.update(id, request); }

    @PatchMapping("/{id}/status/{status}")
    public ComplaintResponse updateStatus(@PathVariable Long id, @PathVariable ComplaintStatus status) { return service.updateStatus(id, status); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
