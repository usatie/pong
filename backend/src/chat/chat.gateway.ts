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
import { RoomDeletedEvent } from 'src/common/events/room-deleted.event';
import { RoomEnteredEvent } from 'src/common/events/room-entered.event';
import { RoomLeftEvent } from 'src/common/events/room-left.event';
import { RoomMuteEvent } from 'src/common/events/room-mute.event';
import { RoomUnmuteEvent } from 'src/common/events/room-unmute.event';
import { RoomUpdateRoleEvent } from 'src/common/events/room-update-role.event';
import { MuteService } from 'src/room/mute/mute.service';
import { v4 } from 'uuid';
import { ChatService, UserStatus } from './chat.service';
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
    const user = this.chatService.getUser(client);
    if (!user) {
      this.logger.error('invalid user');
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
    room.emit('message', new MessageEntity(data, user));
  }

  @SubscribeMessage('request-match')
  async handleRequestMatch(
    @MessageBody() data: { requestedUserId: number },
    @ConnectedSocket() client: Socket,
  ) {
    // Check if the requesting user is valid
    const requestingUser = this.chatService.getUser(client);
    if (!requestingUser) {
      this.logger.error('invalid requesting user');
      return;
    }
    // Check if the requested user is connected
    const requestedUserWsId = this.chatService.getWsFromUserId(
      data.requestedUserId,
    )?.id;
    if (!requestedUserWsId) {
      this.logger.error('invalid requested user');
      return;
    }
    // Check if the requesting user is blocked by the requested user
    const blockings = await this.chatService.getUsersBlockedBy(
      data.requestedUserId,
    );
    if (blockings.some((user) => user.id === requestingUser.id)) return;
    // Check if the requested user is blocked by the requesting user
    const blocked = await this.chatService.getUsersBlockedBy(requestingUser.id);
    if (blocked.some((user) => user.id === data.requestedUserId)) return;
    // Send the request
    this.server
      .to(requestedUserWsId)
      .emit('request-match', { requestingUserId: requestingUser.id });
    // Save the request
    this.chatService.addMatchRequest(requestingUser.id, data.requestedUserId);
  }

  @SubscribeMessage('cancel-match-request')
  handleCancelMatchRequest(@ConnectedSocket() client: Socket) {
    // Check if the requesting user is valid
    const requestingUser = this.chatService.getUser(client);
    if (!requestingUser) {
      this.logger.error('invalid requesting user');
      return;
    }
    // Check if the request exists
    const requestedUser = this.chatService.getMatchRequest(requestingUser.id);
    if (!requestedUser) {
      this.logger.error('invalid requested user');
      this.server
        .to(client.id)
        .emit('invalid-request', 'No pending invite found.');
      return;
    }
    // Cancel the request
    this.chatService.removeMatchRequest(requestingUser.id);
    // Check if the requested user is connected
    const requestedUserWsId =
      this.chatService.getWsFromUserId(requestedUser)?.id;
    if (!requestedUserWsId) {
      return;
    }
    // Send the cancel request
    this.server
      .to(requestedUserWsId)
      .emit('cancelled-match-request', requestingUser);
  }

  @SubscribeMessage('approve-match-request')
  async handleApproveMatchRequest(
    @MessageBody() data: { approvedUserId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const approvedUserWsId = this.chatService.getWsFromUserId(
      data.approvedUserId,
    )?.id;
    if (!approvedUserWsId) {
      return;
    } else {
      if (
        this.chatService.getMatchRequest(data.approvedUserId) !==
        this.chatService.getUserId(client)
      ) {
        this.server
          .to(client.id)
          .emit('invalid-request', 'No pending invite found.');
        return;
      }
      const emitData = { roomId: v4() };
      this.server.to(client.id).emit('approved-match-request', emitData);
      this.server.to(approvedUserWsId).emit('approved-match-request', emitData);
      this.chatService.removeMatchRequest(data.approvedUserId);
    }
  }

  @SubscribeMessage('deny-match-request')
  handleDenyMatchRequest(
    @MessageBody() data: { deniedUserId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const deniedUserWsId = this.chatService.getWsFromUserId(data.deniedUserId)
      ?.id;
    if (!deniedUserWsId) {
      return;
    } else {
      if (
        this.chatService.getMatchRequest(data.deniedUserId) !==
        this.chatService.getUserId(client)
      ) {
        this.server
          .to(client.id)
          .emit('invalid-request', 'No pending invite found.');
        return;
      }
      this.server.to(deniedUserWsId).emit('denied-match-request');
      this.chatService.removeMatchRequest(data.deniedUserId);
    }
  }

  @OnEvent('online-status')
  handleChangeOnlineStatus(
    event: {
      userId: number;
      status: UserStatus;
    }[],
  ) {
    this.chatService.handleChangeOnlineStatus(event);
    this.server.emit('online-status', event);
  }

  @OnEvent('room.delete', { async: true })
  async handleDelete(event: RoomDeletedEvent) {
    if (event.accessLevel === 'PUBLIC' || event.accessLevel === 'PROTECTED') {
      this.server.emit('delete-room', { roomId: event.roomId });
    } else {
      this.server
        .in(event.roomId.toString())
        .emit('delete-room', { roomId: event.roomId });
    }
    this.chatService.deleteSocketRoom(event);
  }

  @OnEvent('room.enter', { async: true })
  async handleEnter(event: RoomEnteredEvent) {
    this.chatService.addUserToRoom(event.roomId, event.userId);
    this.server.in(event.roomId.toString()).emit('enter-room', event);
  }

  @OnEvent('room.leave', { async: true })
  async handleLeave(event: RoomLeftEvent) {
    this.server.in(event.roomId.toString()).emit('leave-room', event);
    this.chatService.removeUserFromRoom(event.roomId, event.userId);
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
