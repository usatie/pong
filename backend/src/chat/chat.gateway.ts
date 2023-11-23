import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

type MessageRecieved = {
  userName: string;
  text: string;
};

type privateRecieved = {
  from: string;
  to: string;
  userName: string;
  text: string;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  @SubscribeMessage('newMessage')
  chatMessageToRoom(
    @MessageBody() data: MessageRecieved,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log('message recieved');
    this.logger.log(data);
    const rooms = [...client.rooms];
    this.logger.log('rooms', rooms);
    this.server.to(rooms[1]).emit('sendToClient', data, client.id);
  }

  @SubscribeMessage('privateMessage')
  privateMessageToUser(
    @MessageBody() data: privateRecieved,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log('private message recieved');
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
    this.logger.log(`join room: ${client.id} joined room ${userId}`);
    client.join(userId);
  }

  @SubscribeMessage('leaveDM')
  handleLeaveUser(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`leave room: ${client.id} leaved room ${userId}`);
    client.leave(userId);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`leave room: ${client.id} leaved room ${roomId}`);
    client.leave(roomId);
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
