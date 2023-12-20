import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateDirectMessageDto } from './dto/create-direct-message.dto';
import { UserService } from '../user/user.service';
import { CreateMessageDto } from './dto/create-message.dto';

//type PrivateMessage = {
//  conversationId: string;
//  from: string;
//  to: string;
//  userName: string;
//  text: string;
//};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
  cookie: true,
})
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  private userMap = new Map<number, string>();
  private blockMap = new Map<number, number[]>();

  private getValueToKey = (map, findValue): number | undefined => {
    for (const [key, value] of map.entries()) {
      if (value == findValue) {
        return key;
      }
    }
    return undefined;
  };

  @SubscribeMessage('privateMessage')
  privateMessageToUser(
    @MessageBody() data: CreateDirectMessageDto,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log('private message received');
    this.logger.log(data);

    const userId = this.getValueToKey(this.userMap, client.id);
    if (userId) {
      const userName = 'hoge'; //TODO mapを増やすか、mapのvalueを増やすか user name取得関数実装
      this.chatService.createDirectMessage(userId, data);
      this.server
        .except('block' + userId)
        .to(client.id)
        .to(this.userMap.get(data.receiverId)) //TODO receiverIdが見つからなかった時のvalidation
        .emit('sendToUser', { ...data, senderId: userId, userName }, client.id);
    } else {
      this.logger.error('No user id was found for socket id');
    }
  }

  @SubscribeMessage('block')
  handleBlockUser(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const blockerId = this.getValueToKey(this.userMap, client.id);
    if (
      this.blockMap.has(userId) &&
      this.blockMap.get(userId).includes(blockerId)
    ) {
      this.logger.error('Already blocked');
    } else {
      this.userService.block(blockerId, userId);
      this.logger.log(`block user: ${userId}(${client.id})`);
      if (this.blockMap.has(userId)) {
        this.blockMap.get(userId).push(blockerId);
      } else {
        this.blockMap.set(userId, [blockerId]);
      }
      client.join('block' + userId);
    }
  }

  @SubscribeMessage('unblock')
  handleUnblockUser(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const unblockerId = this.getValueToKey(this.userMap, client.id);
    if (this.blockMap.has(userId)) {
      this.userService.unblock(unblockerId, userId);
      const index = this.blockMap.get(userId).indexOf(unblockerId);
      if (index !== -1) {
        this.blockMap.get(userId).splice(index, 1);
        this.logger.log(`unblock user: ${userId}(${client.id})`);
        client.leave('block' + userId);
      } else {
        this.logger.error(`User ${userId} has not been blocked`);
      }
    } else {
      this.logger.error(`User ${userId} has not been blocked`);
    }
  }

  @SubscribeMessage('joinDM')
  async handleJoinUser(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    this.userMap.set(userId, client.id);
    const blockedUsers = await this.userService.findAllBlocked(userId);
    blockedUsers.map((user) => client.join('block' + user.id));
    this.logger.log(`join DM: ${client.id} joined DM user${userId}`);
  }

  @SubscribeMessage('kick')
  handleKick(
    @MessageBody() { roomId, userId }: { roomId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`kick user: ${userId} left room ${roomId}`);
    if (client.rooms.has('room/' + roomId)) {
      this.server.to('room/' + roomId).emit('kick', userId, client.id);
    } else {
      this.logger.error('socket has not joined this room');
    }
  }

  @SubscribeMessage('updateRole')
  handleUpdateRole(
    @MessageBody()
    { roomId, userId, role }: { roomId: number; userId: number; role: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`update role user: ${userId} room ${roomId} role ${role}`);
    if (role !== 'ADMINISTRATOR' && role !== 'MEMBER') {
      this.logger.error('invalid role');
      return;
    }
    if (client.rooms.has('room/' + roomId)) {
      this.server
        .to('room/' + roomId)
        .emit('updateRole', role, userId, client.id);
    } else {
      this.logger.error('socket has not joined this room');
    }
    //    if (client.rooms.has('room/' + roomId)) {
    //      this.server
    //        .to(this.userMap.get(userId))
    //        .emit('updateRole', role, client.id);
    //    } else {
    //      this.logger.error('socket has not joined this room');
    //    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`message: ${data}`);
    // Check if a user is in the room
    if (!client.rooms.has(data.roomId.toString())) {
      this.logger.error('socket has not joined this room');
      return;
    }

    // Check if the userId is valid
    if (this.chatService.getUserId(client) !== data.userId) {
      this.logger.error('invalid userId');
      return;
    }

    // Save message to the database
    await this.chatService.createMessage(data);

    // TODO: exclude blocked users

    // Send message to the room
    const room = this.server.to(data.roomId.toString());
    room.emit('message', data);
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    await this.chatService.handleConnection(client);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    await this.chatService.handleDisconnect(client);
  }
}
