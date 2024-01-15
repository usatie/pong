import { INestApplication } from '@nestjs/common';
import { LoginDto } from 'src/auth/dto/login.dto';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { EnterRoomDto } from 'src/room/dto/enter-room.dto';
import { UpdateUserOnRoomDto } from 'src/room/dto/update-UserOnRoom.dto';
import { UpdateRoomDto } from 'src/room/dto/update-room.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import * as request from 'supertest';

export class TestApp {
  constructor(private readonly app: INestApplication) {}

  close = () => this.app.close();

  /* Auth API */
  login = (login: LoginDto) =>
    request(this.app.getHttpServer()).post('/auth/login').send(login);

  generateTwoFactorAuthenticationSecret = (accessToken: string) =>
    request(this.app.getHttpServer())
      .post('/auth/2fa/generate')
      .set('Authorization', `Bearer ${accessToken}`);

  enableTwoFactorAuthentication = (code: string, accessToken: string) =>
    request(this.app.getHttpServer())
      .post('/auth/2fa/enable')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ code });

  twoFactorAuthenticate = (code: string, accessToken: string) =>
    request(this.app.getHttpServer())
      .post('/auth/2fa/authenticate')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ code });

  /* Avatar API (Public) */
  getAvatar = (filename: string) =>
    request(this.app.getHttpServer()).get(`/avatar/${filename}`);

  /* Avatar API (Private) */
  uploadAvatar = (userId: number, filepath: string, accessToken: string) =>
    request(this.app.getHttpServer())
      .post(`/user/${userId}/avatar`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('avatar', filepath);

  deleteAvatar = (userId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .delete(`/user/${userId}/avatar`)
      .set('Authorization', `Bearer ${accessToken}`);

  /* Room API (Public) */
  getRooms = (accessToken: string) =>
    request(this.app.getHttpServer())
      .get(`/room`)
      .set('Authorization', `Bearer ${accessToken}`);

  /* Room API (Private) */
  createRoom = (createRoomDto: CreateRoomDto, accessToken: string) =>
    request(this.app.getHttpServer())
      .post('/room')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createRoomDto);

  enterRoom = (
    roomId: number,
    accessToken: string,
    enterRoomDto: EnterRoomDto = {},
  ) =>
    request(this.app.getHttpServer())
      .post(`/room/${roomId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(enterRoomDto);

  inviteRoom = (roomId: number, userId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .post(`/room/${roomId}/invite/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

  leaveRoom = (roomId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .delete(`/room/${roomId}/leave`)
      .set('Authorization', `Bearer ${accessToken}`);

  kickFromRoom = (roomId: number, userId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .delete(`/room/${roomId}/kick/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

  getRoom = (id: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .get(`/room/${id}`)
      .set('Authorization', `Bearer ${accessToken}`);

  getDirectRoom = (userId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .get(`/room/direct/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

  updateRoom = (id: number, dto: UpdateRoomDto, accessToken: string) =>
    request(this.app.getHttpServer())
      .patch(`/room/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto);

  deleteRoom = (roomId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .delete(`/room/${roomId}`)
      .set('Authorization', `Bearer ${accessToken}`);

  getUserOnRoom = (roomId: number, userId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .get(`/room/${roomId}/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

  updateUserOnRoom = (
    roomId: number,
    userId: number,
    dto: UpdateUserOnRoomDto,
    accessToken: string,
  ) =>
    request(this.app.getHttpServer())
      .patch(`/room/${roomId}/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto);

  banUser = (roomId: number, userId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .put(`/room/${roomId}/bans/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

  unbanUser = (roomId: number, userId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .delete(`/room/${roomId}/bans/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

  getBannedUsers = (roomId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .get(`/room/${roomId}/bans`)
      .set('Authorization', `Bearer ${accessToken}`);

  muteUser = (
    roomId: number,
    userId: number,
    duration: number,
    accessToken: string,
  ) =>
    request(this.app.getHttpServer())
      .put(`/room/${roomId}/mutes/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ duration });

  unmuteUser = (roomId: number, userId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .delete(`/room/${roomId}/mutes/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

  getMessagesInRoom = (roomId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .get(`/room/${roomId}/messages`)
      .set('Authorization', `Bearer ${accessToken}`);

  /* Match API */
  createMatch = (
    winnerId: number,
    winnerScore: number,
    loserId: number,
    loserScore: number,
  ) =>
    request(this.app.getHttpServer())
      .post('/history')
      .send({
        winner: {
          userId: winnerId,
          score: winnerScore,
        },
        loser: {
          userId: loserId,
          score: loserScore,
        },
      });

  getHistory = (userId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .get(`/user/${userId}/history`)
      .set('Authorization', `Bearer ${accessToken}`);

  /* User API (Public) */
  getUsers = () => request(this.app.getHttpServer()).get('/user');

  createUser = (user: CreateUserDto) =>
    request(this.app.getHttpServer()).post('/user').send(user);

  /* User API (Private) */
  getUser = (id: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .get(`/user/${id}`)
      .set('Authorization', `Bearer ${accessToken}`);

  getMe = (accessToken: string) =>
    request(this.app.getHttpServer())
      .get(`/user/me`)
      .set('Authorization', `Bearer ${accessToken}`);

  updateUser = (id: number, user: UpdateUserDto, accessToken: string) =>
    request(this.app.getHttpServer())
      .patch(`/user/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(user);

  deleteUser = (id: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .delete(`/user/${id}`)
      .set('Authorization', `Bearer ${accessToken}`);

  /* Friend API (Private) */
  sendFriendRequest = (
    userId: number,
    recipientId: number,
    accessToken: string,
  ) =>
    request(this.app.getHttpServer())
      .post(`/user/${userId}/friend-request/${recipientId}`)
      .set('Authorization', `Bearer ${accessToken}`);

  getFriendRequests = (userId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .get(`/user/${userId}/friend-request`)
      .set('Authorization', `Bearer ${accessToken}`);

  cancelFriendRequest = (
    userId: number,
    recipientId: number,
    accessToken: string,
  ) =>
    request(this.app.getHttpServer())
      .patch(`/user/${userId}/friend-request/${recipientId}/cancel`)
      .set('Authorization', `Bearer ${accessToken}`);

  acceptFriendRequest = (
    userId: number,
    requesterId: number,
    accessToken: string,
  ) =>
    request(this.app.getHttpServer())
      .patch(`/user/${userId}/friend-request/${requesterId}/accept`)
      .set('Authorization', `Bearer ${accessToken}`);

  rejectFriendRequest = (
    userId: number,
    requesterId: number,
    accessToken: string,
  ) =>
    request(this.app.getHttpServer())
      .patch(`/user/${userId}/friend-request/${requesterId}/reject`)
      .set('Authorization', `Bearer ${accessToken}`);

  unfriend = (userId: number, friendId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .post(`/user/${userId}/unfriend`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ friendId });

  getBlockingUsers = (userId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .get(`/user/${userId}/block`)
      .set('Authorization', `Bearer ${accessToken}`);

  blockUser = (userId: number, blockedUserId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .post(`/user/${userId}/block`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ blockedUserId });

  unblockUser = (userId: number, blockedUserId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .post(`/user/${userId}/unblock`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ blockedUserId });

  /* Friend API (Public) */
  getFriends = (userId: number, accessToken: string) =>
    request(this.app.getHttpServer())
      .get(`/user/${userId}/friend`)
      .set('Authorization', `Bearer ${accessToken}`);

  /* Utility */
  createAndLoginUser = async (
    dto: CreateUserDto,
  ): Promise<UserEntityWithAccessToken> => {
    const res = await this.createUser(dto).expect(201);
    const loginDto: LoginDto = {
      email: dto.email,
      password: dto.password,
    };
    const res2 = await this.login(loginDto).expect(201);
    const user = res.body;
    user.accessToken = res2.body.accessToken;
    return user;
  };
}

export type UserEntityWithAccessToken = UserEntity & { accessToken: string };
