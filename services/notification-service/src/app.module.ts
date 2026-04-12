import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { NotificationModule } from "./notification/notification.module";
import { AuthModule } from "./auth/auth.module";
import { RabbitMQConsumer } from "./rabbitmq.consumer";

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI ||
        "mongodb://127.0.0.1:27017/orderly_notifications",
    ),
    AuthModule,
    NotificationModule,
  ],
  providers: [RabbitMQConsumer],
})
export class AppModule {}
