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

    public static Order toEntity(OrderRequest request) {
        Order order = new Order();
        order.setClientId(request.getClientId());
        order.setStoreId(request.getStoreId());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setTotalAmount(request.getTotalAmount());
        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }
        if (request.getItems() != null) {
            order.setItems(request.getItems().stream().map(OrderMapper::toLine).collect(Collectors.toList()));
        }
        return order;
    }

    public static void update(Order order, OrderRequest request) {
        order.setClientId(request.getClientId());
        order.setStoreId(request.getStoreId());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setTotalAmount(request.getTotalAmount());
        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }
        order.getItems().clear();
        if (request.getItems() != null) {
            order.getItems().addAll(request.getItems().stream().map(OrderMapper::toLine).toList());
        }
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

    private static OrderLine toLine(OrderLineRequest req) {
        OrderLine line = new OrderLine();
        line.setProductId(req.getProductId());
        line.setQuantity(req.getQuantity());
        line.setUnitPrice(req.getUnitPrice());
        return line;
    }
}
