import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  //  Patch,
  Param,
  //  Delete,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
//import { UpdateChatDto } from './dto/update-chat.dto';
import { CreateDirectMessageDto } from './dto/create-direct-message.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('chat')
@ApiTags('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  createConversation(@Body() createChatDto: CreateChatDto) {
    return this.chatService.createConversation(createChatDto);
  }

  @Get()
  findConversation(@Query() createChatDto: CreateChatDto) {
    return this.chatService.findConversation(createChatDto);
  }

  //  @Get(':id')
  //  findOne(@Param('id') id: string) {
  //    return this.chatService.findOne(+id);
  //  }
  //
  //  @Patch(':id')
  //  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
  //    return this.chatService.update(+id, updateChatDto);
  //  }
  //
  //  @Delete(':id')
  //  remove(@Param('id') id: string) {
  //    return this.chatService.remove(+id);
  //  }

  @Post(':id')
  createDirectMessage(
    @Param('id') id: string,
    @Body() createDirectMessageDto: CreateDirectMessageDto,
  ) {
    return this.chatService.createDirectMessage(+id, createDirectMessageDto);
  }
}
