import { Injectable } from '@nestjs/common';
import { CreateDirectMessageDto } from './dto/create-direct-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { Socket } from 'socket.io';
import { WebSocketGateway, WsException } from '@nestjs/websockets';
import { AuthService } from 'src/auth/auth.service';
import { CreateMessageDto } from './dto/craete-message.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { RoomCreatedEvent } from 'src/common/events/room-created.event';
import { RoomEnteredEvent } from 'src/common/events/room-entered.event';

@Injectable()
@WebSocketGateway()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  // Map<User.id, Socket>
  private clients = new Map<User['id'], Socket>();
  private users = new Map<Socket['id'], User>();

  getUserId(client: Socket) {
    const user = this.users.get(client.id);
    if (user) {
      return user.id;
    }
    return undefined;
  }

  addClient(user: User, client: Socket) {
    this.clients.set(user.id, client);
    this.users.set(client.id, user);
  }

  removeClient(client: Socket) {
    const user = this.users.get(client.id);
    if (user) {
      this.clients.delete(user.id);
      this.users.delete(client.id);
    }
  }

  addUserToRoom(roomId: number, userId: number) {
    const client = this.clients.get(userId);
    if (client) {
      client.join(roomId.toString());
    }
  }

  @OnEvent('room.created', { async: true })
  async handleRoomCreatedEvent(event: RoomCreatedEvent) {
    await this.addUserToRoom(event.roomId, event.userId);
  }

  @OnEvent('room.enter', { async: true })
  async handleUserOnRoomCreatedEvent(event: RoomEnteredEvent) {
    await this.addUserToRoom(event.roomId, event.userId);
  }

  removeUserFromRoom(roomId: number, user: User) {
    const client = this.clients.get(user.id);
    if (client) {
      client.leave(roomId.toString());
    }
  }

  createMessage(data: CreateMessageDto) {
    // TODO: create message
    data;
    /*
    return this.prisma.message.create({
      data: {
        content,
        room: { connect: { id: roomId } },
        user: { connect: { id: userId } },
      },
    });
    */
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
    const token = client.handshake.auth.token;
    if (!token) {
      console.error('No token provided');
      client.disconnect();
      return;
    }
    try {
      const user = await this.authService.verifyAccessToken(token);
      this.addClient(user, client);
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

  async createDirectMessage(senderId: number, dto: CreateDirectMessageDto) {
    return this.prisma.directMessage.create({
      data: {
        senderId,
        ...dto, //TODO receiverIdのvalidationどうする？
      },
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
}
