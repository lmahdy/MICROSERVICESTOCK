package com.orderly.delivery.mapper;

import com.orderly.delivery.dto.DeliveryRequest;
import com.orderly.delivery.dto.DeliveryResponse;
import com.orderly.delivery.model.Delivery;

public class DeliveryMapper {
    private DeliveryMapper() {}

    public static Delivery toEntity(DeliveryRequest request) {
        Delivery d = new Delivery();
        d.setOrderId(request.getOrderId());
        d.setCourierId(request.getCourierId());
        d.setEstimatedTime(request.getEstimatedTime());
        d.setNotes(request.getNotes());
        if (request.getStatus() != null) d.setStatus(request.getStatus());
        return d;
    }

    public static void update(Delivery d, DeliveryRequest request) {
        d.setOrderId(request.getOrderId());
        d.setCourierId(request.getCourierId());
        d.setEstimatedTime(request.getEstimatedTime());
        d.setNotes(request.getNotes());
        if (request.getStatus() != null) d.setStatus(request.getStatus());
    }

    public static DeliveryResponse toResponse(Delivery d) {
        return DeliveryResponse.builder()
                .id(d.getId())
                .orderId(d.getOrderId())
                .courierId(d.getCourierId())
                .status(d.getStatus())
                .estimatedTime(d.getEstimatedTime())
                .notes(d.getNotes())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }
}
