import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserOnRoomEntity } from './entities/roomOnRoom.entity';

interface User {
  id: number;
  name: string;
}

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  create(createRoomDto: CreateRoomDto, user: User) {
    return this.prisma.room.create({
      data: {
        name: createRoomDto.name,
        users: {
          create: [
            {
              userId: user.id,
              role: 'OWNER',
            },
          ],
        },
      },
    });
  }

  findAll() {
    return this.prisma.room.findMany();
  }

  async findOne(id: number, user: User) {
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

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
    });
  }

  remove(id: number) {
    return this.prisma.room.delete({ where: { id } });
  }

  async enterRoom(id: number, user: User): Promise<UserOnRoomEntity> {
    return this.prisma.userOnRoom.create({
      data: {
        roomId: id,
        userId: user.id,
        role: 'MEMBER',
      },
    });
  }

  leaveRoom(roomId: number, user: User): Promise<UserOnRoomEntity> {
    return this.prisma.userOnRoom.delete({
      where: {
        userId_roomId_unique: {
          roomId: roomId,
          userId: user.id,
        },
      },
    });
  }
}
