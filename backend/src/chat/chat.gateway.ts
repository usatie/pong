import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

type RoomChat = {
  userName: string;
  text: string;
  roomId: string;
};

type PrivateMessage = {
  from: string;
  to: string;
  userName: string;
  text: string;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/chat/',
  namespace: 'chat',
})
export class ChatGateway {
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
    if (client.rooms.has('room' + data.roomId)) {
      this.server
        .to('room' + data.roomId)
        .emit('sendToClient', data, client.id);
    } else {
      this.logger.error('socket has not joined this room');
    }
  }

  @SubscribeMessage('privateMessage')
  privateMessageToUser(
    @MessageBody() data: PrivateMessage,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log('private message received');
    this.logger.log(data);
    this.server
      .except('block' + data.from)
      .to(this.userMap.get(data.from))
      .to(this.userMap.get(data.to))
      .emit('sendToUser', data, client.id);
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
    client.join('room' + roomId);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`leave room: ${client.id} left room ${roomId}`);
    client.leave('room' + roomId);
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
