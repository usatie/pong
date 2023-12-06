import { Injectable } from '@nestjs/common';
import { CreateDirectMessageDto } from './dto/create-direct-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createDirectMessage(senderId: number, dto: CreateDirectMessageDto) {
    return this.prisma.directMessage.create({
      data: {
        senderId,
        ...dto, //TODO receiverIdのvalidationどうする？
      },
    });
  }

  async findConversation(userId: number, me: User) {
    console.log(userId);
    console.log(me);
    return this.prisma.directMessage.findMany({
      where: {
        OR: [
          {
            receiverId: userId,
            senderId: me.id,
          },
          {
            receiverId: me.id,
            senderId: userId,
          },
        ],
      },
    });
  }
}
