package com.orderly.complaint.mapper;

import com.orderly.complaint.dto.ComplaintRequest;
import com.orderly.complaint.dto.ComplaintResponse;
import com.orderly.complaint.model.Complaint;

public class ComplaintMapper {
    private ComplaintMapper() {}

    public static Complaint toEntity(ComplaintRequest req) {
        Complaint c = new Complaint();
        c.setOrderId(req.getOrderId());
        c.setClientId(req.getClientId());
        c.setDescription(req.getDescription());
        if (req.getStatus() != null) c.setStatus(req.getStatus());
        c.setResponse(req.getResponse());
        return c;
    }

    public static void update(Complaint c, ComplaintRequest req) {
        c.setOrderId(req.getOrderId());
        c.setClientId(req.getClientId());
        c.setDescription(req.getDescription());
        if (req.getStatus() != null) c.setStatus(req.getStatus());
        c.setResponse(req.getResponse());
    }

    public static ComplaintResponse toResponse(Complaint c) {
        return ComplaintResponse.builder()
                .id(c.getId())
                .orderId(c.getOrderId())
                .clientId(c.getClientId())
                .description(c.getDescription())
                .status(c.getStatus())
                .response(c.getResponse())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
