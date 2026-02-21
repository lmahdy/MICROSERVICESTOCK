package com.orderly.delivery.dto;

import com.orderly.delivery.model.DeliveryStatus;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class DeliveryResponse {
    Long id;
    Long orderId;
    Long courierId;
    DeliveryStatus status;
    String estimatedTime;
    String notes;
    Instant createdAt;
    Instant updatedAt;
}
