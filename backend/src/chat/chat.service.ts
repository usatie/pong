import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebSocketGateway, WsException } from '@nestjs/websockets';
import { User } from '@prisma/client';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { BlockEvent } from 'src/common/events/block.event';
import { RoomCreatedEvent } from 'src/common/events/room-created.event';
import { RoomDeletedEvent } from 'src/common/events/room-deleted.event';
import { UnblockEvent } from 'src/common/events/unblock.event';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { PublicUserEntity } from './entities/message.entity';

export enum UserStatus {
  Offline = 0b0,
  Online = 0b1,
}

type OnlineStatus = {
  name: string;
  userId: number;
  status: UserStatus;
};

@Injectable()
@WebSocketGateway()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private userService: UserService,
  ) {}

  // Map<User.id, Socket>
  private clients = new Map<User['id'], Socket>();
  // key: inviter, value: invitee
  private users = new Map<Socket['id'], PublicUserEntity>();
  private invite = new Map<User['id'], User['id']>();
  private statuses = new Map<User['id'], UserStatus>();

  getUser(client: Socket) {
    return this.users.get(client.id);
  }

  getWsFromUserId(userId: number): Socket | undefined {
    return this.clients.get(userId);
  }

  getUserId(client: Socket) {
    const user = this.users.get(client.id);
    if (user) {
      return user.id;
    }
    return undefined;
  }

  addClient(user: User, client: Socket) {
    this.clients.set(user.id, client);
    this.users.set(client.id, new PublicUserEntity(user));
  }

  removeClient(client: Socket) {
    const user = this.users.get(client.id);
    if (user) {
      this.statuses.delete(user.id);
      this.clients.delete(user.id);
      this.users.delete(client.id);
      this.removeInvite(user.id);
    }
  }

  addInvite(inviterId: number, inviteeId: number) {
    this.invite.set(inviterId, inviteeId);
  }

  getInvite(inviterId: number) {
    return this.invite.get(inviterId);
  }

  removeInvite(inviterId: number) {
    this.invite.delete(inviterId);
  }

  addUserToRoom(roomId: number, userId: number) {
    const client = this.clients.get(userId);
    if (client) {
      client.join(roomId.toString());
    }
  }

  removeUserFromRoom(roomId: number, userId: number) {
    const client = this.clients.get(userId);
    if (client) {
      client.leave(roomId.toString());
    }
  }

  getUsersBlockedBy(userId: number) {
    return this.prisma.user
      .findUniqueOrThrow({
        where: { id: userId },
        include: { blocking: true },
      })
      .then((user) => user.blocking);
  }

  @OnEvent('room.created', { async: true })
  async handleRoomCreatedEvent(event: RoomCreatedEvent) {
    await this.addUserToRoom(event.roomId, event.userId);
    if (event.userIds) {
      event.userIds.forEach((userId) =>
        this.addUserToRoom(event.roomId, userId),
      );
    }
  }

  @OnEvent('block', { async: true })
  async handleBlockUser(event: BlockEvent) {
    const client = this.clients.get(event.blockerId);
    if (client) {
      client.join('block' + event.blockedId);
    }
  }

  @OnEvent('unblock', { async: true })
  async handleUnblockUser(event: UnblockEvent) {
    const client = this.clients.get(event.unblockerId);
    if (client) {
      client.leave('block' + event.unblockedId);
    }
  }

  createMessage(data: CreateMessageDto) {
    return this.prisma.message.create({
      data: {
        content: data.content,
        room: { connect: { id: data.roomId } },
        user: { connect: { id: data.userId } },
      },
    });
  }

  deleteSocketRoom(event: RoomDeletedEvent) {
    event.userIds.forEach((userId) =>
      this.removeUserFromRoom(event.roomId, userId),
    );
  }

  sendToRoom(roomId: number, event: string, data: any) {
    roomId;
    event;
    data;
    // TODO: send to room
    // this.server.to(roomId.toString()).emit(event, data);
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.cookie
      ?.split('; ')
      ?.find((c) => c.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      console.error('No token provided');
      client.disconnect();
      return;
    }
    try {
      const user = await this.authService.verifyAccessToken(token);
      this.addClient(user, client);
      const blockingUsers = await this.userService.findAllBlocked(user.id);
      blockingUsers.forEach((blockingUser) =>
        client.join('block' + blockingUser.id),
      );
      const rooms = await this.prisma.room.findMany({
        where: {
          users: {
            some: {
              userId: user.id,
            },
          },
        },
      });
      rooms.forEach((room) => this.addUserToRoom(room.id, user.id));
      this.statuses.set(user.id, UserStatus.Online);
      client.emit('online-status', this.getUserStatuses());
      client.broadcast.emit('online-status', [
        { userId: user.id, status: UserStatus.Online, name: user.name },
      ]);
    } catch (error) {
      console.log(error);
    }
  }

  handleChangeOnlineStatus(
    event: {
      userId: number;
      status: UserStatus;
    }[],
  ) {
    event.forEach((e) => {
      const state = this.statuses[e.userId]
        ? (this.statuses[e.userId] |= e.status)
        : e.status;
      this.statuses.set(e.userId, state);
      if (this.statuses[e.userId] === UserStatus.Offline) {
        this.statuses.delete(e.userId);
      }
    });
  }

  handleDisconnect(client: Socket) {
    const emitData = {
      userId: this.getUserId(client),
      status: UserStatus.Offline,
      name: this.getUser(client).name,
    };
    if (emitData.userId) {
      client.broadcast.emit('online-status', [emitData]);
    }
    this.removeClient(client);
  }

  getUserStatuses(): OnlineStatus[] {
    return Array.from(this.users).map(([id, user]) => {
      id; // TODO : remove this
      return {
        userId: user.id,
        name: user.name,
        status: this.statuses.get(user.id) || UserStatus.Offline,
      };
    });
  }

  private async expectNotBlockedBy(blockerId: number, userId: number) {
    const blockedBy = await this.prisma.user
      .findFirstOrThrow({
        where: { id: userId },
      })
      .blockedBy({
        where: { id: blockerId },
      });
    if (blockedBy.length > 0) {
      throw new WsException('Blocked by user');
    }
  }

  async findConversation(userId: number, me: User) {
    await this.expectNotBlockedBy(me.id, userId);
    return this.prisma.directMessage.findMany({
      where: {
        OR: [
          {
            receiverId: userId,
            senderId: me.id,
          },
          {
            receiverId: me.id,
            senderId: userId,
          },
        ],
      },
    });
  }

  isOnline = (userId: number) => ({ isOnline: this.clients.has(userId) });
}
