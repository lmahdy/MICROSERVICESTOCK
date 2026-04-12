package com.orderly.complaint.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.Jackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ configuration for the Consumer side (complaint-service).
 * Uses its own queue bound to the fanout exchange so every ORDER_CREATED event is received.
 */
@Configuration
public class RabbitMQConfig {

    public static final String ORDER_CREATED_EXCHANGE = "ORDER_CREATED_EXCHANGE";
    public static final String ORDER_CREATED_COMPLAINT_QUEUE = "ORDER_CREATED_COMPLAINT_QUEUE";

    @Bean
    public FanoutExchange orderCreatedExchange() {
        return new FanoutExchange(ORDER_CREATED_EXCHANGE, true, false);
    }

    @Bean
    public Queue orderCreatedComplaintQueue() {
        return new Queue(ORDER_CREATED_COMPLAINT_QUEUE, true);
    }

    @Bean
    public Binding orderCreatedBinding(Queue orderCreatedComplaintQueue, FanoutExchange orderCreatedExchange) {
        return BindingBuilder.bind(orderCreatedComplaintQueue).to(orderCreatedExchange);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        DefaultJackson2JavaTypeMapper typeMapper = new DefaultJackson2JavaTypeMapper();
        typeMapper.setTypePrecedence(Jackson2JavaTypeMapper.TypePrecedence.INFERRED);
        converter.setJavaTypeMapper(typeMapper);
        return converter;
    }

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
