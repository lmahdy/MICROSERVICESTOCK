import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from './notification/notification.module';
import { RabbitMQConsumer } from './rabbitmq.consumer';
import { NotificationService } from './notification/notification.service';
import { Notification, NotificationSchema } from './notification/notification.schema';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/orderly_notifications'),
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    NotificationModule,
  ],
  providers: [RabbitMQConsumer, NotificationService],
})
export class AppModule { }
