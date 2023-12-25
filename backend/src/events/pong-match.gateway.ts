import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserGuardWs } from 'src/user/user.guard-ws';
import { v4 } from 'uuid';

@WebSocketGateway({
  namespace: '/pong-match',
})
export class PongMatchGateway implements OnGatewayDisconnect {
  constructor(private readonly authService: AuthService) {}

  @WebSocketServer()
  private server: Namespace;
  private logger: Logger = new Logger('PongMatchGateway');
  private waitingClient: string | null = null;

  async handleConnection(client: Socket) {
    this.logger.log(`connect: ${client.id} `);
    try {
      const token = client.request.headers.cookie?.split('token=')[1];
      if (!token) return;
      const user = await this.authService.verifyAccessToken(token);
      (client as any).user = user;
    } catch {}
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`disconnect: ${client.id} `);
    if (this.waitingClient == client.id) {
      this.waitingClient = null;
    }
  }

  @UseGuards(UserGuardWs)
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
