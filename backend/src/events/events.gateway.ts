import { Logger } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';

const POINT_TO_WIN = 3;

type Scores = {
  [key: string]: number;
};

@WebSocketGateway({
  namespace: '/pong',
})
export class EventsGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  private server: Namespace;
  private logger: Logger = new Logger('EventsGateway');
  private lostPoints: Scores = {};

  handleConnection(client: Socket) {
    this.logger.log(`connect: ${client.id} `);
    const gameId = client.handshake.query['game_id'] as string;
    const connectClients = this.server.adapter.rooms.get(gameId);
    if (connectClients && connectClients.size > 1) {
      this.logger.log(`full: ${gameId} ${client.id}`);
      client.emit('log', 'The game is full.');
      return;
    }
    this.logger.log(`join: ${gameId} ${client.id}`);
    client.join(gameId);
    this.broadcastToRooms(client, 'join');
    client.emit('log', 'You joined the game.');
    if (connectClients && connectClients.size == 2) {
      client.emit('log', 'Your friend is already here. You can start.');
    }
    this.lostPoints[client.id] = 0;
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`disconnect: ${client.id} `);
    const roomId = client.handshake.query['game_id'] as string;
    this.broadcastToRoom(client, roomId, 'leave');
    client.leave(roomId);
    delete this.lostPoints[client.id];
  }

  @SubscribeMessage('start')
  async start(
    @MessageBody() data: { vx: number; vy: number },
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    this.logger.log(`start: ${JSON.stringify(data)} ${client.id}`);
    this.broadcastToRooms(client, 'start', data);
    return;
  }

  @SubscribeMessage('left')
  async left(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    this.logger.log(`left: ${client.id}`);
    this.logger.log(client.rooms);
    this.logger.log(this.server.adapter.rooms);
    this.logger.log('---');
    this.broadcastToRooms(client, 'left');
    return;
  }

  @SubscribeMessage('right')
  async right(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    this.broadcastToRooms(client, 'right');
    return;
  }

  @SubscribeMessage('bounce')
  async bounce(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    this.broadcastToRooms(client, 'bounce');
    return;
  }

  @SubscribeMessage('collide')
  async collide(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    this.broadcastToRooms(client, 'collide');
    this.lostPoints[client.id]++;
    if (this.lostPoints[client.id] == POINT_TO_WIN) {
      this.broadcastToRooms(client, 'finish');
      this.broadcastToRooms(client, 'log', 'You won the game.');
      client.emit('finish');
      client.emit('log', 'You lost the game.');
    }
    return;
  }

  broadcastToRooms(socket: Socket, eventName: string, data: any = null) {
    socket.rooms.forEach((room: string) => {
      if (room != socket.id) {
        if (data) socket.to(room).emit(eventName, data);
        else socket.to(room).emit(eventName);
      }
    });
  }

  broadcastToRoom(
    socket: Socket,
    roomId: string,
    eventName: string,
    data: any = null,
  ) {
    if (data) socket.to(roomId).emit(eventName, data);
    else socket.to(roomId).emit(eventName);
  }
}
