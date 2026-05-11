import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CitiesService } from './cities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('cities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cities')
export class CitiesController {
  constructor(private citiesService: CitiesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all cities (public)' })
  findAll(@Query() query: any) {
    return this.citiesService.findAll(query);
  }

  @Get('saved')
  @ApiOperation({ summary: 'Get my saved cities' })
  getSaved(@Req() req: any) {
    return this.citiesService.getSavedCities(req.user.id);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get city details (public)' })
  findOne(@Param('id') id: string) {
    return this.citiesService.findOne(id);
  }

  @Get(':id/activities')
  @Public()
  @ApiOperation({ summary: 'Get city activities (public)' })
  getActivities(@Param('id') id: string, @Query() query: any) {
    return this.citiesService.getActivities(id, query);
  }

  @Post(':id/save')
  @ApiOperation({ summary: 'Save a city' })
  saveCity(@Req() req: any, @Param('id') id: string, @Body() body: { notes?: string }) {
    return this.citiesService.saveCity(req.user.id, id, body.notes);
  }

  @Delete(':id/save')
  @ApiOperation({ summary: 'Remove city from saved' })
  unsaveCity(@Req() req: any, @Param('id') id: string) {
    return this.citiesService.unsaveCity(req.user.id, id);
  }
}