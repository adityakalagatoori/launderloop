import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Req
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GuidesService } from './guides.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminOnly } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('guides')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('guides')
export class GuidesController {
  constructor(private guidesService: GuidesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all approved guides (public)' })
  findAll(@Query() query: any) {
    return this.guidesService.findAll(query);
  }

  @Get('pending')
  @AdminOnly()
  @ApiOperation({ summary: 'Get pending guide applications (Admin only)' })
  getPending(@Req() req: any) {
    return this.guidesService.getPendingApplications(req.user.id);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get guide profile (public)' })
  findOne(@Param('id') id: string) {
    return this.guidesService.findOne(id);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply to become a guide' })
  apply(@Req() req: any, @Body() dto: any) {
    return this.guidesService.applyAsGuide(req.user.id, dto);
  }

  @Patch(':id/approve')
  @AdminOnly()
  @ApiOperation({ summary: 'Approve guide application (Admin only)' })
  approve(@Req() req: any, @Param('id') id: string) {
    return this.guidesService.approveGuide(req.user.id, id);
  }

  @Patch(':id/reject')
  @AdminOnly()
  @ApiOperation({ summary: 'Reject guide application (Admin only)' })
  reject(@Req() req: any, @Param('id') id: string, @Body() body: { reason: string }) {
    return this.guidesService.rejectGuide(req.user.id, id, body.reason);
  }

  @Patch(':id/revoke')
  @AdminOnly()
  @ApiOperation({ summary: 'Revoke guide status (Admin only)' })
  revoke(@Req() req: any, @Param('id') id: string, @Body() body: { reason: string }) {
    return this.guidesService.revokeGuide(req.user.id, id, body.reason);
  }
}