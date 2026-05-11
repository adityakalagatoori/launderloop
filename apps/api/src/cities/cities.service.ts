import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number; limit?: number; search?: string;
    country?: string; featured?: boolean;
  }) {
    const { page = 1, limit = 20, search, country, featured } = query;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (country) where.countryCode = country.toUpperCase();
    if (featured !== undefined) where.isFeatured = featured;

    const [cities, total] = await Promise.all([
      this.prisma.city.findMany({
        where, skip, take: limit,
        orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
        include: {
          costs: { take: 1 },
          _count: { select: { activities: true, reviews: true } },
        },
      }),
      this.prisma.city.count({ where }),
    ]);

    return { cities, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const city = await this.prisma.city.findUnique({
      where: { id },
      include: {
        costs: true,
        weather: { orderBy: { month: 'asc' } },
        safetyInfo: true,
        activities: {
          where: { isFeatured: true },
          take: 10,
          orderBy: { rating: 'desc' },
        },
        _count: { select: { activities: true, reviews: true } },
      },
    });

    if (!city) throw new NotFoundException('City not found');
    return city;
  }

  async getActivities(cityId: string, query: {
    page?: number; limit?: number; category?: string;
  }) {
    const { page = 1, limit = 20, category } = query;
    const skip = (page - 1) * limit;
    const where: any = { cityId };
    if (category) where.category = category;

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where, skip, take: limit,
        orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
      }),
      this.prisma.activity.count({ where }),
    ]);

    return { activities, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async saveCity(userId: string, cityId: string, notes?: string) {
    return this.prisma.savedCity.upsert({
      where: { userId_cityId: { userId, cityId } },
      update: { notes },
      create: { userId, cityId, notes },
    });
  }

  async unsaveCity(userId: string, cityId: string) {
    await this.prisma.savedCity.deleteMany({ where: { userId, cityId } });
    return { message: 'City removed from saved list' };
  }

  async getSavedCities(userId: string) {
    return this.prisma.savedCity.findMany({
      where: { userId },
      include: { city: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}