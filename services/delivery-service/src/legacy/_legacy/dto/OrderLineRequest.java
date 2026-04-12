package com.orderly.order.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderLineRequest {
    @NotNull
    private Long productId;
    @NotNull
    private Integer quantity;
    @NotNull
    private BigDecimal unitPrice;
}
