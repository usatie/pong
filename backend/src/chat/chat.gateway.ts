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
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  private userMap = new Map<string, string>();

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
    let userId;
    for (const [key, value] of this.userMap.entries()) {
      if (value == client.id) {
        userId = key;
        break;
      }
    }
    const userName = 'hoge'; //TODO mapを増やすか、mapのvalueを増やすか user name取得関数実装
    this.chatService.createDirectMessage(userId, data); //TODO userIdが見つからなかった場合どうする？
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
    this.logger.log(`block user: ${userId}(${client.id})`);
    client.join('block' + userId);
  }

  @SubscribeMessage('unblock')
  handleUnblockUser(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`unblock user: ${userId}(${client.id})`);
    client.leave('block' + userId);
  }

  @SubscribeMessage('joinDM')
  handleJoinUser(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.userMap.set(userId, client.id);
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
