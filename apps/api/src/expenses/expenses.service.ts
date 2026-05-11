import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: {
    tripId: string; category: string; amount: number; currency?: string;
    description: string; date: Date; location?: string; isShared?: boolean;
    splitWith?: string[]; notes?: string;
  }) {
    const trip = await this.prisma.trip.findUnique({ where: { id: dto.tripId } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.userId !== userId) {
      const companion = await this.prisma.tripCompanion.findUnique({
        where: { tripId_userId: { tripId: dto.tripId, userId } },
      });
      if (!companion) throw new ForbiddenException('Not a trip member');
    }

    return this.prisma.expense.create({
      data: {
        tripId: dto.tripId,
        userId,
        category: dto.category as any,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        description: dto.description,
        date: new Date(dto.date),
        location: dto.location,
        isShared: dto.isShared || false,
        splitWith: dto.splitWith || [],
        notes: dto.notes,
      },
    });
  }

  async findByTrip(tripId: string, userId: string, query: { page?: number; limit?: number; category?: string }) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.userId !== userId) {
      const companion = await this.prisma.tripCompanion.findUnique({
        where: { tripId_userId: { tripId, userId } },
      });
      if (!companion) throw new ForbiddenException('Not a trip member');
    }

    const { page = 1, limit = 50, category } = query;
    const skip = (page - 1) * limit;
    const where: any = { tripId };
    if (category) where.category = category;

    const [expenses, total, summary] = await Promise.all([
      this.prisma.expense.findMany({ where, skip, take: limit, orderBy: { date: 'desc' } }),
      this.prisma.expense.count({ where }),
      this.prisma.expense.groupBy({
        by: ['category'],
        where: { tripId },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return { expenses, total, page, limit, summary };
  }

  async update(id: string, userId: string, dto: Partial<{
    amount: number; description: string; category: string; notes: string;
  }>) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Expense not found');
    if (expense.userId !== userId) throw new ForbiddenException('Not your expense');
    return this.prisma.expense.update({ where: { id }, data: dto as any });
  }

  async delete(id: string, userId: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Expense not found');
    if (expense.userId !== userId) throw new ForbiddenException('Not your expense');
    await this.prisma.expense.delete({ where: { id } });
    return { message: 'Expense deleted' };
  }

  async getTripBudgetSummary(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { budgetCategories: true },
    });
    if (!trip) throw new NotFoundException('Trip not found');

    const totals = await this.prisma.expense.groupBy({
      by: ['category'],
      where: { tripId },
      _sum: { amount: true },
    });

    return {
      totalBudget: trip.totalBudget,
      currency: trip.currency,
      spentByCategory: totals,
      budgetLimits: trip.budgetCategories,
    };
  }
}