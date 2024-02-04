import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMuteDto } from './dto/create-mute.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RoomMuteEvent } from 'src/common/events/room-mute.event';
import { RoomUnmuteEvent } from 'src/common/events/room-unmute.event';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MuteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async purgeExpiredMutesIfExists(roomId: number, userId: number) {
    const now = new Date();
    const mute = await this.prisma.muteUserOnRoom.findUnique({
      where: {
        userId_roomId_unique: {
          userId,
          roomId,
        },
      },
    });
    if (mute && mute.expiresAt && mute.expiresAt <= now) {
      await this.remove(roomId, userId);
    }
  }

  async create(roomId: number, userId: number, createMuteDto: CreateMuteDto) {
    await this.prisma.$transaction(async (prisma) => {
      const room = await prisma.room.findUnique({
        where: {
          id: roomId,
        },
      });
      if (room.accessLevel === 'DIRECT') {
        throw new BadRequestException('Cannot mute user in DIRECT room');
      }
      const user = await prisma.userOnRoom.findUnique({
        where: {
          userId_roomId_unique: {
            userId,
            roomId,
          },
        },
      });
      if (!user) {
        throw new NotFoundException('User does not exist in the room');
      }
      if (user.role === 'OWNER') {
        throw new ForbiddenException('Cannot mute owner');
      }
      await this.purgeExpiredMutesIfExists(roomId, userId);
      let expiresAt;
      if (!createMuteDto.duration) {
        expiresAt = null;
      } else {
        expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + createMuteDto.duration);
      }
      await prisma.muteUserOnRoom.create({
        data: {
          userId,
          roomId,
          expiresAt,
        },
      });
      const event: RoomMuteEvent = {
        roomId: roomId,
        userId: userId,
      };
      this.eventEmitter.emit('room.mute', event);
    });
    return {
      message: 'Mute user successfully',
    };
  }

  async findAll(roomId: number) {
    const now = new Date();
    const tmp = await this.prisma.muteUserOnRoom.findMany({
      where: {
        roomId,
        OR: [
          {
            expiresAt: {
              gt: now,
            },
          },
          {
            expiresAt: null,
          },
        ],
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
      const user = await prisma.muteUserOnRoom.findUnique({
        where: {
          userId_roomId_unique: {
            userId,
            roomId,
          },
        },
      });
      if (!user) {
        throw new NotFoundException('User not found in the Mute list');
      }
      await prisma.muteUserOnRoom.delete({
        where: {
          userId_roomId_unique: {
            userId,
            roomId,
          },
        },
      });
      const event: RoomUnmuteEvent = {
        roomId: roomId,
        userId: userId,
      };
      this.eventEmitter.emit('room.unmute', event);
      return { message: 'Unmute user successfully' };
    });
  }
}
