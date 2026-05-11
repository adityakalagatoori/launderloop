import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create expense' })
  create(@Req() req: any, @Body() dto: any) {
    return this.expensesService.create(req.user.id, dto);
  }

  @Get('trip/:tripId')
  @ApiOperation({ summary: 'Get expenses for a trip' })
  findByTrip(@Req() req: any, @Param('tripId') tripId: string, @Query() query: any) {
    return this.expensesService.findByTrip(tripId, req.user.id, query);
  }

  @Get('trip/:tripId/summary')
  @ApiOperation({ summary: 'Get budget summary for a trip' })
  getBudgetSummary(@Req() req: any, @Param('tripId') tripId: string) {
    return this.expensesService.getTripBudgetSummary(tripId, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update expense' })
  update(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.expensesService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete expense' })
  delete(@Req() req: any, @Param('id') id: string) {
    return this.expensesService.delete(id, req.user.id);
  }
}