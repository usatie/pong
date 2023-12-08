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

  accept(requesterId: number, user: User) {
    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        requestedBy: {
          disconnect: { id: requesterId },
        },
        friends: {
          connect: { id: requesterId },
        },
      },
    });
  }

  reject(id: number) {
    return `This action rejects a #${id} friendRequest`;
  }

  remove(recipientId: number, user: User) {
    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        requesting: {
          disconnect: { id: recipientId },
        },
      },
    });
  }
}
