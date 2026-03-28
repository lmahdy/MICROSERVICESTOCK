package com.orderly.delivery.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

/**
 * RabbitMQ configuration and event publisher for delivery-service.
 * Publishes DELIVERY_DELIVERED events to notify notification-service.
 */
@Configuration
public class DeliveryMessagingConfig {

    private static final Logger log = LoggerFactory.getLogger(DeliveryMessagingConfig.class);
    public static final String DELIVERY_DELIVERED_QUEUE = "DELIVERY_DELIVERED_QUEUE";

    @Bean
    public Queue deliveryDeliveredQueue() {
        return new Queue(DELIVERY_DELIVERED_QUEUE, true);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                          MessageConverter converter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(converter);
        return template;
    }

    /**
     * Publishes a delivery delivered event to RabbitMQ.
     * If RabbitMQ is unavailable, logs warning and continues.
     */
    public static void publishDeliveryEvent(RabbitTemplate rabbitTemplate, Long orderId, Long courierId) {
        try {
            Map<String, Object> event = Map.of(
                    "orderId", orderId,
                    "courierId", courierId,
                    "status", "DELIVERED"
            );
            rabbitTemplate.convertAndSend(DELIVERY_DELIVERED_QUEUE, event);
            log.info("[RABBITMQ] DELIVERY_DELIVERED event sent for orderId={}", orderId);
        } catch (AmqpException e) {
            log.warn("[RABBITMQ] Could not send DELIVERY_DELIVERED event: {}", e.getMessage());
        }
    }
}
