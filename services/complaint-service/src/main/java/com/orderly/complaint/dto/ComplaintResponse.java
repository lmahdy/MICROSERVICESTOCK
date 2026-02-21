package com.orderly.complaint.dto;

import com.orderly.complaint.model.ComplaintStatus;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class ComplaintResponse {
    Long id;
    Long orderId;
    Long clientId;
    String description;
    ComplaintStatus status;
    String response;
    Instant createdAt;
    Instant updatedAt;
}
