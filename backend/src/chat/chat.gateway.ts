import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

type MessageReceived = {
  userName: string;
  text: string;
};

type PrivateReceived = {
  from: string;
  to: string;
  userName: string;
  text: string;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/socket.io/chat/',
  namespace: 'chat',
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  @SubscribeMessage('newMessage')
  chatMessageToRoom(
    @MessageBody() data: MessageReceived,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log('message received');
    this.logger.log(data);
    const rooms = [...client.rooms];
    this.logger.log('rooms', rooms);
    this.server.to(rooms[1]).emit('sendToClient', data, client.id);
  }

  @SubscribeMessage('privateMessage')
  privateMessageToUser(
    @MessageBody() data: PrivateReceived,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log('private message received');
    this.logger.log(data);
    this.server.to(data.from).to(data.to).emit('sendToUser', data, client.id);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`join room: ${client.id} joined room ${roomId}`);
    client.join(roomId);
  }

  @SubscribeMessage('joinDM')
  handleJoinUser(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`join DM: ${client.id} joined DM ${userId}`);
    client.join(userId);
  }

  @SubscribeMessage('leaveDM')
  handleLeaveUser(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`leave DM: ${client.id} left DM ${userId}`);
    client.leave(userId);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`leave room: ${client.id} left room ${roomId}`);
    client.leave(roomId);
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
