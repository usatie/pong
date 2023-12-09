import { Injectable, NotFoundException } from '@nestjs/common';
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

  private async expectRequestedBy(requesterId: number, user: User, tx) {
    const requests = await tx.user
      .findFirstOrThrow({
        where: { id: user.id },
      })
      .requestedBy({
        where: { id: requesterId },
      });
    if (requests.length === 0) {
      throw new NotFoundException('No friend request found');
    }
  }

  private async expectRequesting(recipientId: number, user: User, tx) {
    const requests = await tx.user
      .findFirstOrThrow({
        where: { id: user.id },
      })
      .requesting({
        where: { id: recipientId },
      });
    if (requests.length === 0) {
      throw new NotFoundException('No friend request found');
    }
  }

  accept(requesterId: number, user: User) {
    return this.prisma.$transaction(async (tx) => {
      // Check if user is requested by requester
      await this.expectRequestedBy(requesterId, user, tx);

      // Remove the friend request and add the requester to friends
      return tx.user.update({
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
    });
  }

  reject(requesterId: number, user: User) {
    return this.prisma.$transaction(async (tx) => {
      // Check if user is requested by requester
      await this.expectRequestedBy(requesterId, user, tx);

      // Remove the friend request
      return tx.user.update({
        where: { id: user.id },
        data: {
          requestedBy: {
            disconnect: { id: requesterId },
          },
        },
      });
    });
  }

  cancel(recipientId: number, user: User) {
    return this.prisma.$transaction(async (tx) => {
      // Check if user is requesting recipient
      await this.expectRequesting(recipientId, user, tx);

      // Remove the friend request
      return tx.user.update({
        where: { id: user.id },
        data: {
          requesting: {
            disconnect: { id: recipientId },
          },
        },
      });
    });
  }
}
