import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { NotificationService } from "./notification/notification.service";
import * as amqp from "amqplib";

/**
 * RabbitMQ Consumer for the notification-service.
 * Listens to multiple queues for order and delivery events.
 * On each event: auto-creates a notification in MongoDB.
 */
@Injectable()
export class RabbitMQConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQConsumer.name);
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  private readonly RABBITMQ_URL =
    process.env.RABBITMQ_URL || "amqp://guest:guest@127.0.0.1:5672";

  // Order events
  private readonly ORDER_CREATED_EXCHANGE = "ORDER_CREATED_EXCHANGE";
  private readonly ORDER_CREATED_NOTIFICATION_QUEUE =
    "ORDER_CREATED_NOTIFICATION_QUEUE";

  // Delivery events — one exchange, multiple queues
  private readonly DELIVERY_EVENTS_EXCHANGE = "DELIVERY_EVENTS_EXCHANGE";
  private readonly DELIVERY_ASSIGNED_QUEUE =
    "DELIVERY_ASSIGNED_NOTIFICATION_QUEUE";
  private readonly DELIVERY_PICKED_UP_QUEUE =
    "DELIVERY_PICKED_UP_NOTIFICATION_QUEUE";
  private readonly DELIVERY_ON_THE_WAY_QUEUE =
    "DELIVERY_ON_THE_WAY_NOTIFICATION_QUEUE";
  private readonly DELIVERY_DELIVERED_QUEUE =
    "DELIVERY_DELIVERED_NOTIFICATION_QUEUE";

  constructor(private readonly notificationService: NotificationService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch (e) {
      this.logger.error("Error closing RabbitMQ connection", e);
    }
  }

  private async connect(retryCount = 0) {
    const MAX_RETRIES = 5;
    try {
      this.logger.log(`[RABBITMQ] Connecting to ${this.RABBITMQ_URL}...`);
      this.connection = await amqp.connect(this.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();

      // ── ORDER_CREATED (fanout exchange, shared with complaint-service) ──
      await this.channel.assertExchange(this.ORDER_CREATED_EXCHANGE, "fanout", {
        durable: true,
      });
      await this.channel.assertQueue(this.ORDER_CREATED_NOTIFICATION_QUEUE, {
        durable: true,
      });
      await this.channel.bindQueue(
        this.ORDER_CREATED_NOTIFICATION_QUEUE,
        this.ORDER_CREATED_EXCHANGE,
        "",
      );

      // ── DELIVERY EVENTS (topic exchange with routing keys) ──
      await this.channel.assertExchange(
        this.DELIVERY_EVENTS_EXCHANGE,
        "topic",
        { durable: true },
      );

      // Create and bind queues for each delivery status
      for (const { queue, routingKey } of [
        {
          queue: this.DELIVERY_ASSIGNED_QUEUE,
          routingKey: "delivery.ASSIGNED",
        },
        {
          queue: this.DELIVERY_PICKED_UP_QUEUE,
          routingKey: "delivery.PICKED_UP",
        },
        {
          queue: this.DELIVERY_ON_THE_WAY_QUEUE,
          routingKey: "delivery.ON_THE_WAY",
        },
        {
          queue: this.DELIVERY_DELIVERED_QUEUE,
          routingKey: "delivery.DELIVERED",
        },
      ]) {
        await this.channel.assertQueue(queue, { durable: true });
        await this.channel.bindQueue(
          queue,
          this.DELIVERY_EVENTS_EXCHANGE,
          routingKey,
        );
      }

      // Also keep legacy DELIVERY_DELIVERED_QUEUE for backward compat
      await this.channel.assertQueue("DELIVERY_DELIVERED_QUEUE", {
        durable: true,
      });

      this.logger.log("[RABBITMQ] Connected! Listening to all queues...");

      // ── Consume ORDER_CREATED ──
      this.channel.consume(
        this.ORDER_CREATED_NOTIFICATION_QUEUE,
        async (msg) => {
          if (!msg) return;
          try {
            const event = JSON.parse(msg.content.toString());
            this.logger.log(
              `[RABBITMQ] ORDER_CREATED received: orderId=${event.orderId}`,
            );
            if (event.clientId && event.clientId !== "0") {
              await this.notificationService.create({
                title: "🛒 New Order Placed",
                message: `Your order #${event.orderId} has been placed successfully! Total: ${event.totalAmount} TND`,
                type: "ORDER_CREATED",
                userId: String(event.clientId),
                recipientRole: "CLIENT",
                relatedEntityType: "ORDER",
                relatedEntityId: String(event.orderId),
              });
            }
            this.channel!.ack(msg);
          } catch (e) {
            this.logger.error("[RABBITMQ] Error processing ORDER_CREATED", e);
            this.channel!.nack(msg, false, false);
          }
        },
      );

      // ── Consume DELIVERY_ASSIGNED ──
      this.channel.consume(this.DELIVERY_ASSIGNED_QUEUE, async (msg) => {
        if (!msg) return;
        try {
          const event = JSON.parse(msg.content.toString());
          this.logger.log(
            `[RABBITMQ] DELIVERY_ASSIGNED received: orderId=${event.orderId}`,
          );

          // Notify the CLIENT
          if (event.clientId && event.clientId !== "0") {
            await this.notificationService.create({
              title: "🚚 Courier Assigned",
              message: `A courier has been assigned to your order #${event.orderId}. Your food is on its way soon!`,
              type: "DELIVERY_ASSIGNED",
              userId: String(event.clientId),
              recipientRole: "CLIENT",
              relatedEntityType: "DELIVERY",
              relatedEntityId: String(event.deliveryId || event.orderId),
            });
          }

          // Notify the COURIER
          if (event.courierId) {
            await this.notificationService.create({
              title: "📦 New Delivery Assignment",
              message: `You have been assigned to deliver order #${event.orderId}. Please pick it up!`,
              type: "DELIVERY_ASSIGNED",
              userId: String(event.courierId),
              recipientRole: "LIVREUR",
              relatedEntityType: "DELIVERY",
              relatedEntityId: String(event.deliveryId || event.orderId),
            });
          }

          this.channel!.ack(msg);
        } catch (e) {
          this.logger.error("[RABBITMQ] Error processing DELIVERY_ASSIGNED", e);
          this.channel!.nack(msg, false, false);
        }
      });

      // ── Consume DELIVERY_PICKED_UP ──
      this.channel.consume(this.DELIVERY_PICKED_UP_QUEUE, async (msg) => {
        if (!msg) return;
        try {
          const event = JSON.parse(msg.content.toString());
          this.logger.log(
            `[RABBITMQ] DELIVERY_PICKED_UP received: orderId=${event.orderId}`,
          );
          if (event.clientId && event.clientId !== "0") {
            await this.notificationService.create({
              title: "📦 Order Picked Up",
              message: `Your order #${event.orderId} has been picked up by the courier!`,
              type: "DELIVERY_PICKED_UP",
              userId: String(event.clientId),
              recipientRole: "CLIENT",
              relatedEntityType: "DELIVERY",
              relatedEntityId: String(event.deliveryId || event.orderId),
            });
          }
          this.channel!.ack(msg);
        } catch (e) {
          this.logger.error(
            "[RABBITMQ] Error processing DELIVERY_PICKED_UP",
            e,
          );
          this.channel!.nack(msg, false, false);
        }
      });

      // ── Consume DELIVERY_ON_THE_WAY ──
      this.channel.consume(this.DELIVERY_ON_THE_WAY_QUEUE, async (msg) => {
        if (!msg) return;
        try {
          const event = JSON.parse(msg.content.toString());
          this.logger.log(
            `[RABBITMQ] DELIVERY_ON_THE_WAY received: orderId=${event.orderId}`,
          );
          if (event.clientId && event.clientId !== "0") {
            await this.notificationService.create({
              title: "🏍️ On The Way!",
              message: `Your order #${event.orderId} is on its way to you!`,
              type: "DELIVERY_ON_THE_WAY",
              userId: String(event.clientId),
              recipientRole: "CLIENT",
              relatedEntityType: "DELIVERY",
              relatedEntityId: String(event.deliveryId || event.orderId),
            });
          }
          this.channel!.ack(msg);
        } catch (e) {
          this.logger.error(
            "[RABBITMQ] Error processing DELIVERY_ON_THE_WAY",
            e,
          );
          this.channel!.nack(msg, false, false);
        }
      });

      // ── Consume DELIVERY_DELIVERED (new exchange-based) ──
      this.channel.consume(this.DELIVERY_DELIVERED_QUEUE, async (msg) => {
        if (!msg) return;
        try {
          const event = JSON.parse(msg.content.toString());
          this.logger.log(
            `[RABBITMQ] DELIVERY_DELIVERED received: orderId=${event.orderId}`,
          );
          if (event.clientId && event.clientId !== "0") {
            await this.notificationService.create({
              title: "✅ Order Delivered!",
              message: `Your order #${event.orderId} has been delivered successfully! Enjoy your meal!`,
              type: "DELIVERY_DELIVERED",
              userId: String(event.clientId),
              recipientRole: "CLIENT",
              relatedEntityType: "ORDER",
              relatedEntityId: String(event.orderId),
            });
          }
          this.channel!.ack(msg);
        } catch (e) {
          this.logger.error(
            "[RABBITMQ] Error processing DELIVERY_DELIVERED",
            e,
          );
          this.channel!.nack(msg, false, false);
        }
      });

      // ── Legacy DELIVERY_DELIVERED_QUEUE (backward compat) ──
      this.channel.consume("DELIVERY_DELIVERED_QUEUE", async (msg) => {
        if (!msg) return;
        try {
          const event = JSON.parse(msg.content.toString());
          this.logger.log(
            `[RABBITMQ] LEGACY DELIVERY_DELIVERED received: orderId=${event.orderId}`,
          );
          if (event.clientId && event.clientId !== "0") {
            await this.notificationService.create({
              title: "✅ Order Delivered!",
              message: `Your order #${event.orderId} has been delivered successfully!`,
              type: "DELIVERY_DELIVERED",
              userId: String(event.clientId),
              recipientRole: "CLIENT",
              relatedEntityType: "ORDER",
              relatedEntityId: String(event.orderId),
            });
          }
          this.channel!.ack(msg);
        } catch (e) {
          this.logger.error(
            "[RABBITMQ] Error processing legacy DELIVERY_DELIVERED",
            e,
          );
          this.channel!.nack(msg, false, false);
        }
      });

      // Handle connection errors — reconnect after delay
      this.connection.on("error", (err) => {
        this.logger.warn("[RABBITMQ] Connection error: " + err.message);
        this.reconnect();
      });
      this.connection.on("close", () => {
        this.logger.warn("[RABBITMQ] Connection closed — reconnecting...");
        this.reconnect();
      });
    } catch (err) {
      if (retryCount < MAX_RETRIES) {
        const delay = (retryCount + 1) * 3000;
        this.logger.warn(
          `[RABBITMQ] Connection failed (attempt ${retryCount + 1}/${MAX_RETRIES}). Retrying in ${delay}ms...`,
        );
        setTimeout(() => this.connect(retryCount + 1), delay);
      } else {
        this.logger.warn(
          "[RABBITMQ] Could not connect after max retries. Notification service will run without RabbitMQ.",
        );
      }
    }
  }

  private reconnect() {
    setTimeout(() => this.connect(), 5000);
  }
}
