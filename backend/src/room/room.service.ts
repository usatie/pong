import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserOnRoomDto } from './dto/user-on-room.dto';
import { UserOnRoomEntity } from './entities/roomOnRoom.entity';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  create(createRoomDto: CreateRoomDto, userId: number) {
    return this.prisma.room.create({
      data: {
        name: createRoomDto.name,
        users: {
          create: [
            {
              userId: userId,
              role: 'owner',
            },
          ],
        },
      },
    });
  }

  findAll() {
    return this.prisma.room.findMany();
  }

  async findOne(id: number, userId: number) {
    await this.prisma.userOnRoom.findUniqueOrThrow({
      where: {
        userId_roomId_unique: {
          userId: userId,
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

	async enterRoom(id: number, userId: number): Promise<UserOnRoomEntity> {
    return this.prisma.userOnRoom.create({
      data: {
        roomId: id,
        userId: userId,
        role: 'member',
      },
    });
  }

	leaveRoom(id: number, userId: number): Promise<UserOnRoomEntity> {
    return this.prisma.userOnRoom.delete({
      where: {
        userId_roomId_unique: {
          roomId: id,
          userId: userId,
        },
      },
    });
  }
}
