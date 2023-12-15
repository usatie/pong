import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateDirectMessageDto } from './dto/create-direct-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { Socket } from 'socket.io';
import { WebSocketGateway } from '@nestjs/websockets';
import { AuthService } from 'src/auth/auth.service';

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

  addUserToRoom(roomId: number, user: User) {
    const client = this.clients.get(user.id);
    if (client) {
      client.join(roomId.toString());
    }
  }

  removeUserFromRoom(roomId: number, user: User) {
    const client = this.clients.get(user.id);
    if (client) {
      client.leave(roomId.toString());
    }
  }

  createMessage(data) {
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
    // TODO: delete room
    // this.server.socketsLeave(roomId.toString());
  }

  sendToRoom(roomId: number, event: string, data: any) {
    // TOOD: send to room
    // this.server.to(roomId.toString()).emit(event, data);
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    if (!token) {
      throw new UnauthorizedException('No token provided');
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
      rooms.forEach((room) => this.addUserToRoom(room.id, user));
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
      throw new ConflictException('Blocked by user');
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
