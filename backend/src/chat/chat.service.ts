import { Injectable, ConflictException } from '@nestjs/common';
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

  private async expectNotBlockedBy(blockerId: number, userId: number) {
    const blockedBy = await this.prisma.user
      .findFirstOrThrow({
        where: { id: userId },
      })
      .blockedBy({
        where: { id: blockerId },
      });
    if (blockedBy.length > 0) {
      throw new ConflictException('Blocked by user');
    }
  }

  async findConversation(userId: number, me: User) {
    await this.expectNotBlockedBy(me.id, userId);
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
