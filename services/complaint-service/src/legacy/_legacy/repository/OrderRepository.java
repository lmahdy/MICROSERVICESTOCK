package com.orderly.order.repository;

import com.orderly.order.model.Order;
import com.orderly.order.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByClientId(Long clientId);
    List<Order> findByStatus(OrderStatus status);
}
