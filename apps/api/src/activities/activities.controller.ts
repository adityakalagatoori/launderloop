import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List activities (public)' })
  findAll(@Query() query: any) {
    return this.activitiesService.findAll(query);
  }

  @Get('saved')
  @ApiOperation({ summary: 'Get my saved activities' })
  getSaved(@Req() req: any) {
    return this.activitiesService.getSavedActivities(req.user.id);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get activity details (public)' })
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @Post(':id/save')
  @ApiOperation({ summary: 'Save an activity' })
  save(@Req() req: any, @Param('id') id: string) {
    return this.activitiesService.saveActivity(req.user.id, id);
  }

  @Delete(':id/save')
  @ApiOperation({ summary: 'Unsave an activity' })
  unsave(@Req() req: any, @Param('id') id: string) {
    return this.activitiesService.unsaveActivity(req.user.id, id);
  }

  @Post(':id/reviews')
  @ApiOperation({ summary: 'Add a review for an activity' })
  addReview(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.activitiesService.addReview(req.user.id, id, dto);
  }
}