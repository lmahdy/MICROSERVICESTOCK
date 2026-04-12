package com.orderly.product.service;

import com.orderly.product.dto.ProductRequest;
import com.orderly.product.dto.ProductResponse;
import com.orderly.product.exception.ResourceNotFoundException;
import com.orderly.product.mapper.ProductMapper;
import com.orderly.product.model.Product;
import com.orderly.product.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {
    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    public List<ProductResponse> findAll() {
        return repository.findAll().stream().map(ProductMapper::toResponse).collect(Collectors.toList());
    }

    public ProductResponse findById(Long id) {
        Product p = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product " + id + " not found"));
        return ProductMapper.toResponse(p);
    }

    public List<ProductResponse> findByStore(Long storeId) {
        return repository.findByStoreId(storeId).stream().map(ProductMapper::toResponse).toList();
    }

    public ProductResponse create(ProductRequest request) {
        Product p = ProductMapper.toEntity(request);
        repository.save(p);
        return ProductMapper.toResponse(p);
    }

    public ProductResponse update(Long id, ProductRequest request) {
        Product p = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product " + id + " not found"));
        ProductMapper.update(p, request);
        repository.save(p);
        return ProductMapper.toResponse(p);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Product " + id + " not found");
        }
        repository.deleteById(id);
    }
}
