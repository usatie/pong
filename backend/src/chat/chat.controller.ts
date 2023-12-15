import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/current-user.decorator';
import { User } from '@prisma/client';

@Controller('chat')
@ApiTags('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findConversation(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: User,
  ) {
    return this.chatService.findConversation(userId, user);
  }
}
