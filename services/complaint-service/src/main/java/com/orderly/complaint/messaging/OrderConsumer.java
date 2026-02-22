package com.orderly.complaint.messaging;

import com.orderly.complaint.service.ComplaintService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

/**
 * RabbitMQ Consumer — listens to ORDER_CREATED_QUEUE and processes order events.
 * Spring automatically:
 *   1. Receives the raw JSON message from RabbitMQ
 *   2. Deserializes it to OrderEventDTO via Jackson2JsonMessageConverter
 *   3. Passes the typed object to receiveOrderEvent()
 */
@Service
public class OrderConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderConsumer.class);

    private final ComplaintService complaintService;

    public OrderConsumer(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @RabbitListener(queues = RabbitMQConfig.ORDER_CREATED_QUEUE,
                    containerFactory = "rabbitListenerContainerFactory")
    public void receiveOrderEvent(OrderEventDTO orderEvent) {
        log.info("[RABBITMQ] Order event received from queue '{}': {}", 
                 RabbitMQConfig.ORDER_CREATED_QUEUE, orderEvent);
        complaintService.receiveOrderEvent(orderEvent);
    }
}
