import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/pong',
})
export class EventsGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Namespace;
  started: boolean = false;

  handleConnect(client: Socket) {
    console.log(`connect: ${client.id} `);
  }

  handleDisconnect(client: Socket) {
    this.started = false;
    console.log(`disconnect: ${client.id} `);
    this.server.emit('opponentLeft');
  }

  @SubscribeMessage('join')
  async join(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    console.log(`join: ${JSON.stringify(data)} ${client.id}`);
    const connectClients = this.server.adapter.rooms.get(data);
    if (connectClients && connectClients.size > 1) {
      console.log('too many clients');
      return 'too many clients';
    }
    client.join(data);
    console.log(client.rooms);
    console.log(
      `joined: ${client.id} ${this.server.adapter.rooms.get(data).size}`,
    );
    return data;
  }

  @SubscribeMessage('start')
  async start(
    @MessageBody() data: { vx: number; vy: number },
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    console.log(`start: ${JSON.stringify(data)} ${client.id}`);
    this.broadcastToRooms(client, 'start', data);
    return;
  }

  @SubscribeMessage('left')
  async left(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
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
}
