package com.orderly.order.messaging;

import java.math.BigDecimal;

/**
 * DTO used to transfer order data via RabbitMQ to other services.
 * Must exist in BOTH producer (order-service) and consumer (complaint-service).
 */
public class OrderEventDTO {

    private Long orderId;
    private Long clientId;
    private Long storeId;
    private BigDecimal totalAmount;
    private String status;

    public OrderEventDTO() {}

    public OrderEventDTO(Long orderId, Long clientId, Long storeId, BigDecimal totalAmount, String status) {
        this.orderId = orderId;
        this.clientId = clientId;
        this.storeId = storeId;
        this.totalAmount = totalAmount;
        this.status = status;
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }

    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public String toString() {
        return "OrderEventDTO{orderId=" + orderId + ", clientId=" + clientId +
               ", storeId=" + storeId + ", totalAmount=" + totalAmount + ", status='" + status + "'}";
    }
}
