package com.orderly.order.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

/**
 * RabbitMQ Producer — publishes order creation events to the queue.
 * The complaint-service consumer will receive and process these events.
 */
@Service
public class OrderProducer {

    private static final Logger log = LoggerFactory.getLogger(OrderProducer.class);

    private final RabbitTemplate rabbitTemplate;

    public OrderProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    /**
     * Sends an order event to RabbitMQ.
     * convertAndSend does two things:
     *   1. Converts OrderEventDTO → JSON (via Jackson2JsonMessageConverter)
     *   2. Sends the message to ORDER_CREATED_QUEUE
     */
    public void sendOrderCreatedEvent(OrderEventDTO event) {
        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_CREATED_QUEUE, event);
            log.info("[RABBITMQ] Order event sent to queue '{}': {}", RabbitMQConfig.ORDER_CREATED_QUEUE, event);
        } catch (AmqpException e) {
            log.error("[RABBITMQ] Failed to send order event: {}", e.getMessage());
            throw e;
        }
    }
}
