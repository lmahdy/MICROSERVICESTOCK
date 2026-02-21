package com.orderly.product.mapper;

import com.orderly.product.dto.ProductRequest;
import com.orderly.product.dto.ProductResponse;
import com.orderly.product.model.Product;

public class ProductMapper {
    private ProductMapper() {}

    public static Product toEntity(ProductRequest request) {
        Product p = new Product();
        p.setName(request.getName());
        p.setDescription(request.getDescription());
        p.setPrice(request.getPrice());
        p.setStoreId(request.getStoreId());
        if (request.getAvailable() != null) p.setAvailable(request.getAvailable());
        p.setRating(request.getRating());
        return p;
    }

    public static void update(Product p, ProductRequest request) {
        p.setName(request.getName());
        p.setDescription(request.getDescription());
        p.setPrice(request.getPrice());
        p.setStoreId(request.getStoreId());
        if (request.getAvailable() != null) p.setAvailable(request.getAvailable());
        p.setRating(request.getRating());
    }

    public static ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .storeId(p.getStoreId())
                .available(p.isAvailable())
                .rating(p.getRating())
                .build();
    }
}
