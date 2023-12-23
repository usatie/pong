import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';

const POINT_TO_WIN = 3;

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

@WebSocketGateway({
  namespace: '/pong',
})
export class EventsGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  private server: Namespace;
  private logger: Logger = new Logger('EventsGateway');
  private lostPoints: Scores = {};
  private players: Players = {};

  // Please do not rely on client.handshake.query in handleConnection and handleDisconnect
  // as we use one connection globally in client
  handleConnection(client: Socket) {
    this.logger.log(`connect: ${client.id} `);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`disconnect: ${client.id} `);
  }

  @SubscribeMessage('join')
  async join(
    @MessageBody() { gameId, isPlayer }: { gameId: string; isPlayer: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('----JOIN----');
    console.log('players: ', this.players);

    this.logger.log(`join: ${client.id} `);
    // Both of viewers and players join the Socket.io room
    client.join(gameId);

    if (!isPlayer) {
      return;
    }

    console.log('players: ', this.players[gameId]);
    if (this.players[gameId] && Object.keys(this.players[gameId]).length == 2) {
      console.log('full', client.id);
      this.logger.log(`full: ${gameId} ${client.id}`);
      client.emit('log', 'The game is full. You joined as a viewer.');
      return;
    }
    addPlayer(this.players, gameId, client.id);
    this.broadcastToRooms(client, 'join');
    client.emit('log', 'You joined as a player.');
    if (Object.keys(this.players[gameId]).length == 2) {
      client.emit('log', 'Your friend is already here. You can start.');
    }
    this.lostPoints[client.id] = 0;
    console.log('players: ', this.players[gameId]);
    console.log('----END----');
    return;
  }

  @SubscribeMessage('leave')
  async leave(
    @ConnectedSocket() client: Socket,
    @MessageBody() { gameId }: { gameId: string },
  ) {
    console.log('----LEAVE----');
    console.log(this.players);
    this.logger.log(`leave: ${client.id} `);
    client.leave(gameId);

    if (isPlayer(this.players, gameId, client.id)) {
      console.log('did leave');
      this.broadcastToRoom(client, gameId, 'leave');
      removePlayer(this.players, gameId, client.id);
      delete this.lostPoints[client.id];
      console.log('players: ', this.players[gameId]);
    }
    console.log('----END----');
  }

  @SubscribeMessage('start')
  async start(
    @MessageBody() data: { vx: number; vy: number },
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    const roomId = this.getRoom(client);
    if (!isPlayer(this.players, roomId, client.id)) return;

    this.logger.log(`start: ${JSON.stringify(data)} ${client.id}`);
    this.broadcastToRooms(client, 'start', data);
    return;
  }

  @SubscribeMessage('left')
  async left(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    const roomId = this.getRoom(client);
    if (!isPlayer(this.players, roomId, client.id)) return;

    this.logger.log(`left: ${client.id}`);

    this.broadcastToRooms(client, 'left', {
      playerNumber: this.players[roomId][client.id],
    });
    return;
  }

  @SubscribeMessage('right')
  async right(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    const roomId = this.getRoom(client);
    if (!isPlayer(this.players, roomId, client.id)) return;

    this.broadcastToRooms(client, 'right', {
      playerNumber: this.players[roomId][client.id],
    });
    return;
  }

  @SubscribeMessage('bounce')
  async bounce(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    const roomId = this.getRoom(client);
    if (!isPlayer(this.players, roomId, client.id)) return;

    this.broadcastToRooms(client, 'bounce', {
      playerNumber: this.players[roomId][client.id],
    });
    return;
  }

  @SubscribeMessage('collide')
  async collide(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    const roomId = this.getRoom(client);
    if (!isPlayer(this.players, roomId, client.id)) return;

    this.broadcastToRooms(client, 'collide', {
      playerNumber: this.players[roomId][client.id],
    });
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

  getRoom(socket: Socket) {
    const roomIds = Object.keys(socket.rooms).filter(
      (item) => item != socket.id,
    );
    if (roomIds.length != 1) {
      throw new WsException(
        'should not reach: use one room per socket and call this after joining a room',
      );
    }
    return roomIds[0];
  }
}
