import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNotificationDto, UpdateNotificationDto } from './dto';
import { Notification, NotificationDocument } from './notification.schema';

@Injectable()
export class NotificationService {
  constructor(@InjectModel(Notification.name) private model: Model<NotificationDocument>) { }

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).lean();
  }

  findOne(id: string) {
    return this.model.findById(id).lean();
  }

  findByUserId(userId: string) {
    return this.model.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async countUnread(userId: string): Promise<number> {
    return this.model.countDocuments({ userId, read: false });
  }

  async create(dto: CreateNotificationDto) {
    return this.model.create(dto);
  }

  async markAsRead(id: string) {
    const updated = await this.model.findByIdAndUpdate(id, { read: true }, { new: true }).lean();
    if (!updated) throw new NotFoundException('Notification not found');
    return updated;
  }

  async markAllReadForUser(userId: string) {
    await this.model.updateMany({ userId, read: false }, { read: true });
    return { success: true };
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
