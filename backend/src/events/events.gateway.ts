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
  clientConnected: number = 0;
  started: boolean = false;

  handleDisconnect(client: Socket) {
    this.clientConnected--;
    this.started = false;
    console.log(`disconnect: ${client.id} (${this.clientConnected})`);
    this.server.emit('opponentLeft');
  }

  @SubscribeMessage('join')
  async join(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    if (this.clientConnected == 2) {
      console.log('full');
      return 'full';
    }
    this.clientConnected++;
    console.log(
      `join: ${JSON.stringify(data)} ${client.id} (${this.clientConnected})`,
    );
    return data;
  }

  @SubscribeMessage('start')
  async start(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    console.log(`start: ${JSON.stringify(data)} ${client.id}`);
    client.broadcast.emit('start', data);
    return data;
  }

  @SubscribeMessage('left')
  async keydown(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    client.broadcast.emit('left');
    return;
  }

  @SubscribeMessage('right')
  async keyup(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    client.broadcast.emit('right');
    return;
  }
}
