import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FriendRequestService {
  constructor(private prisma: PrismaService) {}

  create(recipientId: number, user: User) {
    if (recipientId === user.id) {
      throw new BadRequestException('Cannot send friend request to self');
    }
    return this.prisma.$transaction(async (tx) => {
      await this.expectNotRequesting(recipientId, user, tx);
      await this.expectNotFriends(recipientId, user, tx);
      await this.expectNotBlockedBy(recipientId, user, tx);
      await this.expectNotBlocking(recipientId, user, tx);
      return tx.user
        .update({
          where: { id: user.id },
          data: {
            requesting: {
              connect: { id: recipientId },
            },
          },
        })
        .then(() => 'Friend request sent');
    });
  }

  async findAll(user: User) {
    const u = this.prisma.user.findFirstOrThrow({
      where: {
        id: user.id,
      },
    });
    const requestedBy = u.requestedBy();
    const requesting = u.requesting();
    return Promise.all([requestedBy, requesting]).then(([a, b]) => {
      return {
        requestedBy: a,
        requesting: b,
      };
    });
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

  private async expectNotRequesting(recipientId: number, user: User, tx) {
    const requests = await tx.user
      .findFirstOrThrow({
        where: { id: user.id },
      })
      .requesting({
        where: { id: recipientId },
      });
    if (requests.length > 0) {
      throw new ConflictException('Friend request already sent');
    }
  }

  private async expectNotBlockedBy(blockerId: number, user: User, tx) {
    const blockedBy = await tx.user
      .findFirstOrThrow({
        where: { id: user.id },
      })
      .blockedBy({
        where: { id: blockerId },
      });
    if (blockedBy.length > 0) {
      throw new ConflictException('Blocked by user');
    }
  }

  private async expectNotBlocking(blockedId: number, user: User, tx) {
    const blocking = await tx.user
      .findFirstOrThrow({
        where: { id: user.id },
      })
      .blocking({
        where: { id: blockedId },
      });
    if (blocking.length > 0) {
      throw new ConflictException('Blocking user');
    }
  }

  private async expectNotFriends(friendId: number, user: User, tx) {
    const u = tx.user.findFirstOrThrow({
      where: {
        id: user.id,
      },
    });
    const friends = await u.friends({
      where: { id: friendId },
    });
    const friendsOf = await u.friendsOf({
      where: { id: friendId },
    });
    if (friends.length > 0 || friendsOf.length > 0) {
      throw new ConflictException('Already friends');
    }
  }

  accept(requesterId: number, user: User) {
    return this.prisma.$transaction(async (tx) => {
      // Check if user is requested by requester
      await this.expectRequestedBy(requesterId, user, tx);
      await this.expectNotBlockedBy(requesterId, user, tx);
      await this.expectNotBlocking(requesterId, user, tx);

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
