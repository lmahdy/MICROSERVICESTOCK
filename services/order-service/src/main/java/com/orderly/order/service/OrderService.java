package com.orderly.order.service;

import com.orderly.order.dto.OrderRequest;
import com.orderly.order.dto.OrderResponse;
import com.orderly.order.exception.ResourceNotFoundException;
import com.orderly.order.mapper.OrderMapper;
import com.orderly.order.model.Order;
import com.orderly.order.model.OrderStatus;
import com.orderly.order.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    private final OrderRepository repository;

    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }

    public List<OrderResponse> findAll() {
        return repository.findAll().stream().map(OrderMapper::toResponse).collect(Collectors.toList());
    }

    public OrderResponse findById(Long id) {
        Order order = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order " + id + " not found"));
        return OrderMapper.toResponse(order);
    }

    public List<OrderResponse> findByClient(Long clientId) {
        return repository.findByClientId(clientId).stream().map(OrderMapper::toResponse).toList();
    }

    public OrderResponse create(OrderRequest request) {
        Order order = OrderMapper.toEntity(request);
        repository.save(order);
        return OrderMapper.toResponse(order);
    }

    public OrderResponse update(Long id, OrderRequest request) {
        Order order = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order " + id + " not found"));
        OrderMapper.update(order, request);
        repository.save(order);
        return OrderMapper.toResponse(order);
    }

    public OrderResponse updateStatus(Long id, OrderStatus status) {
        Order order = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order " + id + " not found"));
        order.setStatus(status);
        repository.save(order);
        return OrderMapper.toResponse(order);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Order " + id + " not found");
        }
        repository.deleteById(id);
    }
}
