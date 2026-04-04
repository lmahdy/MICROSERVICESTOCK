package com.orderly.complaint.service;

import com.orderly.complaint.dto.ComplaintRequest;
import com.orderly.complaint.dto.ComplaintResponse;
import com.orderly.complaint.exception.ResourceNotFoundException;
import com.orderly.complaint.mapper.ComplaintMapper;
import com.orderly.complaint.messaging.OrderEventDTO;
import com.orderly.complaint.model.Complaint;
import com.orderly.complaint.model.ComplaintStatus;
import com.orderly.complaint.repository.ComplaintRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ComplaintService {

    private static final Logger log = LoggerFactory.getLogger(ComplaintService.class);

    private final ComplaintRepository repository;
    private final List<OrderEventDTO> receivedOrders = Collections.synchronizedList(new ArrayList<>());

    public ComplaintService(ComplaintRepository repository) { this.repository = repository; }

    public List<OrderEventDTO> getReceivedOrders() {
        return List.copyOf(receivedOrders);
    }

    public List<ComplaintResponse> findAll() {
        return repository.findAll().stream().map(ComplaintMapper::toResponse).collect(Collectors.toList());
    }

    public ComplaintResponse findById(Long id) {
        Complaint c = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Complaint " + id + " not found"));
        return ComplaintMapper.toResponse(c);
    }

    public List<ComplaintResponse> byClient(String clientId) {
        return repository.findByClientId(clientId).stream().map(ComplaintMapper::toResponse).toList();
    }

    public ComplaintResponse create(ComplaintRequest req) {
        Complaint c = ComplaintMapper.toEntity(req);
        repository.save(c);
        return ComplaintMapper.toResponse(c);
    }

    public ComplaintResponse update(Long id, ComplaintRequest req) {
        Complaint c = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Complaint " + id + " not found"));
        ComplaintMapper.update(c, req);
        repository.save(c);
        return ComplaintMapper.toResponse(c);
    }

    public ComplaintResponse updateStatus(Long id, ComplaintStatus status) {
        Complaint c = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Complaint " + id + " not found"));
        c.setStatus(status);
        repository.save(c);
        return ComplaintMapper.toResponse(c);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Complaint " + id + " not found");
        }
        repository.deleteById(id);
    }

    // ============================================================
    // ASYNCHRONOUS — RabbitMQ methods
    // ============================================================

    /**
     * Called by OrderConsumer when a new order event arrives from RabbitMQ.
     * AUTO-CREATES a complaint record in the database for tracking purposes.
     */
    public void receiveOrderEvent(OrderEventDTO event) {
        log.info("[RABBITMQ] Processing order event in ComplaintService: orderId={}", event.getOrderId());

        receivedOrders.add(event);

        // Auto-create a complaint record to track the new order
        Complaint complaint = new Complaint();
        complaint.setOrderId(event.getOrderId());
        complaint.setClientId(event.getClientId());
        complaint.setDescription("Order #" + event.getOrderId() + " placed — amount: " + event.getTotalAmount());
        complaint.setStatus(ComplaintStatus.OPEN);
        repository.save(complaint);

        log.info("[RABBITMQ] Auto-complaint created for order {} — complaint id saved", event.getOrderId());
    }
}
