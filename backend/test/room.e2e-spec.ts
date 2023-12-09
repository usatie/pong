import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { RoomEntity } from 'src/room/entities/room.entity';
import { UpdateRoomDto } from 'src/room/dto/update-room.dto';
import { initializeApp } from './utils/initialize';
import { LoginDto } from 'src/auth/dto/login.dto';
import {
  expectRoom,
  expectRoomWithUsers,
  expectUserOnRoom,
} from './utils/matcher';
import { constants } from './constants';

describe('RoomController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await initializeApp();
  });
  afterAll(() => app.close());

  const users = [
    constants.user.owner,
    constants.user.admin,
    constants.user.member,
    constants.user.notMember,
  ];
  const usersExceptOwner = [
    constants.user.notMember,
    constants.user.admin,
    constants.user.member,
  ];
  const roomMembers = [
    constants.user.owner,
    constants.user.admin,
    constants.user.member,
  ];

  /* Room API */
  const createRoom = (accessToken: string, createRoomDto: CreateRoomDto) =>
    request(app.getHttpServer())
      .post('/room')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createRoomDto);

  const enterRoom = (accessToken: string, room: RoomEntity) =>
    request(app.getHttpServer())
      .post(`/room/${room.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

  const getRoom = (id: number, accessToken: string) =>
    request(app.getHttpServer())
      .get(`/room/${id}`)
      .set('Authorization', `Bearer ${accessToken}`);

  const getRooms = () => request(app.getHttpServer()).get(`/room`);

  const updateRoom = (id: number, accessToken: string, dto: UpdateRoomDto) =>
    request(app.getHttpServer())
      .patch(`/room/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto);

  const deleteRoom = (roomId: number, accessToken: string) =>
    request(app.getHttpServer())
      .delete(`/room/${roomId}`)
      .set('Authorization', `Bearer ${accessToken}`);

  /* User API */
  const createUser = (dto: CreateUserDto) =>
    request(app.getHttpServer()).post('/user').send(dto);

  const deleteUser = (userId: number, accessToken: string) =>
    request(app.getHttpServer())
      .delete(`/user/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

  /* Auth API */
  const login = (dto: LoginDto) =>
    request(app.getHttpServer()).post('/auth/login').send(dto);

  /* Utility functions for test */
  const getAccessToken = (dto: LoginDto): Promise<string> =>
    login(dto).then((res) => res.body.accessToken);

  const getUserIdFromAccessToken = (accessToken: string) => {
    const payloadBase64 = accessToken.split('.')[1];
    const payloadBuf = Buffer.from(payloadBase64, 'base64');
    const payloadString = payloadBuf.toString('utf-8');
    const payload = JSON.parse(payloadString);
    return payload.userId;
  };

  let room: RoomEntity;
  beforeAll(async () => {
    // Owner
    {
      await createUser(constants.user.owner);
      const ownerAccessToken = await getAccessToken(constants.user.owner);
      const res = await createRoom(ownerAccessToken, constants.room.test);
      room = res.body;
    }
    // Member
    {
      await createUser(constants.user.member);
      const accessToken = await getAccessToken(constants.user.member);
      await enterRoom(accessToken, room);
    }
    // Admin
    {
      await createUser(constants.user.admin);
      const accessToken = await getAccessToken(constants.user.admin);
      await enterRoom(accessToken, room);
    }
    // Not Member
    {
      await createUser(constants.user.notMember);
    }
  });

  afterAll(async () => {
    // Delete room created by owner
    const accessToken = await getAccessToken(constants.user.owner);
    await deleteRoom(room.id, accessToken);
    for (const dto of users) {
      const accessToken = await getAccessToken(dto);
      const userId = getUserIdFromAccessToken(accessToken);
      await deleteUser(userId, accessToken);
    }
  });

  describe('GET /room/:id (Get Room)', () => {
    it('from room member: should return the room 200 OK', async () => {
      for (const member of roomMembers) {
        const accessToken = await getAccessToken(member);
        await getRoom(room.id, accessToken)
          .expect(200)
          .expect((res) => {
            expectRoomWithUsers(res.body);
            expect(res.body.users).toHaveLength(3);
            res.body.users.forEach(expectUserOnRoom);
          });
      }
    });

    it('from notMember: should return 403 Forbidden', async () => {
      const accessToken = await getAccessToken(constants.user.notMember);
      await getRoom(room.id, accessToken).expect(403);
    });

    it('from Unauthorized User: should return 401 Unauthorized', async () => {
      await getRoom(room.id, 'invalid_access_token').expect(401);
    });
  });

  describe('POST /room/:id (Enter Room)', () => {
    it('from member: should return 409 Conflict', async () => {
      for (const member of roomMembers) {
        const accessToken = await getAccessToken(member);
        await enterRoom(accessToken, room).expect(409);
      }
    });

    it('from notMember: should return 201 Created', async () => {
      const accessToken = await getAccessToken(constants.user.notMember);
      await enterRoom(accessToken, room).expect(201);
    });

    it('from Unauthorized User: should return 401 Unauthorized', async () => {
      await enterRoom('invalid_access_token', room).expect(401);
    });
  });

  describe('PATCH /room/:id (Update Room)', () => {
    it('from Owner: should return 200 OK', async () => {
      const accessToken = await getAccessToken(constants.user.owner);
      const dto: UpdateRoomDto = { name: 'new_name' };
      const expected = { ...room, ...dto };
      await updateRoom(room.id, accessToken, dto).expect(200).expect(expected);
    });

    it('from non owner: should return 403', async () => {
      const dto: UpdateRoomDto = { name: 'new_name' };
      for (const user of usersExceptOwner) {
        const accessToken = await getAccessToken(user);
        await updateRoom(room.id, accessToken, dto).expect(403);
      }
    });

    it('from Unauthorized User: should return 401 Unauthorized', async () => {
      const dto: UpdateRoomDto = { name: 'new_name' };
      await updateRoom(room.id, 'invalid_access_token', dto).expect(401);
    });
  });

  describe('DELETE /room/:id (Delete Room)', () => {
    it('from non owner: should return 403 Forbidden', async () => {
      for (const user of usersExceptOwner) {
        const accessToken = await getAccessToken(user);
        await deleteRoom(room.id, accessToken).expect(403);
      }
    });

    it('from Uunauthorized User: should return 401 Unauthorized', async () => {
      await deleteRoom(room.id, 'invalid_access_token').expect(401);
    });

    it('from owner: should return 204 No Content', async () => {
      const accessToken = await getAccessToken(constants.user.owner);
      await deleteRoom(room.id, accessToken).expect(204);
    });
  });

  describe('POST /room (Create Room)', () => {
    /* TODO */
  });
  describe('GET /room (Get All Rooms)', () => {
    it('from Everyone (include Authorized User): should return 200 OK', async () => {
      await getRooms()
        .expect(200)
        .then((res) => {
          expect(res.body).toBeInstanceOf(Array);
          res.body.forEach(expectRoom);
        });
    });
  });
  describe('GET /room/:id/:userId (Get UserOnRoom?)', () => {
    /* TODO */
  });
  describe('DELETE /room/:id/:userId (Delete user in Room)', () => {
    /* TODO */
  });
  describe('PATCH /room/:id/:userId (Modify user role in Room)', () => {
    /* TODO */
  });
});
