import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async send(senderId: string, dto: { receiverId: string; content: string }) {
    return this.prisma.message.create({
      data: { senderId, receiverId: dto.receiverId, content: dto.content },
      include: {
        sender: { select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } } },
      },
    });
  }

  async getConversation(userId: string, otherId: string, query: { page?: number; limit?: number }) {
    const { page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherId },
            { senderId: otherId, receiverId: userId },
          ],
        },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } } },
        },
      }),
      this.prisma.message.count({
        where: {
          OR: [
            { senderId: userId, receiverId: otherId },
            { senderId: otherId, receiverId: userId },
          ],
        },
      }),
    ]);

    // Mark received messages as read
    await this.prisma.message.updateMany({
      where: { senderId: otherId, receiverId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return { messages: messages.reverse(), total, page, limit };
  }

  async getInbox(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
      distinct: ['senderId'],
      include: {
        sender: { select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } } },
      },
      take: 50,
    });

    const unreadCount = await this.prisma.message.count({
      where: { receiverId: userId, isRead: false },
    });

    return { messages, unreadCount };
  }

  async delete(userId: string, messageId: string) {
    const msg = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!msg || msg.senderId !== userId) throw new ForbiddenException('Cannot delete this message');
    await this.prisma.message.delete({ where: { id: messageId } });
    return { message: 'Message deleted' };
  }
}