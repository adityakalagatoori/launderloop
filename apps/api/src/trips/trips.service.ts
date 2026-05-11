import {
  Injectable, NotFoundException, ForbiddenException, Logger
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: {
    name: string; description?: string; type?: string;
    startDate: Date; endDate: Date; totalBudget?: number;
    currency?: string; visibility?: string; tags?: string[];
  }) {
    const slug = `${dto.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    return this.prisma.trip.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        type: (dto.type as any) || 'SOLO',
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        totalBudget: dto.totalBudget,
        currency: dto.currency || 'USD',
        visibility: (dto.visibility as any) || 'PRIVATE',
        tags: dto.tags || [],
        slug,
        status: 'DRAFT',
      },
      include: { user: { select: { id: true, email: true, profile: true } } },
    });
  }

  async findAll(userId: string, query: {
    page?: number; limit?: number; status?: string; visibility?: string;
  }) {
    const { page = 1, limit = 20, status, visibility } = query;
    const skip = (page - 1) * limit;
    const where: any = { userId, deletedAt: null };
    if (status) where.status = status;
    if (visibility) where.visibility = visibility;

    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { companions: true, expenses: true } },
        },
      }),
      this.prisma.trip.count({ where }),
    ]);

    return { trips, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, profile: true } },
        companions: { include: { user: { select: { id: true, email: true, profile: true } } } },
        itinerary: { include: { stops: { include: { activities: true } } } },
        expenses: { orderBy: { date: 'desc' }, take: 10 },
        _count: { select: { expenses: true, notes: true } },
      },
    });

    if (!trip) throw new NotFoundException('Trip not found');

    const isOwner = trip.userId === userId;
    const isCompanion = trip.companions.some(c => c.userId === userId);
    const isPublic = trip.visibility === 'PUBLIC';

    if (!isOwner && !isCompanion && !isPublic) {
      throw new ForbiddenException('Access denied');
    }

    return trip;
  }

  async update(id: string, userId: string, dto: Partial<{
    name: string; description: string; status: string;
    visibility: string; totalBudget: number; tags: string[];
    coverPhotoUrl: string;
  }>) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.userId !== userId) throw new ForbiddenException('Not your trip');

    return this.prisma.trip.update({
      where: { id },
      data: dto as any,
    });
  }

  async delete(id: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.userId !== userId) throw new ForbiddenException('Not your trip');

    await this.prisma.trip.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });

    return { message: 'Trip deleted successfully' };
  }

  async addCompanion(tripId: string, ownerId: string, companionEmail: string, role = 'viewer') {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.userId !== ownerId) throw new ForbiddenException('Not your trip');

    const companion = await this.prisma.user.findUnique({ where: { email: companionEmail } });
    if (!companion) throw new NotFoundException('User not found');

    return this.prisma.tripCompanion.upsert({
      where: { tripId_userId: { tripId, userId: companion.id } },
      update: { role },
      create: { tripId, userId: companion.id, role, acceptedAt: new Date() },
    });
  }

  async getPublicTrips(query: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;
    const where: any = { visibility: 'PUBLIC', deletedAt: null, status: 'COMPLETED' };
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        where, skip, take: limit,
        orderBy: { viewCount: 'desc' },
        include: {
          user: { select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } } },
          _count: { select: { companions: true } },
        },
      }),
      this.prisma.trip.count({ where }),
    ]);

    return { trips, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}