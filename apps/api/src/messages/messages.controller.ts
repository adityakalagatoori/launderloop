import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  send(@Req() req: any, @Body() dto: { receiverId: string; content: string }) {
    return this.messagesService.send(req.user.id, dto);
  }

  @Get('inbox')
  @ApiOperation({ summary: 'Get inbox' })
  getInbox(@Req() req: any) {
    return this.messagesService.getInbox(req.user.id);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get conversation with a user' })
  getConversation(@Req() req: any, @Param('userId') userId: string, @Query() query: any) {
    return this.messagesService.getConversation(req.user.id, userId, query);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message' })
  delete(@Req() req: any, @Param('id') id: string) {
    return this.messagesService.delete(req.user.id, id);
  }
}