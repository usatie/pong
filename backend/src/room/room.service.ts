import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role, User } from '@prisma/client';
import { UserOnRoomEntity } from './entities/UserOnRoom.entity';
import { RoomEntity } from './entities/room.entity';
import { UpdateUserOnRoomDto } from './dto/update-UserOnRoom.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RoomCreatedEvent } from 'src/common/events/room-created.event';
import { RoomEnteredEvent } from 'src/common/events/room-entered.event';
import { RoomLeftEvent } from 'src/common/events/room-left.event';

@Injectable()
export class RoomService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  // room CRUD

  async create(createRoomDto: CreateRoomDto, user: User): Promise<RoomEntity> {
    const room = await this.prisma.room.create({
      data: {
        name: createRoomDto.name,
        users: {
          create: [
            {
              userId: user.id,
              role: Role.OWNER,
            },
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

  findAllRoom(): Promise<RoomEntity[]> {
    return this.prisma.room.findMany();
  }

  findRoom(id: number): Promise<RoomEntity> {
    return this.prisma.room.findUniqueOrThrow({
      where: { id },
      include: {
        users: true,
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

  async createUserOnRoom(id: number, user: User): Promise<UserOnRoomEntity> {
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
