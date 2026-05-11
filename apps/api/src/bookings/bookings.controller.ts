import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a guide booking' })
  create(@Req() req: any, @Body() dto: any) {
    return this.bookingsService.createBooking(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my bookings' })
  getMyBookings(@Req() req: any) {
    return this.bookingsService.getMyBookings(req.user.id);
  }

  @Get('guide')
  @ApiOperation({ summary: 'Get bookings for my guide profile' })
  getGuideBookings(@Req() req: any) {
    return this.bookingsService.getGuideBookings(req.user.id);
  }
}