import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Role, User } from '@prisma/client';
import { RoomCreatedEvent } from 'src/common/events/room-created.event';
import { RoomEnteredEvent } from 'src/common/events/room-entered.event';
import { RoomLeftEvent } from 'src/common/events/room-left.event';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateUserOnRoomDto } from './dto/update-UserOnRoom.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UserOnRoomEntity } from './entities/UserOnRoom.entity';
import { RoomEntity } from './entities/room.entity';

@Injectable()
export class RoomService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  // room CRUD

  async create(createRoomDto: CreateRoomDto, user: User): Promise<RoomEntity> {
    const { userIds, ...rest } = createRoomDto;

    // validate if there are only one userIds when accessLevel is DIRECT
    if (createRoomDto.accessLevel === 'DIRECT' && userIds.length !== 1) {
      throw new BadRequestException('Direct room should have only one user');
    }
    // If accessLevel is DIRECT, set defaultRole to OWNER
    const defaultRole =
      createRoomDto.accessLevel === 'DIRECT' ? Role.OWNER : Role.MEMBER;

    const room = await this.prisma.room.create({
      data: {
        ...rest,
        users: {
          create: [
            {
              userId: user.id,
              role: Role.OWNER,
            },
            ...userIds.map((userId) => ({
              userId: userId,
              role: defaultRole,
            })),
          ],
        },
      },
    });
    const event: RoomCreatedEvent = {
      roomId: room.id,
      userId: user.id,
    };
    this.eventEmitter.emit('room.created', event);
    return room;
  }

  findAllRoom(userId: number, joined?: boolean): Promise<RoomEntity[]> {
    return this.prisma.room.findMany({
      where: {
        // If joined is true, only return rooms that the user is joined
        users: joined ? { some: { userId: userId } } : undefined,
        OR: [
          { accessLevel: 'PUBLIC' },
          { accessLevel: 'PROTECTED' },
          {
            users: {
              some: {
                userId: userId,
              },
            },
          },
        ],
        // Should not include room for banned users
        BannedUsers: { none: { userId: userId } },
      },
    });
  }

  findRoom(id: number) {
    return this.prisma.room.findUniqueOrThrow({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarURL: true,
              },
            },
          },
        },
      },
    });
  }

  updateRoom(
    roomId: number,
    updateRoomDto: UpdateRoomDto,
  ): Promise<RoomEntity> {
    return this.prisma.room.update({
      where: { id: roomId },
      data: updateRoomDto,
    });
  }

  findAllMessages(roomId: number) {
    return this.prisma.message.findMany({
      where: { roomId: roomId },
      select: {
        content: true,
        roomId: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarURL: true,
          },
        },
      },
    });
  }

  removeRoom(roomId: number): Promise<RoomEntity> {
    return this.prisma.room.delete({
      where: { id: roomId },
    });
  }

  // UserOnRoom CRUD

  async enterRoom(id: number, user: User): Promise<UserOnRoomEntity> {
    const room = await this.prisma.room.findUniqueOrThrow({
      where: { id },
      include: {
        BannedUsers: true,
      },
    });
    if (room.BannedUsers.some((bannedUser) => bannedUser.userId === user.id)) {
      throw new ForbiddenException('You are banned from this room');
    }
    const userOnRoom = await this.prisma.userOnRoom.create({
      data: {
        roomId: id,
        userId: user.id,
        role: Role.MEMBER,
      },
    });
    const event: RoomEnteredEvent = {
      roomId: id,
      userId: user.id,
    };
    this.eventEmitter.emit('room.enter', event);
    return userOnRoom;
  }

  async inviteUser(id: number, userId: number): Promise<UserOnRoomEntity> {
    const room = await this.prisma.room.findUniqueOrThrow({
      where: { id },
      include: {
        BannedUsers: true,
      },
    });
    if (room.accessLevel === 'DIRECT') {
      throw new ForbiddenException('Direct room cannot invite user');
    }
    if (room.BannedUsers.some((bannedUser) => bannedUser.userId === userId)) {
      throw new ForbiddenException('User is banned from this room');
    }
    const userOnRoom = await this.prisma.userOnRoom.create({
      data: {
        roomId: id,
        userId: userId,
        role: Role.MEMBER,
      },
    });
    const event: RoomEnteredEvent = {
      roomId: id,
      userId: userId,
    };
    this.eventEmitter.emit('room.enter', event);
    return userOnRoom;
  }

  findAllUserOnRoom(id: number): Promise<UserOnRoomEntity[]> {
    return this.prisma.userOnRoom.findMany({
      where: { roomId: id },
    });
  }

  findUserOnRoom = (
    roomId: number,
    userId: number,
  ): Promise<UserOnRoomEntity> => {
    return this.prisma.userOnRoom.findUniqueOrThrow({
      where: {
        userId_roomId_unique: {
          roomId: roomId,
          userId: userId,
        },
      },
    });
  };

  updateUserOnRoom = (
    roomId: number,
    userId: number,
    dto: UpdateUserOnRoomDto,
  ): Promise<UserOnRoomEntity> => {
    return this.prisma.userOnRoom.update({
      where: {
        userId_roomId_unique: {
          roomId: roomId,
          userId: userId,
        },
      },
      data: dto,
    });
  };

  async kickUser(roomId: number, userId: number): Promise<UserOnRoomEntity> {
    const room = await this.prisma.room.findUniqueOrThrow({
      where: { id: roomId },
    });
    if (room.accessLevel === 'DIRECT') {
      throw new ForbiddenException('Direct room cannot kick/leave user');
    }
    const deletedUserOnRoom = await this.prisma.userOnRoom.delete({
      where: {
        userId_roomId_unique: {
          roomId: roomId,
          userId: userId,
        },
      },
    });
    // TODO: If owner leaves the room, the room should be deleted or a new owner should be assigned
    const event: RoomLeftEvent = {
      roomId: roomId,
      userId: userId,
    };
    this.eventEmitter.emit('room.leave', event);
    return deletedUserOnRoom;
  }
}
