import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { User } from '@prisma/client';
import { Namespace, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { HistoryService } from 'src/history/history.service';
import { UserGuardWs } from 'src/user/user.guard-ws';
import { v4 } from 'uuid';

const POINT_TO_WIN = 3;

type Status =
  | 'too-many-players'
  | 'joined-as-player'
  | 'joined-as-viewer'
  | 'ready'
  | 'login-required'
  | 'friend-joined'
  | 'friend-left'
  | 'won'
  | 'lost'
  | 'finish';

type Scores = {
  [key: string]: number;
};

type PlayersInRoom = {
  [socketId: string]: number;
};

type Players = {
  [roomId: string]: PlayersInRoom;
};

const addPlayer = (players: Players, roomId: string, socketId: string) => {
  if (roomId in players) {
    if (players[roomId].length == 0) {
      players[roomId][socketId] = 1;
    } else {
      // Get the first player's number and assign the other number to the new player
      players[roomId][socketId] =
        Object.values(players[roomId])[0] == 1 ? 2 : 1;
    }
  } else {
    players[roomId] = { [socketId]: 0 };
  }
};

const removePlayer = (players: Players, roomId: string, socketId: string) => {
  delete players[roomId][socketId];
};

const isPlayer = (players: Players, roomId: string, socketId: string) => {
  return roomId in players && socketId in players[roomId];
};

const getOpponent = (players: Players, roomId: string, socketId: string) => {
  return Object.keys(players[roomId]).find((id) => id != socketId);
};

@WebSocketGateway({
  namespace: '/pong',
})
export class EventsGateway implements OnGatewayDisconnect {
  constructor(
    private readonly authService: AuthService,
    private readonly historyService: HistoryService,
  ) {}

  @WebSocketServer()
  private server: Namespace;
  private logger: Logger = new Logger('EventsGateway');
  private lostPoints: Scores = {};
  private players: Players = {};
  private users: { [socketId: string]: User } = {};

  private waitingClient: string | null = null;

  async handleConnection(client: Socket) {
    this.logger.log(`connect: ${client.id} `);

    const gameId = client.handshake.query['game_id'] as string | undefined;
    const isPlayer = client.handshake.query['is_player'] == 'true';
    const token = client.request.headers.cookie
      ?.split('; ')
      ?.find((c) => c.startsWith('token='))
      ?.split('=')[1];
    let user;

    if (token) {
      try {
        user = await this.authService.verifyAccessToken(token);
        (client as any).user = user;
        this.users[client.id] = user;
      } catch {}
    }

    // When a user tries to match with someone
    if (!gameId) {
      return;
    }

    // Both of viewers and players join the Socket.io room
    client.join(gameId);

    if (!isPlayer) {
      this.emitUpdateStatus(client, 'joined-as-viewer', {
        players: Object.keys(this.players[gameId] || {}).map(
          (socketId, playerNumber) => ({
            playerNumber,
            user: this.users[socketId],
          }),
        ),
      });
      return;
    }

    if (!user) {
      this.emitUpdateStatus(client, 'login-required');
      return;
    }

    if (this.players[gameId] && Object.keys(this.players[gameId]).length == 2) {
      this.logger.log(`full: ${gameId} ${client.id}`);
      this.emitUpdateStatus(client, 'too-many-players');
      return;
    }
    addPlayer(this.players, gameId, client.id);
    this.emitUpdateStatusToRoomId(client, gameId, 'friend-joined', {
      playerNumber: this.players[gameId][client.id],
      user,
    });
    this.emitUpdateStatus(client, 'joined-as-player');
    const opponent = getOpponent(this.players, gameId, client.id);
    if (opponent) {
      this.emitUpdateStatus(client, 'ready', {
        user: this.users[opponent],
        playerNumber: this.players[gameId][opponent],
      });
    }
    this.lostPoints[client.id] = 0;
    return;
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`disconnect: ${client.id} `);

    const roomId = client.handshake.query['game_id'] as string;
    client.leave(roomId);
    delete this.users[client.id];

    if (isPlayer(this.players, roomId, client.id)) {
      this.emitUpdateStatusToRoomId(client, roomId, 'friend-left', {
        playerNumber: this.players[roomId][client.id],
      });
      removePlayer(this.players, roomId, client.id);
      delete this.lostPoints[client.id];
    }

    if (this.waitingClient == client.id) {
      this.waitingClient = null;
    }
  }

  @UseGuards(UserGuardWs)
  @SubscribeMessage('start')
  async start(
    @MessageBody() data: { vx: number; vy: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const roomId = client.handshake.query['game_id'] as string;
    if (!isPlayer(this.players, roomId, client.id)) return;

    this.logger.log(`start: ${JSON.stringify(data)} ${client.id}`);
    this.broadcastToRooms(client, 'start', data);
    return;
  }

  @UseGuards(UserGuardWs)
  @SubscribeMessage('left')
  async left(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const roomId = client.handshake.query['game_id'] as string;
    if (!isPlayer(this.players, roomId, client.id)) return;

    this.logger.log(`left: ${client.id}`);

    this.broadcastToRooms(client, 'left', {
      playerNumber: this.players[roomId][client.id],
    });
    return;
  }

  @UseGuards(UserGuardWs)
  @SubscribeMessage('right')
  async right(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const roomId = client.handshake.query['game_id'] as string;
    if (!isPlayer(this.players, roomId, client.id)) return;

    this.broadcastToRooms(client, 'right', {
      playerNumber: this.players[roomId][client.id],
    });
    return;
  }

  @UseGuards(UserGuardWs)
  @SubscribeMessage('bounce')
  async bounce(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const roomId = client.handshake.query['game_id'] as string;
    if (!isPlayer(this.players, roomId, client.id)) return;

    this.broadcastToRooms(client, 'bounce', {
      playerNumber: this.players[roomId][client.id],
    });
    return;
  }

  @UseGuards(UserGuardWs)
  @SubscribeMessage('collide')
  async collide(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const roomId = client.handshake.query['game_id'] as string;
    if (!isPlayer(this.players, roomId, client.id)) return;

    this.broadcastToRooms(client, 'collide', {
      playerNumber: this.players[roomId][client.id],
    });
    this.lostPoints[client.id]++;
    if (this.lostPoints[client.id] == POINT_TO_WIN) {
      this.broadcastToRooms(client, 'finish');
      client.emit('finish');

      const opponent = getOpponent(this.players, roomId, client.id);
      // TODO: handle invalid game. The opponent must have been disconnected.
      if (!opponent) {
        this.logger.error('opponent not found');
        return;
      }
      this.emitUpdateStatus(client, 'lost');
      this.emitUpdateStatusToRoomId(client, opponent, 'won');
      this.emitUpdateStatusToRoomId(client, roomId, 'finish');

      await this.createHistory(client);
    }
    return;
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

  @SubscribeMessage('list-games')
  async listGames(@ConnectedSocket() client: Socket) {
    this.logger.log(`list-games: ${client.id}`);
    const games = Object.keys(this.players)
      .filter((roomId) => Object.keys(this.players[roomId]).length == 2)
      .map((roomId) => {
        const socketIds = Object.keys(this.players[roomId]);
        return {
          roomId,
          players: [this.users[socketIds[0]], this.users[socketIds[1]]],
        };
      });
    return games;
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

  emitUpdateStatus(socket: Socket, status: Status, payload: any = null) {
    socket.emit('update-status', { status, payload });
  }

  emitUpdateStatusToRoomId(
    socket: Socket,
    roomId: string,
    status: Status,
    payload: any = null,
  ) {
    socket.to(roomId).emit('update-status', { status, payload });
  }

  async createHistory(socket: Socket) {
    const roomId = socket.handshake.query['game_id'] as string;
    const loserSocketId = socket.id;
    const loserUserId = this.users[loserSocketId].id;

    const winnerSocketId = Object.keys(this.players[roomId]).find(
      (sockedId) => sockedId != loserSocketId,
    );

    // TODO: handle invalid game. The opponent must have been disconnected.
    if (!winnerSocketId) return;

    const winnerUserId = this.users[winnerSocketId].id;

    return await this.historyService.create({
      winner: {
        userId: winnerUserId,
        score: this.lostPoints[loserSocketId],
      },
      loser: {
        userId: loserUserId,
        score: this.lostPoints[winnerSocketId],
      },
    });
  }
}
