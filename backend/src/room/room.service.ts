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

  findRoom(id: number): Promise<RoomEntity> {
    return this.prisma.room.findUniqueOrThrow({
      where: { id },
      include: {
        users: true,
      },
    });
  }

  updateRoom = (
    id: number,
    updateRoomDto: UpdateRoomDto,
    role: Role,
  ): Promise<RoomEntity> =>
    role !== Role.OWNER
      ? Promise.reject(new HttpException('Forbidden', 403))
      : this.prisma.room.update({
          where: { id },
          data: updateRoomDto,
        });

  removeRoom = (id: number, role: Role): Promise<RoomEntity> =>
    role !== Role.OWNER
      ? Promise.reject(new HttpException('Forbidden', 403))
      : this.removeAllUserOnRoom(id).then(() =>
          this.prisma.room.delete({
            where: { id },
          }),
        );

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
    role: Role,
    userId: number,
    dto: UpdateUserOnRoomDto,
  ): Promise<UserOnRoomEntity> => {
    if (role === Role.MEMBER)
      return Promise.reject(new HttpException('Forbidden', 403));
    const validateRole =
      (changerRole: Role) =>
      (targetRole: Role): boolean =>
        this.roleToNum(changerRole) >= this.roleToNum(targetRole);
    const validateRoleBy = validateRole(role);

    if (this.roleToNum(dto.role) !== -1 && validateRoleBy(dto.role) === false)
      return Promise.reject(new HttpException('Forbidden', 403));
    else
      return this.findUserOnRoom(roomId, userId)
        .then((userOnRoomEntity) =>
          validateRoleBy(userOnRoomEntity.role) === false
            ? Promise.reject(new HttpException('Forbidden', 403))
            : this.prisma.userOnRoom.update({
                where: {
                  userId_roomId_unique: {
                    roomId: roomId,
                    userId: userId,
                  },
                },
                data: dto,
              }),
        )
        .catch((err) => {
          throw err;
        });
  };

  removeUserOnRoom(
    roomId: number,
    role: Role,
    userId: number,
    client: User,
  ): Promise<UserOnRoomEntity> {
    if (client.id != userId && role === Role.MEMBER)
      return Promise.reject(new HttpException('Forbidden', 403));
    const validateRole =
      (changerRole: Role) =>
      (targetRole: Role): boolean => {
        return this.roleToNum(changerRole) >= this.roleToNum(targetRole);
      };
    const validateRoleBy = validateRole(role);

    return this.findUserOnRoom(roomId, userId).then((userOnRoomEntity) => {
      if (validateRoleBy(userOnRoomEntity.role)) {
        return this.prisma.userOnRoom.delete({
          where: {
            userId_roomId_unique: {
              roomId: roomId,
              userId: userId,
            },
          },
        });
      } else {
        return Promise.reject(new HttpException('Forbidden', 403));
      }
    });
  }

  removeAllUserOnRoom(roomId: number): Promise<BatchPayload> {
    return this.prisma.userOnRoom.deleteMany({
      where: { roomId },
    });
  }

  private roleToNum(role: Role): number {
    switch (role) {
      case Role.MEMBER:
        return 0;
      case Role.ADMINISTRATOR:
        return 1;
      case Role.OWNER:
        return 2;
      default:
        return -1;
    }
  }
}
