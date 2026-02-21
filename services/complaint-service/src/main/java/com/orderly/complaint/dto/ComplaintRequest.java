package com.orderly.complaint.dto;

import com.orderly.complaint.model.ComplaintStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ComplaintRequest {
    @NotNull
    private Long orderId;
    @NotNull
    private Long clientId;
    @NotBlank
    private String description;
    private ComplaintStatus status;
    private String response;
}
