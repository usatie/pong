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
import { Role } from '@prisma/client';
import { UpdateUserOnRoomDto } from 'src/room/dto/update-UserOnRoom.dto';

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

  const leaveRoom = (roomId: number, accessToken: string) =>
    request(app.getHttpServer())
      .delete(`/room/${roomId}/${getUserIdFromAccessToken(accessToken)}`)
      .set('Authorization', `Bearer ${accessToken}`);

  const kickFromRoom = (roomId: number, userId: number, accessToken: string) =>
    request(app.getHttpServer())
      .delete(`/room/${roomId}/${userId}`)
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

  const updateUserOnRoom = (
    roomId: number,
    userId: number,
    dto: UpdateUserOnRoomDto,
    accessToken: string,
  ) =>
    request(app.getHttpServer())
      .patch(`/room/${roomId}/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto);

  /* Auth API */
  const login = (dto: LoginDto) =>
    request(app.getHttpServer()).post('/auth/login').send(dto);

  /* Utility functions for test */
  const getAccessToken = (dto: LoginDto): Promise<string> =>
    login(dto).then((res) => res.body.accessToken);

  const getUserIdFromAccessToken = (accessToken: string): number => {
    const payloadBase64 = accessToken.split('.')[1];
    const payloadBuf = Buffer.from(payloadBase64, 'base64');
    const payloadString = payloadBuf.toString('utf-8');
    const payload = JSON.parse(payloadString);
    return payload.userId;
  };

  const getUserOnRoom = (
    roomId: number,
    userId: number,
    accessToken: string,
  ) => {
    return request(app.getHttpServer())
      .get(`/room/${roomId}/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);
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
      await updateUserOnRoom(
        room.id,
        getUserIdFromAccessToken(accessToken),
        { role: Role.ADMINISTRATOR },
        await getAccessToken(constants.user.owner),
      );
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
      await leaveRoom(room.id, accessToken).expect(204);
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
      const testRoom = await createRoom(accessToken, constants.room.test)
        .expect(201)
        .then((res): RoomEntity => res.body);
      await deleteRoom(testRoom.id, accessToken).expect(204);
    });
  });

  describe('POST /room (Create Room)', () => {
    let testRoom: RoomEntity;
    const testOwner = constants.user.notMember;

    it('from Unauthorized User: should return 401 Unauthorized', async () => {
      await createRoom('invalid_access_token', constants.room.test).expect(401);
    });
    it('from Authorized User: should return 201 Created', async () => {
      const accessToken = await getAccessToken(testOwner);
      await createRoom(accessToken, constants.room.test)
        .expect(201)
        .then((res) => {
          expectRoom(res.body);
          testRoom = res.body;
        });
    });

    afterAll(async () => {
      const accessToken = await getAccessToken(testOwner);
      await deleteRoom(testRoom.id, accessToken);
    });
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
    it('from room member: should return 200 OK', async () => {
      for (const member of roomMembers) {
        const accessToken = await getAccessToken(member);
        const memberId = getUserIdFromAccessToken(accessToken);
        await getUserOnRoom(room.id, memberId, accessToken)
          .expect(200)
          .expect((res) => {
            expectUserOnRoom(res.body);
          });
      }
    });
    it('from member to not member: should return 404 Not Found', async () => {
      const accessToken = await getAccessToken(constants.user.member);
      const accessTokenOfNotMember = await getAccessToken(
        constants.user.notMember,
      );
      const idOfNotMember = getUserIdFromAccessToken(accessTokenOfNotMember);
      await getUserOnRoom(room.id, idOfNotMember, accessToken).expect(404);
    });
    // TODO : add Guard to controller
    it('from notMember: should return 403 Forbidden', async () => {
      const targetId = getUserIdFromAccessToken(
        await getAccessToken(constants.user.member),
      );
      const accessToken = await getAccessToken(constants.user.notMember);
      await getUserOnRoom(room.id, targetId, accessToken).expect(403);
    });
    it('from Unauthorized User: should return 401 Unauthorized', async () => {
      const targetId = getUserIdFromAccessToken(
        await getAccessToken(constants.user.member),
      );
      await getUserOnRoom(room.id, targetId, 'invalid_access_token').expect(
        401,
      );
    });
  });
  const testRoomSetup = async (): Promise<number> => {
    const ownerToken = await getAccessToken(constants.user.owner);
    const res = await createRoom(ownerToken, constants.room.test);
    const roomId = res.body.id;
    for (const member of usersExceptOwner) {
      if (member === constants.user.owner) continue;
      const accessToken = await getAccessToken(member);
      await enterRoom(accessToken, res.body);

      if (member === constants.user.admin) {
        await updateUserOnRoom(
          roomId,
          getUserIdFromAccessToken(accessToken),
          { role: Role.ADMINISTRATOR },
          ownerToken,
        );
      }
    }
    return roomId;
  };

  describe('DELETE /room/:id/:userId (Delete user in Room)', () => {
    let testRoomId: number;

    beforeEach(async () => {
      testRoomId = await testRoomSetup();
    });
    afterEach(async () => {
      const accessToken = await getAccessToken(constants.user.owner);
      await deleteRoom(testRoomId, accessToken);
    });
    const notOwnerFilter = (user: LoginDto) =>
      user.email !== constants.user.owner.email;

    it('from member: clientRole >= targetRole: should return 204 No Content (owner)', async () => {
      const accessToken = await getAccessToken(constants.user.owner);
      for (const member of usersExceptOwner.filter(notOwnerFilter)) {
        const targetId = getUserIdFromAccessToken(await getAccessToken(member));
        await kickFromRoom(testRoomId, targetId, accessToken).expect(204);
      }
    });
    it('from member: clientRole >= targetRole: should return 204 No Content (admin)', async () => {
      const accessToken = await getAccessToken(constants.user.admin);
      const memberId = getUserIdFromAccessToken(
        await getAccessToken(constants.user.member),
      );
      const adminId = getUserIdFromAccessToken(accessToken);
      await kickFromRoom(testRoomId, memberId, accessToken).expect(204);
      await kickFromRoom(testRoomId, adminId, accessToken).expect(204);
    });
    it('from member: should return 403 Forbidden (member)', async () => {
      const accessToken = await getAccessToken(constants.user.member);
      const memberId = getUserIdFromAccessToken(accessToken);
      await kickFromRoom(testRoomId, memberId, accessToken).expect(204);
    });
    it('from member: clientRole < targetRole: should return 403 Forbidden', async () => {
      const MemberAccessToken = await getAccessToken(constants.user.member);
      const AdminAccessToken = await getAccessToken(constants.user.admin);
      const adminId = getUserIdFromAccessToken(
        await getAccessToken(constants.user.admin),
      );
      const ownerId = getUserIdFromAccessToken(
        await getAccessToken(constants.user.owner),
      );
      await kickFromRoom(testRoomId, ownerId, AdminAccessToken).expect(403);
      await kickFromRoom(testRoomId, ownerId, MemberAccessToken).expect(403);
      await kickFromRoom(testRoomId, adminId, MemberAccessToken).expect(403);
    });
  });
  describe('PATCH /room/:id/:userId (Modify user role in Room)', () => {
    let testRoomId: number;
    const toMemberDto: UpdateUserOnRoomDto = { role: Role.MEMBER };
    const toAdminDto: UpdateUserOnRoomDto = { role: Role.ADMINISTRATOR };
    const toOwnerDto: UpdateUserOnRoomDto = { role: Role.OWNER };

    beforeEach(async () => {
      testRoomId = await testRoomSetup();
    });
    afterEach(async () => {
      const accessToken = await getAccessToken(constants.user.owner);
      await deleteRoom(testRoomId, accessToken);
    });

    it('from member: should return 204 No Content (owner)', async () => {
      const accessToken = await getAccessToken(constants.user.owner);
      const adminId = getUserIdFromAccessToken(
        await getAccessToken(constants.user.admin),
      );
      const memberId = getUserIdFromAccessToken(
        await getAccessToken(constants.user.member),
      );
      await updateUserOnRoom(
        testRoomId,
        memberId,
        toAdminDto,
        accessToken,
      ).expect(200);
      await updateUserOnRoom(
        testRoomId,
        adminId,
        toMemberDto,
        accessToken,
      ).expect(200);
    });
    it('from member: clientRole >= targetRole: should return 204 No Content (admin)', async () => {
      const accessToken = await getAccessToken(constants.user.admin);
      const memberId = getUserIdFromAccessToken(
        await getAccessToken(constants.user.member),
      );
      const adminId = getUserIdFromAccessToken(accessToken);
      await updateUserOnRoom(
        testRoomId,
        memberId,
        toAdminDto,
        accessToken,
      ).expect(200);
      await updateUserOnRoom(
        testRoomId,
        adminId,
        toMemberDto,
        accessToken,
      ).expect(200);
    });
    it('from member: should return 403 Forbidden (member)', async () => {
      const accessToken = await getAccessToken(constants.user.member);
      const memberId = getUserIdFromAccessToken(accessToken);
      await updateUserOnRoom(
        testRoomId,
        memberId,
        toMemberDto,
        accessToken,
      ).expect(403);
    });
    it('from member: clientRole < targetRole: should return 403 Forbidden', async () => {
      const MemberAccessToken = await getAccessToken(constants.user.member);
      const AdminAccessToken = await getAccessToken(constants.user.admin);
      const adminId = getUserIdFromAccessToken(
        await getAccessToken(constants.user.admin),
      );
      const ownerId = getUserIdFromAccessToken(
        await getAccessToken(constants.user.owner),
      );
      const memberId = getUserIdFromAccessToken(
        await getAccessToken(constants.user.member),
      );
      // from admin to owner
      await updateUserOnRoom(
        testRoomId,
        ownerId,
        toAdminDto,
        AdminAccessToken,
      ).expect(403);
      await updateUserOnRoom(
        testRoomId,
        ownerId,
        toMemberDto,
        AdminAccessToken,
      ).expect(403);
      // from admin to member
      await updateUserOnRoom(
        testRoomId,
        memberId,
        toOwnerDto,
        AdminAccessToken,
      ).expect(403);
      // from member to admin
      await updateUserOnRoom(
        testRoomId,
        adminId,
        toMemberDto,
        MemberAccessToken,
      ).expect(403);
      // from member to owner
      await updateUserOnRoom(
        testRoomId,
        ownerId,
        toMemberDto,
        MemberAccessToken,
      ).expect(403);
    });
  });
});
