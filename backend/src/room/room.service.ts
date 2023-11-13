import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserOnRoomDto } from './dto/user-on-room.dto';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  create(createRoomDto: CreateRoomDto) {
    return this.prisma.room.create({
      data: {
        name: createRoomDto.name,
        users: {
          create: [
            {
              userid: createRoomDto.userId,
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
    await this.prisma.useronroom.findUniqueOrThrow({
      where: {
        userid_roomid_unique: {
          userid: userId,
          roomid: id,
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

  async enterRoom(id: number, userId: number): Promise<UserOnRoomDto> {
    return this.prisma.useronroom.create({
      data: {
        roomid: id,
        userid: userId,
        role: 'member',
      },
    });
  }

  leaveRoom(id: number, userId: number): Promise<UserOnRoomDto> {
    return this.prisma.useronroom.delete({
      where: {
        userid_roomid_unique: {
          roomid: id,
          userid: userId,
        },
      },
    });
  }
}
