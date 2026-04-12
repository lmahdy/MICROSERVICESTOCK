package com.orderly.delivery.dto;

import com.orderly.delivery.model.DeliveryStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeliveryRequest {
    @NotNull
    private Long orderId;
    @NotNull
    private String courierId;
    private String clientId;
    private DeliveryStatus status;
    private String estimatedTime;
    private String notes;
}
