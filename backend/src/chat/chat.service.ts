import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
//import { UpdateChatDto } from './dto/update-chat.dto';
import { CreateDirectMessageDto } from './dto/create-direct-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  createConversation(createChatDto: CreateChatDto) {
    return this.prisma.conversation.create({ data: createChatDto });
  }

  findConversation(createChatDto: CreateChatDto) {
    return this.prisma.conversation.findFirstOrThrow({
      where: {
        AND: [
          { userOneId: createChatDto.userOneId },
          { userTwoId: createChatDto.userTwoId },
        ],
      },
      include: {
        directmessages: true,
      },
    });
  }

  //  findOne(id: number) {
  //    return `This action returns a #${id} chat`;
  //  }
  //
  //  update(id: number, updateChatDto: UpdateChatDto) {
  //    return `This action updates a #${id} chat`;
  //  }
  //
  //  remove(id: number) {
  //    return `This action removes a #${id} chat`;
  //  }

  async createDirectMessage(
    conversationId: number,
    createDirectMessageDto: CreateDirectMessageDto,
  ) {
    return this.prisma.directMessage.create({
      data: {
        conversationId: conversationId,
        content: createDirectMessageDto.content,
        userName: createDirectMessageDto.userName,
      },
    });
  }
}
