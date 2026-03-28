package com.orderly.delivery.service;

import com.orderly.delivery.dto.DeliveryRequest;
import com.orderly.delivery.dto.DeliveryResponse;
import com.orderly.delivery.exception.ResourceNotFoundException;
import com.orderly.delivery.mapper.DeliveryMapper;
import com.orderly.delivery.messaging.DeliveryMessagingConfig;
import com.orderly.delivery.model.Delivery;
import com.orderly.delivery.model.DeliveryStatus;
import com.orderly.delivery.repository.DeliveryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DeliveryService {

    private static final Logger log = LoggerFactory.getLogger(DeliveryService.class);

    private final DeliveryRepository repository;
    private final RabbitTemplate rabbitTemplate;
    private final RestTemplate restTemplate;

    public DeliveryService(DeliveryRepository repository, RabbitTemplate rabbitTemplate, RestTemplate restTemplate) {
        this.repository = repository;
        this.rabbitTemplate = rabbitTemplate;
        this.restTemplate = restTemplate;
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

    /**
     * Updates delivery status.
     * When DELIVERED:
     *   1. Publishes DELIVERY_DELIVERED event to RabbitMQ (notification-service will notify client)
     *   2. Calls order-service via Gateway to mark order as DELIVERED
     */
    public DeliveryResponse updateStatus(Long id, DeliveryStatus status) {
        Delivery d = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Delivery " + id + " not found"));
        d.setStatus(status);
        repository.save(d);
        log.info("[DELIVERY] Delivery {} status updated to {}", id, status);

        if (status == DeliveryStatus.DELIVERED) {
            // 1. Publish async event for notification
            DeliveryMessagingConfig.publishDeliveryEvent(rabbitTemplate, d.getOrderId(), d.getCourierId());

            // 2. Update order status to DELIVERED via Gateway
            try {
                String url = "http://localhost:9016/api/orders/" + d.getOrderId() + "/status/DELIVERED";
                restTemplate.exchange(url, HttpMethod.PATCH, HttpEntity.EMPTY, String.class);
                log.info("[DELIVERY] Order {} updated to DELIVERED via Gateway", d.getOrderId());
            } catch (Exception e) {
                log.warn("[DELIVERY] Could not update order status via Gateway: {}", e.getMessage());
            }
        }

        return DeliveryMapper.toResponse(d);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Delivery " + id + " not found");
        }
        repository.deleteById(id);
    }
}
