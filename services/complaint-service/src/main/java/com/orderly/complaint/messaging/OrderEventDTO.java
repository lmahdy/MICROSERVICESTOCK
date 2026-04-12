package com.orderly.complaint.messaging;

import java.math.BigDecimal;

/**
 * DTO used to receive order data from order-service via RabbitMQ.
 * Must match the OrderEventDTO in order-service exactly (same field names).
 * NOT persisted — stored in-memory for demonstration.
 */
public class OrderEventDTO {

    private Long orderId;
    private String clientId;
    private Long storeId;
    private BigDecimal totalAmount;
    private String status;

    public OrderEventDTO() {}

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

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
