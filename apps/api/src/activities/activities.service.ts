import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number; limit?: number; cityId?: string;
    category?: string; search?: string; featured?: boolean;
  }) {
    const { page = 1, limit = 20, cityId, category, search, featured } = query;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (cityId) where.cityId = cityId;
    if (category) where.category = category;
    if (featured !== undefined) where.isFeatured = featured;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where, skip, take: limit,
        orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
        include: { city: { select: { id: true, name: true, country: true } } },
      }),
      this.prisma.activity.count({ where }),
    ]);

    return { activities, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        city: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { profile: { select: { displayName: true, avatarUrl: true } } } } },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }

  async saveActivity(userId: string, activityId: string) {
    return this.prisma.savedActivity.upsert({
      where: { userId_activityId: { userId, activityId } },
      update: {},
      create: { userId, activityId },
    });
  }

  async unsaveActivity(userId: string, activityId: string) {
    await this.prisma.savedActivity.deleteMany({ where: { userId, activityId } });
    return { message: 'Activity removed from saved list' };
  }

  async getSavedActivities(userId: string) {
    return this.prisma.savedActivity.findMany({
      where: { userId },
      include: { activity: { include: { city: { select: { name: true, country: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addReview(userId: string, activityId: string, dto: {
    rating: number; title?: string; content: string; photos?: string[];
  }) {
    const activity = await this.prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity) throw new NotFoundException('Activity not found');

    const review = await this.prisma.review.create({
      data: {
        userId,
        activityId,
        rating: dto.rating,
        title: dto.title,
        content: dto.content,
        photos: dto.photos || [],
        status: 'PENDING',
      },
    });

    // Update activity rating
    const stats = await this.prisma.review.aggregate({
      where: { activityId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: true,
    });

    await this.prisma.activity.update({
      where: { id: activityId },
      data: {
        rating: stats._avg.rating || 0,
        reviewCount: stats._count,
      },
    });

    return review;
  }
}