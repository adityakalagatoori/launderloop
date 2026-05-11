import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItineraryService {
  constructor(private prisma: PrismaService) {}

  async getOrCreate(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.userId !== userId) {
      const companion = await this.prisma.tripCompanion.findUnique({
        where: { tripId_userId: { tripId, userId } },
      });
      if (!companion) throw new ForbiddenException('Access denied');
    }

    let itinerary = await this.prisma.itinerary.findUnique({
      where: { tripId },
      include: {
        stops: {
          orderBy: { orderIndex: 'asc' },
          include: { activities: { orderBy: { orderIndex: 'asc' } }, city: true },
        },
      },
    });

    if (!itinerary) {
      itinerary = await this.prisma.itinerary.create({
        data: { tripId, lastEditedBy: userId },
        include: {
          stops: {
            orderBy: { orderIndex: 'asc' },
            include: { activities: { orderBy: { orderIndex: 'asc' } }, city: true },
          },
        },
      });
    }

    return itinerary;
  }

  async addStop(tripId: string, userId: string, dto: {
    cityName: string; cityId?: string; description?: string;
    latitude?: number; longitude?: number;
    arrivalDate: string; departureDate: string; dayNumber: number; orderIndex: number;
    transportMode?: string; transportCost?: number;
    accommodation?: string; accommodationCost?: number; notes?: string;
    isHiddenGem?: boolean;
  }) {
    const itinerary = await this.getOrCreate(tripId, userId);
    return this.prisma.itineraryStop.create({
      data: {
        itineraryId: itinerary.id,
        cityId: dto.cityId,
        name: dto.cityName,
        description: dto.description,
        latitude: dto.latitude,
        longitude: dto.longitude,
        arrivalDate: new Date(dto.arrivalDate),
        departureDate: new Date(dto.departureDate),
        dayNumber: dto.dayNumber,
        orderIndex: dto.orderIndex,
        transportMode: dto.transportMode as any,
        transportCost: dto.transportCost,
        accommodation: dto.accommodation,
        accommodationCost: dto.accommodationCost,
        notes: dto.notes,
        isHiddenGem: dto.isHiddenGem || false,
      },
      include: { activities: true, city: true },
    });
  }

  async updateStop(tripId: string, stopId: string, userId: string, dto: any) {
    const itinerary = await this.getOrCreate(tripId, userId);
    const stop = await this.prisma.itineraryStop.findFirst({
      where: { id: stopId, itineraryId: itinerary.id },
    });
    if (!stop) throw new NotFoundException('Stop not found');

    const data: any = { ...dto };
    if (dto.cityName) { data.name = dto.cityName; delete data.cityName; }
    if (dto.arrivalDate) data.arrivalDate = new Date(dto.arrivalDate);
    if (dto.departureDate) data.departureDate = new Date(dto.departureDate);

    return this.prisma.itineraryStop.update({
      where: { id: stopId },
      data,
      include: { activities: true },
    });
  }

  async deleteStop(tripId: string, stopId: string, userId: string) {
    const itinerary = await this.getOrCreate(tripId, userId);
    const stop = await this.prisma.itineraryStop.findFirst({
      where: { id: stopId, itineraryId: itinerary.id },
    });
    if (!stop) throw new NotFoundException('Stop not found');
    await this.prisma.itineraryStop.delete({ where: { id: stopId } });
    return { message: 'Stop deleted' };
  }

  async reorderStops(tripId: string, userId: string, orders: { id: string; orderIndex: number }[]) {
    const itinerary = await this.getOrCreate(tripId, userId);
    await Promise.all(
      orders.map(({ id, orderIndex }) =>
        this.prisma.itineraryStop.updateMany({
          where: { id, itineraryId: itinerary.id },
          data: { orderIndex },
        })
      )
    );
    return this.getOrCreate(tripId, userId);
  }

  async addActivity(tripId: string, stopId: string, userId: string, dto: {
    name: string; description?: string; activityId?: string;
    startTime: string; endTime: string; cost?: number; currency?: string;
    bookingRef?: string; notes?: string; orderIndex: number; isBooked?: boolean;
  }) {
    const itinerary = await this.getOrCreate(tripId, userId);
    const stop = await this.prisma.itineraryStop.findFirst({
      where: { id: stopId, itineraryId: itinerary.id },
    });
    if (!stop) throw new NotFoundException('Stop not found');

    return this.prisma.itineraryActivity.create({
      data: {
        stopId,
        activityId: dto.activityId,
        name: dto.name,
        description: dto.description,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        cost: dto.cost,
        currency: dto.currency || 'USD',
        bookingRef: dto.bookingRef,
        notes: dto.notes,
        orderIndex: dto.orderIndex,
        isBooked: dto.isBooked || false,
        isCompleted: false,
        weatherAlert: false,
      },
    });
  }

  async updateActivity(tripId: string, stopId: string, actId: string, userId: string, dto: any) {
    const itinerary = await this.getOrCreate(tripId, userId);
    const stop = await this.prisma.itineraryStop.findFirst({
      where: { id: stopId, itineraryId: itinerary.id },
    });
    if (!stop) throw new NotFoundException('Stop not found');

    const data: any = { ...dto };
    if (dto.startTime) data.startTime = new Date(dto.startTime);
    if (dto.endTime) data.endTime = new Date(dto.endTime);

    return this.prisma.itineraryActivity.update({ where: { id: actId }, data });
  }

  async deleteActivity(tripId: string, stopId: string, actId: string, userId: string) {
    const itinerary = await this.getOrCreate(tripId, userId);
    const stop = await this.prisma.itineraryStop.findFirst({
      where: { id: stopId, itineraryId: itinerary.id },
    });
    if (!stop) throw new NotFoundException('Stop not found');
    await this.prisma.itineraryActivity.delete({ where: { id: actId } });
    return { message: 'Activity deleted' };
  }
}