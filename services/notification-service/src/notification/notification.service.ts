import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNotificationDto, UpdateNotificationDto } from './dto';
import { Notification, NotificationDocument } from './notification.schema';

@Injectable()
export class NotificationService {
  constructor(@InjectModel(Notification.name) private model: Model<NotificationDocument>) {}

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).lean();
  }

  findOne(id: string) {
    return this.model.findById(id).lean();
  }

  async create(dto: CreateNotificationDto) {
    return this.model.create(dto);
  }

  async update(id: string, dto: UpdateNotificationDto) {
    const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).lean();
    if (!updated) throw new NotFoundException('Notification not found');
    return updated;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).lean();
    if (!res) throw new NotFoundException('Notification not found');
  }
}
