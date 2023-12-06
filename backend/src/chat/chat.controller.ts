import {
  Controller,
  Get,
  Param,
  Req,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('chat')
@ApiTags('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  findConversation(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() request: Request,
  ) {
    return this.chatService.findConversation(userId, request['user']);
  }
}
