import {
  Controller, Get, Patch, Delete, Body, Param, Query,
  UseGuards, Req
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SuperAdminOnly } from '../auth/decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@SuperAdminOnly()
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard stats (SUPER_ADMIN only)' })
  getDashboard(@Req() req: any) {
    return this.adminService.getDashboardStats(req.user.id);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (SUPER_ADMIN only)' })
  getUsers(@Req() req: any, @Query() query: any) {
    return this.adminService.getAllUsers(req.user.id, query);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs (SUPER_ADMIN only)' })
  getAuditLogs(@Req() req: any, @Query() query: any) {
    return this.adminService.getAuditLogs(req.user.id, query);
  }

  @Get('health')
  @ApiOperation({ summary: 'Get system health (SUPER_ADMIN only)' })
  getHealth(@Req() req: any) {
    return this.adminService.getSystemHealth(req.user.id);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role (SUPER_ADMIN only)' })
  updateRole(@Req() req: any, @Param('id') id: string, @Body() body: { role: string }) {
    return this.adminService.updateUserRole(req.user.id, id, body.role);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status (SUPER_ADMIN only)' })
  updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
  ) {
    return this.adminService.updateUserStatus(req.user.id, id, body.status, body.reason);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (SUPER_ADMIN only)' })
  deleteUser(@Req() req: any, @Param('id') id: string, @Body() body: { reason: string }) {
    return this.adminService.deleteUser(req.user.id, id, body.reason);
  }
}