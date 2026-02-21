package com.orderly.delivery.service;

import com.orderly.delivery.dto.DeliveryRequest;
import com.orderly.delivery.dto.DeliveryResponse;
import com.orderly.delivery.exception.ResourceNotFoundException;
import com.orderly.delivery.mapper.DeliveryMapper;
import com.orderly.delivery.model.Delivery;
import com.orderly.delivery.model.DeliveryStatus;
import com.orderly.delivery.repository.DeliveryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DeliveryService {

    private final DeliveryRepository repository;

    public DeliveryService(DeliveryRepository repository) {
        this.repository = repository;
    }

    public List<DeliveryResponse> findAll() {
        return repository.findAll().stream().map(DeliveryMapper::toResponse).collect(Collectors.toList());
    }

    public DeliveryResponse findById(Long id) {
        Delivery d = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Delivery " + id + " not found"));
        return DeliveryMapper.toResponse(d);
    }

    public List<DeliveryResponse> findByCourier(Long courierId) {
        return repository.findByCourierId(courierId).stream().map(DeliveryMapper::toResponse).toList();
    }

    public List<DeliveryResponse> findByOrder(Long orderId) {
        return repository.findByOrderId(orderId).stream().map(DeliveryMapper::toResponse).toList();
    }

    public DeliveryResponse create(DeliveryRequest request) {
        Delivery d = DeliveryMapper.toEntity(request);
        repository.save(d);
        return DeliveryMapper.toResponse(d);
    }

    public DeliveryResponse update(Long id, DeliveryRequest request) {
        Delivery d = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Delivery " + id + " not found"));
        DeliveryMapper.update(d, request);
        repository.save(d);
        return DeliveryMapper.toResponse(d);
    }

    public DeliveryResponse updateStatus(Long id, DeliveryStatus status) {
        Delivery d = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Delivery " + id + " not found"));
        d.setStatus(status);
        repository.save(d);
        return DeliveryMapper.toResponse(d);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Delivery " + id + " not found");
        }
        repository.deleteById(id);
    }
}
