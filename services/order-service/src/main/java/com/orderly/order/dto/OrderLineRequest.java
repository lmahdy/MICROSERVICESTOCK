package com.orderly.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderLineRequest {
    @NotNull
    private Long productId;
    @NotNull
    @Min(1)
    private Integer quantity;
    // unitPrice is NOT sent by client — it is fetched from product-service via Feign
}
