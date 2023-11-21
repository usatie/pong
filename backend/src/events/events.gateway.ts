import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  started: boolean = false;

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
    const connectClients = this.server.of('/').adapter.rooms.get(data);
    if (connectClients && connectClients.size > 1) {
      console.log('too many clients');
      return 'too many clients';
    }
    client.join(data);
    console.log(
      `joined: ${client.id} ${
        this.server.of('/').adapter.rooms.get(data).size
      }`,
    );
    return data;
  }

  @SubscribeMessage('start')
  async start(
    @MessageBody() data: { roomId: string; vx: number; vy: number },
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    console.log(`start: ${JSON.stringify(data)} ${client.id}`);
    client.to(data.roomId).emit('start', { vx: data.vx, vy: data.vy });
    return;
  }

  @SubscribeMessage('left')
  async left(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    client.to(data).emit('left');
    return;
  }

  @SubscribeMessage('right')
  async right(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    client.to(data).emit('right');
    return;
  }

  @SubscribeMessage('bounce')
  async bounce(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    client.to(data).emit('bounce');
    return;
  }

  @SubscribeMessage('collide')
  async collide(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    client.to(data).emit('collide');
    return;
  }
}
