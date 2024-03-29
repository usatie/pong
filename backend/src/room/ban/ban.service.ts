import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Role } from '@prisma/client';
import { RoomLeftEvent } from 'src/common/events/room-left.event';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BanService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(roomId: number, userId: number) {
    await this.prisma.$transaction(async (prisma) => {
      const room = await prisma.room.findUniqueOrThrow({
        where: {
          id: roomId,
        },
      });
      if (room.accessLevel === 'DIRECT') {
        throw new BadRequestException('Cannot ban user in DIRECT room');
      }
      const user = await prisma.userOnRoom.findUnique({
        where: {
          userId_roomId_unique: {
            userId: userId,
            roomId: roomId,
          },
        },
      });
      if (user) {
        if (user.role === Role.OWNER) {
          throw new ForbiddenException('Cannot ban owner');
        }
        await prisma.userOnRoom
          .delete({
            where: {
              userId_roomId_unique: {
                userId: userId,
                roomId: roomId,
              },
            },
          })
          .then(() => {
            const event: RoomLeftEvent = {
              roomId: roomId,
              userId: userId,
            };
            this.eventEmitter.emit('room.leave', event);
          });
      }
      await prisma.banUserOnRoom.create({
        data: {
          userId: userId,
          roomId: roomId,
        },
      });
    });
    return { message: 'Ban user successfully' };
  }

  async findAll(roomId: number) {
    const tmp = await this.prisma.banUserOnRoom.findMany({
      where: {
        roomId: roomId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarURL: true,
          },
        },
      },
    });
    const users = tmp.map((item) => item.user);
    return users;
  }

  async remove(roomId: number, userId: number) {
    await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.banUserOnRoom.findUnique({
        where: {
          userId_roomId_unique: {
            userId: userId,
            roomId: roomId,
          },
        },
      });
      if (!user) {
        throw new NotFoundException('User not found in the Ban list');
      }
      await prisma.banUserOnRoom.delete({
        where: {
          userId_roomId_unique: {
            userId: userId,
            roomId: roomId,
          },
        },
      });
    });
    return { message: 'Unban user successfully' };
  }
}
