import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { NotificationService } from './notification/notification.service';
import * as amqp from 'amqplib';

/**
 * RabbitMQ Consumer for the notification-service.
 * Listens to ORDER_CREATED_QUEUE and DELIVERY_DELIVERED_QUEUE.
 * On each event: auto-creates a notification in MongoDB.
 */
@Injectable()
export class RabbitMQConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQConsumer.name);
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  private readonly RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  private readonly ORDER_CREATED_EXCHANGE = 'ORDER_CREATED_EXCHANGE';
  private readonly ORDER_CREATED_NOTIFICATION_QUEUE = 'ORDER_CREATED_NOTIFICATION_QUEUE';
  private readonly DELIVERY_DELIVERED_QUEUE = 'DELIVERY_DELIVERED_QUEUE';

  constructor(private readonly notificationService: NotificationService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch (e) {
      this.logger.error('Error closing RabbitMQ connection', e);
    }
  }

  private async connect(retryCount = 0) {
    const MAX_RETRIES = 5;
    try {
      this.logger.log(`[RABBITMQ] Connecting to ${this.RABBITMQ_URL}...`);
      this.connection = await amqp.connect(this.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();

      // Ensure queues and exchange exist (durable to survive restarts)
      await this.channel.assertExchange(this.ORDER_CREATED_EXCHANGE, 'fanout', { durable: true });
      await this.channel.assertQueue(this.ORDER_CREATED_NOTIFICATION_QUEUE, { durable: true });
      await this.channel.bindQueue(this.ORDER_CREATED_NOTIFICATION_QUEUE, this.ORDER_CREATED_EXCHANGE, '');
      await this.channel.assertQueue(this.DELIVERY_DELIVERED_QUEUE, { durable: true });

      this.logger.log('[RABBITMQ] Connected! Listening to queues...');

      // Listen to ORDER_CREATED via fanout exchange
      this.channel.consume(this.ORDER_CREATED_NOTIFICATION_QUEUE, async (msg) => {
        if (!msg) return;
        try {
          const event = JSON.parse(msg.content.toString());
          this.logger.log(`[RABBITMQ] ORDER_CREATED received: orderId=${event.orderId}`);
          await this.notificationService.create({
            title: 'New Order Placed',
            message: `Order #${event.orderId} has been created for client ${event.clientId}. Total: ${event.totalAmount}`,
            type: 'ORDER_CREATED',
            userId: String(event.clientId),
          });
          this.channel!.ack(msg);
        } catch (e) {
          this.logger.error('[RABBITMQ] Error processing ORDER_CREATED', e);
          this.channel!.nack(msg, false, false);
        }
      });

      // Listen to DELIVERY_DELIVERED_QUEUE
      this.channel.consume(this.DELIVERY_DELIVERED_QUEUE, async (msg) => {
        if (!msg) return;
        try {
          const event = JSON.parse(msg.content.toString());
          this.logger.log(`[RABBITMQ] DELIVERY_DELIVERED received: orderId=${event.orderId}`);
          await this.notificationService.create({
            title: 'Order Delivered!',
            message: `Your order #${event.orderId} has been delivered successfully!`,
            type: 'DELIVERY_DELIVERED',
            userId: String(event.clientId || ''),
          });
          this.channel!.ack(msg);
        } catch (e) {
          this.logger.error('[RABBITMQ] Error processing DELIVERY_DELIVERED', e);
          this.channel!.nack(msg, false, false);
        }
      });

      // Handle connection errors — reconnect after delay
      this.connection.on('error', (err) => {
        this.logger.warn('[RABBITMQ] Connection error: ' + err.message);
        this.reconnect();
      });
      this.connection.on('close', () => {
        this.logger.warn('[RABBITMQ] Connection closed — reconnecting...');
        this.reconnect();
      });

    } catch (err) {
      if (retryCount < MAX_RETRIES) {
        const delay = (retryCount + 1) * 3000;
        this.logger.warn(`[RABBITMQ] Connection failed (attempt ${retryCount + 1}/${MAX_RETRIES}). Retrying in ${delay}ms...`);
        setTimeout(() => this.connect(retryCount + 1), delay);
      } else {
        this.logger.warn('[RABBITMQ] Could not connect after max retries. Notification service will run without RabbitMQ.');
      }
    }
  }

  private reconnect() {
    setTimeout(() => this.connect(), 5000);
  }
}
