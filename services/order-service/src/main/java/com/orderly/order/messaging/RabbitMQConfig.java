package com.orderly.order.messaging;

import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ configuration for the Producer side (order-service).
 * Uses a fanout exchange so multiple consumers (complaint-service, notification-service)
 * each receive every ORDER_CREATED event.
 */
@Configuration
public class RabbitMQConfig {

    public static final String ORDER_CREATED_EXCHANGE = "ORDER_CREATED_EXCHANGE";

    @Bean
    public FanoutExchange orderCreatedExchange() {
        return new FanoutExchange(ORDER_CREATED_EXCHANGE, true, false);
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
}
