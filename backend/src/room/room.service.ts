import { HttpException, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { UserOnRoomEntity } from './entities/UserOnRoom.entity';
import { RoomEntity } from './entities/room.entity';
import { UpdateUserOnRoomDto } from './dto/update-UserOnRoom.dto';

interface User {
  id: number;
  name: string;
}

type BatchPayload = {
  count: number;
};

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  // room CRUD

  create(createRoomDto: CreateRoomDto, user: User): Promise<RoomEntity> {
    return this.prisma.room.create({
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
  }

  findAllRoom(): Promise<RoomEntity[]> {
    return this.prisma.room.findMany();
  }

  findRoom(id: number, user: User): Promise<RoomEntity> {
    return this.prisma.room
      .findUniqueOrThrow({
        where: { id },
        include: {
          users: true,
        },
      })
      .then((roomEntity) => {
        const userOnRoomEntity = roomEntity.users.find(
          (userOnRoomEntity) => userOnRoomEntity.userId === user.id,
        );
        if (userOnRoomEntity === undefined) {
          throw new HttpException('Forbidden', 403);
        } else {
          return roomEntity;
        }
      });
  }

  updateRoom(
    id: number,
    updateRoomDto: UpdateRoomDto,
    user: User,
  ): Promise<RoomEntity> {
    return this.findUserOnRoom(id, user, user.id).then((userOnRoomEntity) => {
      if (userOnRoomEntity.role !== Role.OWNER) {
        throw new HttpException('Forbidden', 403);
      } else {
        return this.prisma.room.update({
          where: { id },
          data: updateRoomDto,
        });
      }
    });
  }

  removeRoom(id: number, user: User): Promise<RoomEntity> {
    return this.findUserOnRoom(id, user, user.id)
      .catch((e) => {
        throw new HttpException('Forbidden', 403);
      })
      .then((userOnRoomEntity) => {
        if (userOnRoomEntity.role !== Role.OWNER) {
          throw new HttpException('Forbidden', 403);
        } else {
          return this.removeAllUserOnRoom(id).then(() =>
            this.prisma.room.delete({
              where: { id },
            }),
          );
        }
      });
  }

  // UserOnRoom CRUD

  createUserOnRoom(id: number, user: User): Promise<UserOnRoomEntity> {
    return this.prisma.userOnRoom.create({
      data: {
        roomId: id,
        userId: user.id,
        role: Role.MEMBER,
      },
    });
  }

  findAllUserOnRoom(id: number): Promise<UserOnRoomEntity[]> {
    return this.prisma.userOnRoom.findMany({
      where: { roomId: id },
    });
  }

  findUserOnRoom = (
    roomId: number,
    client: User,
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

  updateUserOnRoom(
    roomId: number,
    client: User,
    userId: number,
    updateUserOnRoom: UpdateUserOnRoomDto,
  ): Promise<UserOnRoomEntity> {
    return this.prisma.userOnRoom.update({
      where: {
        userId_roomId_unique: {
          roomId: roomId,
          userId: userId,
        },
      },
      data: updateUserOnRoom,
    });
  }

  removeUserOnRoom(
    roomId: number,
    client: User,
    userId: number,
  ): Promise<UserOnRoomEntity> {
    return this.findUserOnRoom(roomId, client, client.id)
      .then((userOnRoomEntity) => {
        if (userOnRoomEntity.role === Role.OWNER || client.id === userId) {
          return this.prisma.userOnRoom.delete({
            where: {
              userId_roomId_unique: {
                roomId: roomId,
                userId: userId,
              },
            },
          });
        } else {
          throw 404;
        }
      })
      .catch((err) => {
        throw err;
      });
  }

  removeAllUserOnRoom(roomId: number): Promise<BatchPayload> {
    return this.prisma.userOnRoom.deleteMany({
      where: { roomId },
    });
  }
}
