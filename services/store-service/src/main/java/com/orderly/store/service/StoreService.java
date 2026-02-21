package com.orderly.store.service;

import com.orderly.store.dto.StoreRequest;
import com.orderly.store.dto.StoreResponse;
import com.orderly.store.exception.ResourceNotFoundException;
import com.orderly.store.mapper.StoreMapper;
import com.orderly.store.model.Store;
import com.orderly.store.repository.StoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class StoreService {
    private final StoreRepository repository;

    public StoreService(StoreRepository repository) {
        this.repository = repository;
    }

    public List<StoreResponse> findAll() {
        return repository.findAll().stream().map(StoreMapper::toResponse).collect(Collectors.toList());
    }

    public StoreResponse findById(Long id) {
        Store store = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Store " + id + " not found"));
        return StoreMapper.toResponse(store);
    }

    public StoreResponse create(StoreRequest request) {
        Store store = StoreMapper.toEntity(request);
        repository.save(store);
        return StoreMapper.toResponse(store);
    }

    public StoreResponse update(Long id, StoreRequest request) {
        Store store = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Store " + id + " not found"));
        StoreMapper.update(store, request);
        repository.save(store);
        return StoreMapper.toResponse(store);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Store " + id + " not found");
        }
        repository.deleteById(id);
    }
}
