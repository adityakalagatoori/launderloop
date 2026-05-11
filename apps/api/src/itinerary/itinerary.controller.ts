import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ItineraryService } from './itinerary.service';

@ApiTags('itinerary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trips/:tripId/itinerary')
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  @Get()
  getItinerary(@Param('tripId') tripId: string, @Request() req: any) {
    return this.itineraryService.getOrCreate(tripId, req.user.userId);
  }

  @Post('stops')
  addStop(@Param('tripId') tripId: string, @Body() dto: any, @Request() req: any) {
    return this.itineraryService.addStop(tripId, req.user.userId, dto);
  }

  @Patch('stops/:stopId')
  updateStop(@Param('tripId') tripId: string, @Param('stopId') stopId: string, @Body() dto: any, @Request() req: any) {
    return this.itineraryService.updateStop(tripId, stopId, req.user.userId, dto);
  }

  @Delete('stops/:stopId')
  deleteStop(@Param('tripId') tripId: string, @Param('stopId') stopId: string, @Request() req: any) {
    return this.itineraryService.deleteStop(tripId, stopId, req.user.userId);
  }

  @Put('stops/reorder')
  reorderStops(@Param('tripId') tripId: string, @Body() body: { orders: { id: string; orderIndex: number }[] }, @Request() req: any) {
    return this.itineraryService.reorderStops(tripId, req.user.userId, body.orders);
  }

  @Post('stops/:stopId/activities')
  addActivity(@Param('tripId') tripId: string, @Param('stopId') stopId: string, @Body() dto: any, @Request() req: any) {
    return this.itineraryService.addActivity(tripId, stopId, req.user.userId, dto);
  }

  @Patch('stops/:stopId/activities/:actId')
  updateActivity(@Param('tripId') tripId: string, @Param('stopId') stopId: string, @Param('actId') actId: string, @Body() dto: any, @Request() req: any) {
    return this.itineraryService.updateActivity(tripId, stopId, actId, req.user.userId, dto);
  }

  @Delete('stops/:stopId/activities/:actId')
  deleteActivity(@Param('tripId') tripId: string, @Param('stopId') stopId: string, @Param('actId') actId: string, @Request() req: any) {
    return this.itineraryService.deleteActivity(tripId, stopId, actId, req.user.userId);
  }
}