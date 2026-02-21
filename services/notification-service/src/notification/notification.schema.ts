import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  userId?: string;

  @Prop({ default: 'INFO' })
  type: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
