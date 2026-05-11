import {
  Injectable, NotFoundException, ForbiddenException,
  ConflictException, Logger
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GuidesService {
  private readonly logger = new Logger(GuidesService.name);

  constructor(private prisma: PrismaService) {}

  /** List all approved guides (public) */
  async findAll(query: {
    page?: number; limit?: number; search?: string; city?: string;
  }) {
    const { page = 1, limit = 20, search, city } = query;
    const skip = (page - 1) * limit;

    const where: any = { role: 'GUIDE', status: 'ACTIVE' };
    if (search) {
      where.OR = [
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } },
        { profile: { bio: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (city) {
      where.profile = { ...where.profile, homeCity: { contains: city, mode: 'insensitive' } };
    }

    const [guides, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          profile: {
            select: {
              firstName: true, lastName: true, displayName: true,
              avatarUrl: true, bio: true, homeCity: true, homeCountry: true,
              nationality: true, totalTrips: true,
            },
          },
          _count: { select: { reviews: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { guides, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Get guide profile by ID */
  async findOne(id: string) {
    const guide = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, role: true, createdAt: true,
        profile: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { profile: { select: { displayName: true, avatarUrl: true } } } } },
        },
        _count: { select: { reviews: true, trips: true } },
      },
    });

    if (!guide || guide.role !== 'GUIDE') {
      throw new NotFoundException('Guide not found');
    }

    return guide;
  }

  /** Apply to become a guide */
  async applyAsGuide(userId: string, dto: {
    bio: string; homeCity: string; homeCountry: string;
    languages?: string[]; specialties?: string[];
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'GUIDE') throw new ConflictException('Already a guide');
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
      throw new ForbiddenException('Admin users cannot apply as guides');
    }

    // Update profile with guide info
    await this.prisma.userProfile.upsert({
      where: { userId },
      update: {
        bio: dto.bio,
        homeCity: dto.homeCity,
        homeCountry: dto.homeCountry,
      },
      create: {
        userId,
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        bio: dto.bio,
        homeCity: dto.homeCity,
        homeCountry: dto.homeCountry,
      },
    });

    // Log the application
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'GUIDE_APPLICATION_SUBMITTED',
        resource: 'guides',
        resourceId: userId,
        metadata: { bio: dto.bio, homeCity: dto.homeCity, specialties: dto.specialties },
      },
    });

    return { message: 'Guide application submitted. Pending admin approval.' };
  }

  /** Admin: approve guide application */
  async approveGuide(adminId: string, targetUserId: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: 'GUIDE' },
      select: { id: true, email: true, role: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'GUIDE_APPLICATION_APPROVED',
        resource: 'guides',
        resourceId: targetUserId,
        metadata: { approvedBy: adminId },
      },
    });

    return updated;
  }

  /** Admin: reject guide application */
  async rejectGuide(adminId: string, targetUserId: string, reason: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'GUIDE_APPLICATION_REJECTED',
        resource: 'guides',
        resourceId: targetUserId,
        metadata: { rejectedBy: adminId, reason },
      },
    });

    return { message: 'Guide application rejected', reason };
  }

  /** Admin: revoke guide status */
  async revokeGuide(adminId: string, targetUserId: string, reason: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: 'USER' },
      select: { id: true, email: true, role: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'GUIDE_STATUS_REVOKED',
        resource: 'guides',
        resourceId: targetUserId,
        metadata: { revokedBy: adminId, reason },
      },
    });

    return updated;
  }

  /** Get pending guide applications */
  async getPendingApplications(adminId: string) {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.prisma.auditLog.findMany({
      where: { action: 'GUIDE_APPLICATION_SUBMITTED' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}