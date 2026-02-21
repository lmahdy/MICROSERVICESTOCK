package com.orderly.store.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class StoreResponse {
    Long id;
    String name;
    String description;
    String address;
    String phone;
    String openingHours;
    Integer rating;
}
