package com.orderly.product.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder
public class ProductResponse {
    Long id;
    String name;
    String description;
    BigDecimal price;
    Long storeId;
    boolean available;
    Integer rating;
}
