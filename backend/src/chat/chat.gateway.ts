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
import { RoomEnteredEvent } from 'src/common/events/room-entered.event';
import { RoomMuteEvent } from 'src/common/events/room-mute.event';
import { RoomUnmuteEvent } from 'src/common/events/room-unmute.event';
import { RoomLeftEvent } from 'src/common/events/room-left.event';
import { RoomUpdateRoleEvent } from 'src/common/events/room-update-role.event';
import { ChatService } from './chat.service';
import { MuteService } from 'src/room/mute/mute.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageEntity } from './entities/message.entity';
import { v4 } from 'uuid';

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
      const blockings = await this.chatService.getUsersBlockedBy(data.userId);
      if (blockings.some((user) => user.id === inviteUser.id)) return;
      const blocked = await this.chatService.getUsersBlockedBy(inviteUser.id);
      if (blocked.some((user) => user.id === data.userId)) return;
      this.server
        .to(invitedUserWsId)
        .emit('invite-pong', { userId: inviteUser.id });
      this.chatService.addInvite(inviteUser.id, data.userId);
    }
  }

  @SubscribeMessage('invite-cancel-pong')
  handleInviteCancelPong(@ConnectedSocket() client: Socket) {
    const inviteUser = this.chatService.getUser(client);
    const invitee = this.chatService.getInvite(inviteUser.id);
    if (!invitee) {
      this.server.to(client.id).emit('error-pong', 'No pending invite found.');
      return;
    }
    const inviteeWsId = this.chatService.getWsFromUserId(invitee)?.id;
    this.chatService.removeInvite(inviteUser.id);
    this.server.to(inviteeWsId).emit('invite-cancel-pong', inviteUser);
  }

  @SubscribeMessage('approve-pong')
  async handleApprovePong(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const approvedUserWsId = this.chatService.getWsFromUserId(data.userId)?.id;
    if (!approvedUserWsId) {
      return;
    } else {
      if (
        this.chatService.getInvite(data.userId) !==
        this.chatService.getUserId(client)
      ) {
        this.server
          .to(client.id)
          .emit('error-pong', 'No pending invite found.');
        return;
      }
      const emitData = { roomId: v4() };
      this.server.to(client.id).emit('match-pong', emitData);
      this.server.to(approvedUserWsId).emit('match-pong', emitData);
      this.chatService.removeInvite(data.userId);
    }
  }

  @SubscribeMessage('deny-pong')
  handleDenyPong(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const deniedUserWsId = this.chatService.getWsFromUserId(data.userId)?.id;
    if (!deniedUserWsId) {
      return;
    } else {
      if (
        this.chatService.getInvite(data.userId) !==
        this.chatService.getUserId(client)
      ) {
        this.server
          .to(client.id)
          .emit('error-pong', 'No pending invite found.');
        return;
      }
      this.server.to(deniedUserWsId).emit('deny-pong');
      this.chatService.removeInvite(data.userId);
    }
  }

  @OnEvent('online-status')
  handleOnlineStatus(event: any) {
    this.chatService.handleOnlineStatus(event);
    this.server.emit('online-status', event);
  }

  @OnEvent('room.enter', { async: true })
  async handleEnter(event: RoomEnteredEvent) {
    await this.chatService.addUserToRoom(event.roomId, event.userId);
    this.server.in(event.roomId.toString()).emit('enter-room', event);
  }

  @OnEvent('room.leave', { async: true })
  async handleLeave(event: RoomLeftEvent) {
    this.server.in(event.roomId.toString()).emit('leave', event);
    await this.chatService.removeUserFromRoom(event);
  }

  @OnEvent('room.update.role', { async: true })
  async handleUpdateRole(event: RoomUpdateRoleEvent) {
    this.server.in(event.roomId.toString()).emit('update-role', event);
  }

  @OnEvent('room.mute', { async: true })
  async handleMute(event: RoomMuteEvent) {
    this.server.in(event.roomId.toString()).emit('mute', event);
  }

  @OnEvent('room.unmute', { async: true })
  async handleUnmute(event: RoomUnmuteEvent) {
    this.server.in(event.roomId.toString()).emit('unmute', event);
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
