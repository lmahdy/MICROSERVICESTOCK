package com.orderly.order.service;

import com.orderly.order.client.ProductClient;
import com.orderly.order.client.ProductDTO;
import com.orderly.order.dto.OrderRequest;
import com.orderly.order.dto.OrderResponse;
import com.orderly.order.exception.ResourceNotFoundException;
import com.orderly.order.mapper.OrderMapper;
import com.orderly.order.messaging.OrderEventDTO;
import com.orderly.order.messaging.OrderProducer;
import com.orderly.order.model.Order;
import com.orderly.order.model.OrderStatus;
import com.orderly.order.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository repository;
    private final ProductClient productClient;   // Feign — synchronous
    private final OrderProducer orderProducer;   // RabbitMQ — asynchronous

    public OrderService(OrderRepository repository,
                        ProductClient productClient,
                        OrderProducer orderProducer) {
        this.repository = repository;
        this.productClient = productClient;
        this.orderProducer = orderProducer;
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

    /**
     * SYNCHRONOUS — OpenFeign
     * Order Service calls Product Service directly to get product details.
     * The order must contain at least one item with a productId.
     */
    public List<ProductDTO> getProductsForOrder(Long orderId) {
        Order order = repository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order " + orderId + " not found"));

        log.info("[FEIGN] Order {} has {} items — calling product-service", orderId, order.getItems().size());

        return order.getItems().stream()
                .map(item -> {
                    ProductDTO product = productClient.getProductById(item.getProductId());
                    log.info("[FEIGN] Retrieved product: {}", product);
                    return product;
                })
                .collect(Collectors.toList());
    }

    /**
     * CREATE — saves the order, then:
     * 1. Sends event to RabbitMQ asynchronously (complaint-service will receive it)
     */
    public OrderResponse create(OrderRequest request) {
        Order order = OrderMapper.toEntity(request);
        repository.save(order);
        log.info("Order {} saved to database", order.getId());

        // ASYNCHRONOUS — RabbitMQ: publish event after saving
        try {
            OrderEventDTO event = new OrderEventDTO(
                    order.getId(),
                    order.getClientId(),
                    order.getStoreId(),
                    order.getTotalAmount(),
                    order.getStatus().name()
            );
            orderProducer.sendOrderCreatedEvent(event);
        } catch (Exception e) {
            // Log but don't fail the order creation if RabbitMQ is unavailable
            log.warn("[RABBITMQ] Could not publish order event: {}", e.getMessage());
        }

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

