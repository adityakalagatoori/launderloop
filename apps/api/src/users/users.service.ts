import {
  Injectable, NotFoundException, ForbiddenException, ConflictException, Logger
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number; limit?: number; role?: string; status?: string; search?: string;
  }) {
    const { page = 1, limit = 20, role, status, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, role: true, status: true,
          createdAt: true, lastLoginAt: true, lastActiveAt: true,
          profile: { select: { firstName: true, lastName: true, displayName: true, avatarUrl: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        settings: true,
        preferences: true,
        _count: { select: { trips: true, reviews: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...safe } = user as any;
    return safe;
  }

  async updateProfile(userId: string, dto: {
    firstName?: string; lastName?: string; displayName?: string;
    bio?: string; avatarUrl?: string; nationality?: string;
    homeCity?: string; homeCountry?: string; website?: string;
    instagram?: string; twitter?: string;
  }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const profile = await this.prisma.userProfile.upsert({
      where: { userId },
      update: dto,
      create: { userId, firstName: dto.firstName || '', lastName: dto.lastName || '', ...dto },
    });

    return profile;
  }

  async updateSettings(userId: string, dto: Record<string, any>) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }

  async updateRole(adminId: string, targetUserId: string, role: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    if (role === 'SUPER_ADMIN' && admin.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only SUPER_ADMIN can assign SUPER_ADMIN role');
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: role as any },
      select: { id: true, email: true, role: true, status: true },
    });
  }

  async suspendUser(adminId: string, targetUserId: string, reason: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'USER_SUSPENDED',
        resource: 'users',
        resourceId: targetUserId,
        metadata: { reason, suspendedBy: adminId },
      },
    });

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { status: 'SUSPENDED' },
      select: { id: true, email: true, status: true },
    });
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'DELETED', deletedAt: new Date(), email: `deleted_${userId}@deleted.com` },
    });
    await this.prisma.session.deleteMany({ where: { userId } });
    return { message: 'Account deleted successfully' };
  }

  async getStats(userId: string) {
    const [tripCount, expenseSum, reviewCount] = await Promise.all([
      this.prisma.trip.count({ where: { userId, deletedAt: null } }),
      this.prisma.expense.aggregate({ where: { userId }, _sum: { amountUsd: true } }),
      this.prisma.review.count({ where: { userId } }),
    ]);

    return {
      trips: tripCount,
      totalSpent: expenseSum._sum.amountUsd || 0,
      reviews: reviewCount,
    };
  }
}