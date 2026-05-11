import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req, HttpCode, HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('trips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trips')
export class TripsController {
  constructor(private tripsService: TripsService) {}

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Get public trips (no auth required)' })
  getPublic(@Query() query: any) {
    return this.tripsService.getPublicTrips(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new trip' })
  create(@Req() req: any, @Body() dto: any) {
    return this.tripsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my trips' })
  findAll(@Req() req: any, @Query() query: any) {
    return this.tripsService.findAll(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trip by ID' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.tripsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update trip' })
  update(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.tripsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete trip' })
  delete(@Req() req: any, @Param('id') id: string) {
    return this.tripsService.delete(id, req.user.id);
  }

  @Post(':id/companions')
  @ApiOperation({ summary: 'Add companion to trip' })
  addCompanion(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { email: string; role?: string },
  ) {
    return this.tripsService.addCompanion(id, req.user.id, body.email, body.role);
  }
}