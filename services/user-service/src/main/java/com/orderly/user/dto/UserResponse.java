package com.orderly.user.dto;

import com.orderly.user.model.Role;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class UserResponse {
    Long id;
    String fullName;
    String email;
    String phone;
    String address;
    String externalId;
    Role role;
    Instant createdAt;
}
