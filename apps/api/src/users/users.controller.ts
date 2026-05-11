import {
  Controller, Get, Patch, Delete, Body, Param, Query,
  UseGuards, Req, HttpCode, HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, AdminOnly } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @AdminOnly()
  @ApiOperation({ summary: 'List all users (Admin only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@Req() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get current user stats' })
  getMyStats(@Req() req: any) {
    return this.usersService.getStats(req.user.id);
  }

  @Get(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update own profile' })
  updateProfile(@Req() req: any, @Body() dto: any) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Patch('me/settings')
  @ApiOperation({ summary: 'Update own settings' })
  updateSettings(@Req() req: any, @Body() dto: any) {
    return this.usersService.updateSettings(req.user.id, dto);
  }

  @Patch(':id/role')
  @AdminOnly()
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  updateRole(@Req() req: any, @Param('id') id: string, @Body() body: { role: string }) {
    return this.usersService.updateRole(req.user.id, id, body.role);
  }

  @Patch(':id/suspend')
  @AdminOnly()
  @ApiOperation({ summary: 'Suspend user (Admin only)' })
  suspend(@Req() req: any, @Param('id') id: string, @Body() body: { reason: string }) {
    return this.usersService.suspendUser(req.user.id, id, body.reason);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete own account' })
  deleteAccount(@Req() req: any) {
    return this.usersService.deleteAccount(req.user.id);
  }
}