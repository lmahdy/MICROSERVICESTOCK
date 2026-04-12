package com.orderly.delivery.repository;

import com.orderly.delivery.model.Delivery;
import com.orderly.delivery.model.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    List<Delivery> findByCourierId(Long courierId);
    List<Delivery> findByOrderId(Long orderId);
    List<Delivery> findByStatus(DeliveryStatus status);
}
