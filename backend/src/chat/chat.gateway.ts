import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomLeftEvent } from 'src/common/events/room-left.event';
import { ChatService } from './chat.service';
import { MuteService } from 'src/room/mute/mute.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageEntity } from './entities/message.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
  cookie: true,
})
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
    private readonly muteService: MuteService,
  ) {}

  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`message: ${data}`);
    // Check if a user is in the room
    if (!client.rooms.has(data.roomId.toString())) {
      this.logger.error('socket has not joined this room');
      return;
    }

    // Check if the userId is valid
    if (this.chatService.getUserId(client) !== data.userId) {
      this.logger.error('invalid userId');
      return;
    }

    const MutedUsers = await this.muteService.findAll(data.roomId);
    if (MutedUsers.some((user) => user.id === data.userId)) {
      return;
    }

    // Save message to the database
    await this.chatService.createMessage(data);

    // Send message to the room
    const room = this.server
      .to(data.roomId.toString())
      .except('block' + data.userId);
    room.emit(
      'message',
      new MessageEntity(data, this.chatService.getUser(client)),
    );
  }

  @SubscribeMessage('invite-pong')
  async handleInvitePong(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const inviteUser = this.chatService.getUser(client);
    const invitedUserWsId = this.chatService.getWsFromUserId(data.userId)?.id;
    if (!invitedUserWsId) {
      return;
    } else {
      this.server
        .to(invitedUserWsId)
        .emit('invite-pong', { userId: inviteUser.id });
    }
  }

  @OnEvent('room.leave', { async: true })
  async handleLeave(event: RoomLeftEvent) {
    this.server.in(event.roomId.toString()).emit('leave', event);
    await this.chatService.removeUserFromRoom(event);
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    await this.chatService.handleConnection(client);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    await this.chatService.handleDisconnect(client);
  }
}
