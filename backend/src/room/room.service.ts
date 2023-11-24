import { Injectable } from '@nestjs/common';
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

  findAllRoom() {
    return this.prisma.room.findMany();
  }

  async findRoom(id: number, user: User) {
    await this.prisma.userOnRoom.findUniqueOrThrow({
      where: {
        userId_roomId_unique: {
          userId: user.id,
          roomId: id,
        },
      },
    });
    return this.prisma.room.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });
  }

  updateRoom(id: number, updateRoomDto: UpdateRoomDto) {
    return this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
    });
  }

  removeRoom(id: number): Promise<RoomEntity> {
    return this.removeAllUserOnRoom(id)
      .then(() =>
        this.prisma.room.delete({
          where: { id },
        }),
      )
      .catch((err) => {throw err});
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

  findUserOnRoom = (
    roomId: number,
    client: User,
    userId: number,
  ): Promise<UserOnRoomEntity> => {
  return this.prisma.userOnRoom.findUniqueOrThrow({
    where: {
      userId_roomId_unique: {
        roomId: roomId,
        userId: client.id,
      },
    }
  }).then(() => {
    return this.prisma.userOnRoom.findUniqueOrThrow({
      where: {
        userId_roomId_unique: {
          roomId: roomId,
          userId: userId,
        },
      },
    });
  }).catch((err) => err);
  }

  updateUserOnRoom(
    roomId: number,
    client: User,
    userId: number,
    updateUserOnRoom: UpdateUserOnRoomDto,
  ): Promise<UserOnRoomEntity> {
    const
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
    return this.findUserOnRoom(roomId, client.id)
      .then((userOnRoomEntity) => {
        if ((userOnRoomEntity.role = Role.OWNER)) {
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
