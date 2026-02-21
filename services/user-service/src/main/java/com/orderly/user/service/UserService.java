package com.orderly.user.service;

import com.orderly.user.dto.UserRequest;
import com.orderly.user.dto.UserResponse;
import com.orderly.user.exception.ResourceNotFoundException;
import com.orderly.user.mapper.UserMapper;
import com.orderly.user.model.User;
import com.orderly.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public List<UserResponse> findAll() {
        return repository.findAll().stream().map(UserMapper::toResponse).collect(Collectors.toList());
    }

    public UserResponse findById(Long id) {
        User user = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User " + id + " not found"));
        return UserMapper.toResponse(user);
    }

    public UserResponse create(UserRequest request) {
        if (repository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        User user = UserMapper.toEntity(request);
        repository.save(user);
        return UserMapper.toResponse(user);
    }

    public UserResponse update(Long id, UserRequest request) {
        User user = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User " + id + " not found"));
        UserMapper.update(user, request);
        repository.save(user);
        return UserMapper.toResponse(user);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("User " + id + " not found");
        }
        repository.deleteById(id);
    }
}
