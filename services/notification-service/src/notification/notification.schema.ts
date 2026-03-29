import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ index: true })
  userId?: string;

  @Prop()
  recipientRole?: string;

  @Prop({ default: 'INFO' })
  type: string;

  @Prop()
  relatedEntityType?: string;

  @Prop()
  relatedEntityId?: string;

  @Prop({ default: false })
  read: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
