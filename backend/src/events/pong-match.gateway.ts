import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { v4 } from 'uuid';

@WebSocketGateway({
  namespace: '/pong-match',
})
export class PongMatchGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  private server: Namespace;
  private logger: Logger = new Logger('PongMatchGateway');
  private waitingClient: string | null = null;

  handleConnection(client: Socket) {
    this.logger.log(`connect: ${client.id} `);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`disconnect: ${client.id} `);
    if (this.waitingClient == client.id) {
      this.waitingClient = null;
    }
  }

  @SubscribeMessage('request')
  async request(@ConnectedSocket() client: Socket) {
    this.logger.log(`request: ${client.id}`);
    if (this.waitingClient) {
      const roomId = v4();
      this.server.to(client.id).emit('matched', roomId);
      this.server.to(this.waitingClient).emit('matched', roomId);
      this.waitingClient = null;
      return;
    }
    this.waitingClient = client.id;
    return;
  }
}
