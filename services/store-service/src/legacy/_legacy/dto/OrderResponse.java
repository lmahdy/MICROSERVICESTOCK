package com.orderly.order.dto;

import com.orderly.order.model.OrderStatus;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Value
@Builder
public class OrderResponse {
    Long id;
    Long clientId;
    Long storeId;
    BigDecimal totalAmount;
    String deliveryAddress;
    OrderStatus status;
    Instant createdAt;
    Instant updatedAt;
    List<OrderLineDto> items;

    @Value
    @Builder
    public static class OrderLineDto {
        Long id;
        Long productId;
        Integer quantity;
        BigDecimal unitPrice;
    }
}
