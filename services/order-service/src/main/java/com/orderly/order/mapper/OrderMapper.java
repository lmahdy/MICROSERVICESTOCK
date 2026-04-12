package com.orderly.order.mapper;

import com.orderly.order.dto.OrderLineRequest;
import com.orderly.order.dto.OrderRequest;
import com.orderly.order.dto.OrderResponse;
import com.orderly.order.model.Order;
import com.orderly.order.model.OrderLine;

import java.util.List;
import java.util.stream.Collectors;

public class OrderMapper {
    private OrderMapper() {}

    /** Lightweight entity creation — totalAmount set separately after Feign calls */
    public static Order toEntity(OrderRequest request) {
        Order order = new Order();
        order.setClientId(request.getClientId());
        order.setStoreId(request.getStoreId());
        order.setDeliveryAddress(request.getDeliveryAddress());
        return order;
    }

    public static OrderResponse toResponse(Order order) {
        List<OrderResponse.OrderLineDto> items = order.getItems().stream().map(line ->
                OrderResponse.OrderLineDto.builder()
                        .id(line.getId())
                        .productId(line.getProductId())
                        .quantity(line.getQuantity())
                        .unitPrice(line.getUnitPrice())
                        .build()).collect(Collectors.toList());
        return OrderResponse.builder()
                .id(order.getId())
                .clientId(order.getClientId())
                .storeId(order.getStoreId())
                .deliveryAddress(order.getDeliveryAddress())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(items)
                .build();
    }

    public static OrderLine toLine(OrderLineRequest req) {
        OrderLine line = new OrderLine();
        line.setProductId(req.getProductId());
        line.setQuantity(req.getQuantity());
        // unitPrice set externally from Feign call
        return line;
    }
}
