package com.orderly.user.dto;

import com.orderly.user.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserRequest {
    @NotBlank
    private String fullName;
    @Email
    @NotBlank
    private String email;
    private String phone;
    private String address;
    private String externalId;
    @NotNull
    private Role role;
}
