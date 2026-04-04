package com.orderly.delivery.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

/**
 * RabbitMQ configuration and event publisher for delivery-service.
 * Uses a topic exchange so notification-service can subscribe to specific delivery events.
 * Publishes events for ALL delivery status transitions.
 */
@Configuration
public class DeliveryMessagingConfig {

    private static final Logger log = LoggerFactory.getLogger(DeliveryMessagingConfig.class);

    public static final String DELIVERY_EVENTS_EXCHANGE = "DELIVERY_EVENTS_EXCHANGE";
    // Legacy queue kept for backward compatibility
    public static final String DELIVERY_DELIVERED_QUEUE = "DELIVERY_DELIVERED_QUEUE";

    @Bean
    public TopicExchange deliveryEventsExchange() {
        return new TopicExchange(DELIVERY_EVENTS_EXCHANGE, true, false);
    }

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
     * Publishes a delivery status event to the topic exchange.
     * routing key format: delivery.{STATUS}
     * Also publishes to legacy DELIVERY_DELIVERED_QUEUE for backward compat when DELIVERED.
     */
    public static void publishDeliveryEvent(RabbitTemplate rabbitTemplate,
                                             String status,
                                             Long deliveryId,
                                             Long orderId,
                                             String courierId,
                                             String clientId) {
        try {
            Map<String, Object> event = Map.of(
                    "deliveryId", deliveryId,
                    "orderId", orderId,
                    "courierId", courierId,
                    "clientId", clientId != null ? clientId : "",
                    "status", status
            );

            // Publish to topic exchange with routing key
            String routingKey = "delivery." + status;
            rabbitTemplate.convertAndSend(DELIVERY_EVENTS_EXCHANGE, routingKey, event);
            log.info("[RABBITMQ] Delivery event sent: exchange={}, key={}, orderId={}", DELIVERY_EVENTS_EXCHANGE, routingKey, orderId);

            // Also publish to legacy queue for backward compat
            if ("DELIVERED".equals(status)) {
                rabbitTemplate.convertAndSend(DELIVERY_DELIVERED_QUEUE, event);
                log.info("[RABBITMQ] Legacy DELIVERY_DELIVERED event also sent to queue");
            }
        } catch (AmqpException e) {
            log.warn("[RABBITMQ] Could not send delivery event: {}", e.getMessage());
        }
    }
}
