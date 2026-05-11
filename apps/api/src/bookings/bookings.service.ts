import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async createBooking(userId: string, dto: {
    guideId: string; tripId?: string; activityId?: string;
    startDate: Date; endDate: Date; notes?: string;
  }) {
    const guide = await this.prisma.user.findUnique({
      where: { id: dto.guideId },
      select: { id: true, role: true, status: true },
    });
    if (!guide || guide.role !== 'GUIDE') throw new NotFoundException('Guide not found');

    if (dto.tripId) {
      return this.prisma.tripCompanion.upsert({
        where: { tripId_userId: { tripId: dto.tripId, userId: dto.guideId } },
        update: { role: 'guide' },
        create: { tripId: dto.tripId, userId: dto.guideId, role: 'guide', acceptedAt: new Date() },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'GUIDE_BOOKING_REQUESTED',
        resource: 'bookings',
        resourceId: dto.guideId,
        metadata: { guideId: dto.guideId, activityId: dto.activityId, startDate: dto.startDate, endDate: dto.endDate, notes: dto.notes },
      },
    });

    return { message: 'Booking request sent', guideId: dto.guideId };
  }

  async getMyBookings(userId: string) {
    return this.prisma.auditLog.findMany({
      where: { userId, action: 'GUIDE_BOOKING_REQUESTED' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getGuideBookings(guideId: string) {
    return this.prisma.auditLog.findMany({
      where: { resourceId: guideId, action: 'GUIDE_BOOKING_REQUESTED' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}