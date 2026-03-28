package com.orderly.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    @NotNull
    private Long clientId;
    @NotNull
    private Long storeId;
    /** Delivery address for the order */
    private String deliveryAddress;
    /** Items: product + quantity. totalAmount is AUTO-CALCULATED via Feign from product-service. */
    @Valid
    @NotEmpty
    private List<OrderLineRequest> items;
}
