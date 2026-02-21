package com.orderly.user.mapper;

import com.orderly.user.dto.UserRequest;
import com.orderly.user.dto.UserResponse;
import com.orderly.user.model.User;

public class UserMapper {
    private UserMapper() {}

    public static User toEntity(UserRequest request) {
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setExternalId(request.getExternalId());
        user.setRole(request.getRole());
        return user;
    }

    public static void update(User user, UserRequest request) {
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setExternalId(request.getExternalId());
        user.setRole(request.getRole());
    }

    public static UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .externalId(user.getExternalId())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
