package com.orderly.order.dto;

import com.orderly.order.model.OrderStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequest {
    @NotNull
    private Long clientId;
    @NotNull
    private Long storeId;
    @NotNull
    private BigDecimal totalAmount;
    private String deliveryAddress;
    @Valid
    private List<OrderLineRequest> items;
    private OrderStatus status;
}
