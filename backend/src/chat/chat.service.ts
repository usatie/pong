import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebSocketGateway, WsException } from '@nestjs/websockets';
import { User } from '@prisma/client';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { BlockEvent } from 'src/common/events/block.event';
import { RoomCreatedEvent } from 'src/common/events/room-created.event';
import { RoomLeftEvent } from 'src/common/events/room-left.event';
import { UnblockEvent } from 'src/common/events/unblock.event';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { PublicUserEntity } from './entities/message.entity';

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
  private users = new Map<Socket['id'], PublicUserEntity>();
  // key: inviter, value: invitee
  private invite = new Map<User['id'], User['id']>();

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
  }

  async removeUserFromRoom(event: RoomLeftEvent) {
    const client = this.clients.get(event.userId);
    if (client) {
      client.leave(event.roomId.toString());
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

  deleteRoom(roomId: number) {
    roomId;
    // TODO: delete room
    // this.server.socketsLeave(roomId.toString());
  }

  sendToRoom(roomId: number, event: string, data: any) {
    roomId;
    event;
    data;
    // TOOD: send to room
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
    } catch (error) {
      console.log(error);
    }
  }

  handleDisconnect(client: Socket) {
    this.removeClient(client);
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
