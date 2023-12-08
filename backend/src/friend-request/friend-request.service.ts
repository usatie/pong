import { Injectable } from '@nestjs/common';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FriendRequestService {
  constructor(private prisma: PrismaService) {}
  create(createFriendRequestDto: CreateFriendRequestDto, user: User) {
    return this.prisma.user
      .update({
        where: { id: user.id },
        data: {
          requesting: {
            connect: { id: createFriendRequestDto.recipientId },
          },
        },
      })
      .then(() => 'Friend request sent');
  }

  findAll(user: User) {
    return this.prisma.user
      .findFirstOrThrow({
        where: { id: user.id },
      })
      .requestedBy();
  }

  findOne(id: number) {
    return `This action returns a #${id} friendRequest`;
  }

  accept(id: number) {
    return `This action updates a #${id} friendRequest`;
  }

  reject(id: number) {
    return `This action updates a #${id} friendRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} friendRequest`;
  }
}
