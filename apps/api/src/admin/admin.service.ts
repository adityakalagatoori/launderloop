import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  private async assertSuperAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('SUPER_ADMIN access required');
    }
    return user;
  }

  async getDashboardStats(adminId: string) {
    await this.assertSuperAdmin(adminId);

    const [
      totalUsers, activeUsers, suspendedUsers,
      totalTrips, activeTrips,
      totalGuides, pendingGuideApps,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      this.prisma.user.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.trip.count({ where: { deletedAt: null } }),
      this.prisma.trip.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'GUIDE', status: 'ACTIVE' } }),
      this.prisma.auditLog.count({ where: { action: 'GUIDE_APPLICATION_SUBMITTED' } }),
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true, action: true, resource: true,
          resourceId: true, createdAt: true, ipAddress: true,
          user: { select: { email: true, role: true } },
        },
      }),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers },
      trips: { total: totalTrips, active: activeTrips },
      guides: { total: totalGuides, pendingApplications: pendingGuideApps },
      recentActivity: recentAuditLogs,
    };
  }

  async getAllUsers(adminId: string, query: {
    page?: number; limit?: number; role?: string; status?: string; search?: string;
  }) {
    await this.assertSuperAdmin(adminId);
    const { page = 1, limit = 50, role, status, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
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
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, role: true, status: true,
          createdAt: true, lastLoginAt: true, deletedAt: true,
          profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
          _count: { select: { trips: true, sessions: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getAuditLogs(adminId: string, query: {
    page?: number; limit?: number; action?: string; userId?: string;
  }) {
    await this.assertSuperAdmin(adminId);
    const { page = 1, limit = 50, action, userId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, role: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateUserRole(adminId: string, targetId: string, role: string) {
    await this.assertSuperAdmin(adminId);

    const updated = await this.prisma.user.update({
      where: { id: targetId },
      data: { role: role as any },
      select: { id: true, email: true, role: true, status: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'ADMIN_ROLE_CHANGED',
        resource: 'users',
        resourceId: targetId,
        metadata: { newRole: role, changedBy: adminId },
      },
    });

    return updated;
  }

  async updateUserStatus(adminId: string, targetId: string, status: string, reason?: string) {
    await this.assertSuperAdmin(adminId);

    const updated = await this.prisma.user.update({
      where: { id: targetId },
      data: { status: status as any },
      select: { id: true, email: true, role: true, status: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'ADMIN_STATUS_CHANGED',
        resource: 'users',
        resourceId: targetId,
        metadata: { newStatus: status, reason, changedBy: adminId },
      },
    });

    return updated;
  }

  async deleteUser(adminId: string, targetId: string, reason: string) {
    await this.assertSuperAdmin(adminId);

    await this.prisma.user.update({
      where: { id: targetId },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
        email: `deleted_${targetId}@deleted.com`,
      },
    });

    await this.prisma.session.deleteMany({ where: { userId: targetId } });

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'ADMIN_USER_DELETED',
        resource: 'users',
        resourceId: targetId,
        metadata: { reason, deletedBy: adminId },
      },
    });

    return { message: 'User deleted successfully' };
  }

  async getSystemHealth(adminId: string) {
    await this.assertSuperAdmin(adminId);

    const dbCheck = await this.prisma.$queryRaw`SELECT 1 as ok`.then(() => true).catch(() => false);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbCheck ? 'connected' : 'error',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
    };
  }
}