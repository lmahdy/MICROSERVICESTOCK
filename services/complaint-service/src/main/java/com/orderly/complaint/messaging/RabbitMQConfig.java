package com.orderly.complaint.messaging;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ configuration for the Consumer side (complaint-service).
 * The CONSUMER declares the queue — this is best practice.
 * If the queue doesn't exist when order-service tries to publish, messages will be lost.
 * Starting complaint-service FIRST ensures the queue exists before order-service publishes.
 */
@Configuration
public class RabbitMQConfig {

    // Queue name — must match the constant in order-service's RabbitMQConfig
    public static final String ORDER_CREATED_QUEUE = "ORDER_CREATED_QUEUE";

    /**
     * Declares the queue as durable=true so it survives a RabbitMQ restart.
     */
    @Bean
    public Queue orderCreatedQueue() {
        return new Queue(ORDER_CREATED_QUEUE, true);
    }

    /**
     * JSON converter to deserialize JSON messages back to Java objects (OrderEventDTO).
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /**
     * Factory for @RabbitListener — tells Spring to use the JSON converter.
     */
    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter converter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(converter);
        factory.setConcurrentConsumers(1);
        factory.setMaxConcurrentConsumers(3);
        return factory;
    }
}
