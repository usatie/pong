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

type RoomChat = {
  userName: string;
  text: string;
  roomId: string;
};

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
})
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  private userMap = new Map<string, string>();
  private blockMap = new Map<number, number[]>();

  private getValueToKey = (map, findValue) => {
    for (const [key, value] of map.entries()) {
      if (value == findValue) {
        return key;
      }
    }
    return '';
  };

  @SubscribeMessage('newMessage')
  chatMessageToRoom(
    @MessageBody() data: RoomChat,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log('message received');
    this.logger.log(data);
    if (client.rooms.has('room/' + data.roomId)) {
      this.server
        .to('room/' + data.roomId)
        .emit('sendToClient', data, client.id);
    } else {
      this.logger.error('socket has not joined this room');
    }
  }

  @SubscribeMessage('privateMessage')
  privateMessageToUser(
    @MessageBody() data: CreateDirectMessageDto,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log('private message received');
    this.logger.log(data);

    const userId = this.getValueToKey(this.userMap, client.id);
    let isBlock = false;
    if (this.blockMap.has(parseInt(userId))) {
      const blockers = this.blockMap.get(parseInt(userId));
      isBlock = blockers.includes(data.receiverId);
      console.log(isBlock);
    }
    const userName = 'hoge'; //TODO mapを増やすか、mapのvalueを増やすか user name取得関数実装
    this.chatService.createDirectMessage(+userId, data, isBlock); //TODO userIdが見つからなかった場合どうする？
    this.server
      .except('block' + userId)
      .to(client.id)
      .to(this.userMap.get(data.receiverId.toString())) //TODO receiverIdが見つからなかった時のvalidation
      .emit('sendToUser', { ...data, from: userId, userName }, client.id);
  }

  @SubscribeMessage('block')
  handleBlockUser(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const blockerId = this.getValueToKey(this.userMap, client.id);
    if (
      this.blockMap.has(parseInt(userId)) &&
      this.blockMap.get(parseInt(userId)).includes(parseInt(blockerId))
    ) {
      this.logger.error('Already blocked');
    } else {
      this.userService.block(parseInt(blockerId), parseInt(userId));
      this.logger.log(`block user: ${userId}(${client.id})`);
      if (this.blockMap.has(parseInt(userId))) {
        this.blockMap.get(parseInt(userId)).push(parseInt(blockerId));
      } else {
        this.blockMap.set(parseInt(userId), [parseInt(blockerId)]);
      }
      client.join('block' + userId);
    }
  }

  @SubscribeMessage('unblock')
  handleUnblockUser(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const unblockerId = this.getValueToKey(this.userMap, client.id);
    if (this.blockMap.has(parseInt(userId))) {
      this.userService.unblock(parseInt(unblockerId), parseInt(userId));
      const index = this.blockMap.get(parseInt(userId)).indexOf(unblockerId);
      if (index !== -1) {
        this.blockMap.get(parseInt(userId)).splice(index, 1);
        this.logger.log(`unblock user: ${userId}(${client.id})`);
        client.leave('block' + userId);
      } else {
        this.logger.error(`User ${userId} has not been blocked`);
      }
    }
  }

  @SubscribeMessage('joinDM')
  async handleJoinUser(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.userMap.set(userId, client.id);
    const blockedUsers = await this.userService.findAllBlocked(
      parseInt(userId),
    );
    console.log('block list', blockedUsers);
    blockedUsers.map((user) => client.join('block' + user.id));
    this.logger.log(`join DM: ${client.id} joined DM user${userId}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`join room: ${client.id} joined room ${roomId}`);
    client.join('room/' + roomId);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`leave room: ${client.id} left room ${roomId}`);
    client.leave('room/' + roomId);
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
