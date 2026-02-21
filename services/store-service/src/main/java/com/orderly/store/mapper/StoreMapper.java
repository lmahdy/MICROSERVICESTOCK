package com.orderly.store.mapper;

import com.orderly.store.dto.StoreRequest;
import com.orderly.store.dto.StoreResponse;
import com.orderly.store.model.Store;

public class StoreMapper {
    private StoreMapper() {}

    public static Store toEntity(StoreRequest request) {
        Store s = new Store();
        s.setName(request.getName());
        s.setDescription(request.getDescription());
        s.setAddress(request.getAddress());
        s.setPhone(request.getPhone());
        s.setOpeningHours(request.getOpeningHours());
        s.setRating(request.getRating());
        return s;
    }

    public static void update(Store s, StoreRequest request) {
        s.setName(request.getName());
        s.setDescription(request.getDescription());
        s.setAddress(request.getAddress());
        s.setPhone(request.getPhone());
        s.setOpeningHours(request.getOpeningHours());
        s.setRating(request.getRating());
    }

    public static StoreResponse toResponse(Store s) {
        return StoreResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .description(s.getDescription())
                .address(s.getAddress())
                .phone(s.getPhone())
                .openingHours(s.getOpeningHours())
                .rating(s.getRating())
                .build();
    }
}
