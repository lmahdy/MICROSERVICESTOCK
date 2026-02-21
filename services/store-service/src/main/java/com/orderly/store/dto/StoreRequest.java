package com.orderly.store.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StoreRequest {
    @NotBlank
    private String name;
    private String description;
    private String address;
    private String phone;
    private String openingHours;
    private Integer rating;
}
