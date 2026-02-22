package com.orderly.order.messaging;

import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ configuration for the Producer side (order-service).
 * Does NOT declare the queue — that is the consumer's responsibility.
 * Only configures RabbitTemplate with JSON converter.
 */
@Configuration
public class RabbitMQConfig {

    // Queue name — must match the name declared by the consumer (complaint-service)
    public static final String ORDER_CREATED_QUEUE = "ORDER_CREATED_QUEUE";

    /**
     * JSON converter: serializes Java objects to JSON before sending to RabbitMQ.
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /**
     * RabbitTemplate configured with JSON converter.
     * Used by OrderProducer to send messages.
     */
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                          MessageConverter converter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(converter);
        return template;
    }
}
