import { Role } from '@prisma/client';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { UpdateRoomDto } from 'src/room/dto/update-room.dto';
import { RoomEntity } from 'src/room/entities/room.entity';
import supertest from 'supertest';
import { constants } from './constants';
import { TestApp, UserEntityWithAccessToken } from './utils/app';
import { initializeApp } from './utils/initialize';
import { expectPublicUser, expectRoom } from './utils/matcher';

describe('RoomController (e2e)', () => {
  let app: TestApp;
  beforeAll(async () => {
    app = new TestApp(await initializeApp());
  });
  afterAll(() => app.close());

  class Ref<T> {
    current: T;
  }
  let owner, admin, member, notMember: UserEntityWithAccessToken;
  let user1, user2, user3: UserEntityWithAccessToken;
  const ownerRef: Ref<UserEntityWithAccessToken> = new Ref();
  const adminRef: Ref<UserEntityWithAccessToken> = new Ref();
  const memberRef: Ref<UserEntityWithAccessToken> = new Ref();
  const nonMemberRef: Ref<UserEntityWithAccessToken> = new Ref();

  let publicRoom, privateRoom, protectedRoom, directRoom: RoomEntity;
  const publicRoomRef: Ref<RoomEntity> = new Ref();
  const privateRoomRef: Ref<RoomEntity> = new Ref();
  const protectedRoomRef: Ref<RoomEntity> = new Ref();
  const directRoomRef: Ref<RoomEntity> = new Ref();
  beforeAll(async () => {
    // Owner
    {
      owner = await app.createAndLoginUser(constants.user.owner);
      ownerRef.current = owner;
      publicRoom = await app
        .createRoom(constants.room.publicRoom, owner.accessToken)
        .expect(201)
        .then((res) => res.body);
      publicRoomRef.current = publicRoom;
      privateRoom = await app
        .createRoom(constants.room.privateRoom, owner.accessToken)
        .expect(201)
        .then((res) => res.body);
      privateRoomRef.current = privateRoom;
      protectedRoom = await app
        .createRoom(constants.room.protectedRoom, owner.accessToken)
        .expect(201)
        .then((res) => res.body);
      protectedRoomRef.current = protectedRoom;
    }
    // Member
    {
      member = await app.createAndLoginUser(constants.user.member);
      memberRef.current = member;
      await app.enterRoom(publicRoom.id, member.accessToken).expect(201);
      await app
        .inviteRoom(privateRoom.id, member.id, owner.accessToken)
        .expect(201);
      await app
        .enterRoom(protectedRoom.id, member.accessToken, {
          password: constants.room.protectedRoom.password,
        })
        .expect(201);
    }
    // Admin
    {
      admin = await app.createAndLoginUser(constants.user.admin);
      adminRef.current = admin;
      await app.enterRoom(publicRoom.id, admin.accessToken).expect(201);
      await app
        .inviteRoom(privateRoom.id, admin.id, owner.accessToken)
        .expect(201);
      await app
        .enterRoom(protectedRoom.id, admin.accessToken, {
          password: constants.room.protectedRoom.password,
        })
        .expect(201);
      await app
        .updateUserOnRoom(
          publicRoom.id,
          admin.id,
          { role: Role.ADMINISTRATOR },
          owner.accessToken,
        )
        .expect(200);
      await app
        .updateUserOnRoom(
          privateRoom.id,
          admin.id,
          { role: Role.ADMINISTRATOR },
          owner.accessToken,
        )
        .expect(200);
      await app
        .updateUserOnRoom(
          protectedRoom.id,
          admin.id,
          { role: Role.ADMINISTRATOR },
          owner.accessToken,
        )
        .expect(200);
    }
    // Not Member
    {
      notMember = await app.createAndLoginUser(constants.user.notMember);
      nonMemberRef.current = notMember;
    }
    // User1, User2
    {
      user1 = await app.createAndLoginUser(constants.user.test);
      user2 = await app.createAndLoginUser(constants.user.test2);
      user3 = await app.createAndLoginUser(constants.user.test3);
      directRoom = await app
        .createRoom(
          { ...constants.room.directRoom, userIds: [user2.id] },
          user1.accessToken,
        )
        .expect(201)
        .then((res) => res.body);
      directRoomRef.current = directRoom;
    }
  });

  afterAll(async () => {
    // Delete room created by owner
    await app.deleteRoom(publicRoom.id, owner.accessToken).expect(204);
    await app.deleteRoom(privateRoom.id, owner.accessToken).expect(204);
    await app.deleteRoom(protectedRoom.id, owner.accessToken).expect(204);
    await app.deleteRoom(directRoom.id, user1.accessToken).expect(204);
    // Delete users
    for (const user of [owner, admin, member, notMember, user1, user2, user3]) {
      await app.deleteUser(user.id, user.accessToken).expect(204);
    }
  });

  const setupRoom = async (createRoomDto: CreateRoomDto) => {
    const dto = { ...createRoomDto, userIds: [member.id, admin.id] };
    const room = await app
      .createRoom(dto, owner.accessToken)
      .expect(201)
      .then((res) => res.body);
    await app.updateUserOnRoom(
      room.id,
      admin.id,
      { role: Role.ADMINISTRATOR },
      owner.accessToken,
    );
    return room;
  };
  // room : 1. public 2. private 3. protected
  // member : 1. owner 2. admin 3. member 4. notMember
  // status : kick, ban, mute

  it('Unauthorized user should not access room API', async () => {
    await app.getRoom(publicRoom.id, 'invalid_access_token').expect(401);
    const dto: UpdateRoomDto = { name: 'new_name' };
    await app
      .updateRoom(publicRoom.id, dto, 'invalid_access_token')
      .expect(401);
    await app.deleteRoom(publicRoom.id, 'invalid_access_token').expect(401);
    await app
      .createRoom(constants.room.publicRoom, 'invalid_access_token')
      .expect(401);
    await app.getRooms('invalid_access_token').expect(401);
    await app.enterRoom(publicRoom.id, 'invalid_access_token').expect(401);
  });

  describe('POST /room (Create Room)', () => {
    let _publicRoom: RoomEntity;
    let _privateRoom: RoomEntity;
    let _protectedRoom: RoomEntity;
    let _duplicatedRoom: RoomEntity;
    let _withUserRoom: RoomEntity;
    let _directRoom: RoomEntity;

    afterAll(async () => {
      await app.deleteRoom(_publicRoom.id, owner.accessToken).expect(204);
      await app.deleteRoom(_privateRoom.id, owner.accessToken).expect(204);
      await app.deleteRoom(_protectedRoom.id, owner.accessToken).expect(204);
      await app.deleteRoom(_duplicatedRoom.id, owner.accessToken).expect(204);
      await app.deleteRoom(_withUserRoom.id, owner.accessToken).expect(204);
      await app.deleteRoom(_directRoom.id, owner.accessToken).expect(204);
    });

    it('should create public room (201 Created)', async () => {
      _publicRoom = await app
        .createRoom(constants.room.publicRoom, owner.accessToken)
        .expect(201)
        .expect((res) => expectRoom(res.body))
        .then((res) => res.body);
    });

    it('should create private room (201 Created)', async () => {
      _privateRoom = await app
        .createRoom(constants.room.privateRoom, owner.accessToken)
        .expect(201)
        .expect((res) => expectRoom(res.body))
        .then((res) => res.body);
    });

    it('should create password protected room (201 Created)', async () => {
      _protectedRoom = await app
        .createRoom(constants.room.protectedRoom, owner.accessToken)
        .expect(201)
        .expect((res) => expectRoom(res.body))
        .then((res) => res.body);
    });

    it('should not create protected room without password (400 Bad Request)', async () => {
      const dtoWithoutPassword = { ...constants.room.protectedRoom };
      delete dtoWithoutPassword.password;
      await app.createRoom(dtoWithoutPassword, owner.accessToken).expect(400);
    });

    it('should create room with duplicated name (201 OK)', async () => {
      _duplicatedRoom = await app
        .createRoom(constants.room.publicRoom, owner.accessToken)
        .expect(201)
        .expect((res) => expectRoom(res.body))
        .then((res) => res.body);
    });

    it('should create room with users (201 OK)', async () => {
      _withUserRoom = await app
        .createRoom(
          { ...constants.room.publicRoom, userIds: [member.id, admin.id] },
          owner.accessToken,
        )
        .expect(201)
        .expect((res) => expectRoom(res.body))
        .then((res) => res.body);
      const room = await app
        .getRoom(_withUserRoom.id, owner.accessToken)
        .expect(200)
        .then((res) => res.body);
      const userIds = room.users.map((user) => user.userId);
      expect(userIds).toContainEqual(member.id);
      expect(userIds).toContainEqual(admin.id);
    });

    describe('DIRECT', () => {
      it('should create room with DIRECT access level (201 Created)', async () => {
        _directRoom = await app
          .createRoom(
            { ...constants.room.directRoom, userIds: [member.id] },
            owner.accessToken,
          )
          .expect(201)
          .expect((res) => expectRoom(res.body))
          .then((res) => res.body);
      });
      it('should not create room with empty userIds', async () => {
        await app
          .createRoom(
            { ...constants.room.directRoom, userIds: [] },
            owner.accessToken,
          )
          .expect(400);
      });
      it('should not create room with more than one userIds', async () => {
        await app
          .createRoom(
            { ...constants.room.directRoom, userIds: [member.id, admin.id] },
            owner.accessToken,
          )
          .expect(400);
      });
    });
  });

  describe('GET /room/:id (Get Room)', () => {
    describe('owner', () => {
      it('should get public room', () => {
        return app.getRoom(publicRoom.id, owner.accessToken).expect(200);
      });
      it('should get protected room', () => {
        return app.getRoom(protectedRoom.id, owner.accessToken).expect(200);
      });
      it('should get private room', () => {
        return app.getRoom(privateRoom.id, owner.accessToken).expect(200);
      });
      it('should not get direct room (404 Not Found)', () => {
        return app.getRoom(directRoom.id, owner.accessToken).expect(404);
      });
    });

    describe('admin', () => {
      it('should get public room', () => {
        return app.getRoom(publicRoom.id, admin.accessToken).expect(200);
      });
      it('should get protected room', () => {
        return app.getRoom(protectedRoom.id, admin.accessToken).expect(200);
      });
      it('should get private room', () => {
        return app.getRoom(privateRoom.id, admin.accessToken).expect(200);
      });
      it('should not get direct room (404 Not Found)', () => {
        return app.getRoom(directRoom.id, admin.accessToken).expect(404);
      });
    });

    describe('member', () => {
      it('should get public room', () => {
        return app.getRoom(publicRoom.id, member.accessToken).expect(200);
      });
      it('should get protected room', () => {
        return app.getRoom(protectedRoom.id, member.accessToken).expect(200);
      });
      it('should get private room', () => {
        return app.getRoom(privateRoom.id, member.accessToken).expect(200);
      });
      it('should not get direct room (404 Not Found)', () => {
        return app.getRoom(directRoom.id, member.accessToken).expect(404);
      });
    });

    describe('notMember', () => {
      it('should get public room', () => {
        return app.getRoom(publicRoom.id, notMember.accessToken).expect(200);
      });
      it('should get protected room', () => {
        return app.getRoom(protectedRoom.id, notMember.accessToken).expect(200);
      });
      it('should not get private room (404 Not Found)', () => {
        return app.getRoom(privateRoom.id, notMember.accessToken).expect(404);
      });
      it('should not get direct room (404 Not Found)', () => {
        return app.getRoom(directRoom.id, notMember.accessToken).expect(404);
      });
    });

    describe('user1', () => {
      it('should get direct room (200 OK)', () => {
        return app.getRoom(directRoom.id, user1.accessToken).expect(200);
      });
    });

    describe('user2', () => {
      it('should get direct room (200 OK)', () => {
        return app.getRoom(directRoom.id, user2.accessToken).expect(200);
      });
    });

    it('invalid roomId should return 404 Not Found (403?)', async () => {});
  });

  describe('GET /room/direct/:userId (Get Direct Room)', () => {
    describe('user1', () => {
      it('should get direct room with user2 (200 OK)', () => {
        return app
          .getDirectRoom(user2.id, user1.accessToken)
          .expect(200)
          .expect((res) => {
            const userIds = res.body.users.map((user) => user.userId);
            expect(userIds).toContainEqual(user1.id);
            expect(userIds).toContainEqual(user2.id);
            expect(res.body.accessLevel).toEqual('DIRECT');
          });
      });
      it('should not get direct room with user3 that has not created DM (404 Not Found)', () => {
        return app.getDirectRoom(user3.id, user1.accessToken).expect(404);
      });
    });

    describe('user2', () => {
      it('should get direct room with user1 (200 OK)', () => {
        return app
          .getDirectRoom(user1.id, user2.accessToken)
          .expect(200)
          .expect((res) => {
            const userIds = res.body.users.map((user) => user.userId);
            expect(userIds).toContainEqual(user1.id);
            expect(userIds).toContainEqual(user2.id);
            expect(res.body.accessLevel).toEqual('DIRECT');
          });
      });
      it('should not get direct room with user3 that has not created DM (404 Not Found)', () => {
        return app.getDirectRoom(user3.id, user2.accessToken).expect(404);
      });
    });

    describe('user3', () => {
      it('should not get direct room with user1 that has not created DM (404 Not Found)', () => {
        return app.getDirectRoom(user1.id, user3.accessToken).expect(404);
      });
      it('should not get direct room with user2 that has not created DM (404 Not Found)', () => {
        return app.getDirectRoom(user2.id, user3.accessToken).expect(404);
      });
    });
  });

  describe('POST /room/:id (Enter Room)', () => {
    afterAll(async () => {
      await app.leaveRoom(publicRoom.id, notMember.accessToken);
      await app.leaveRoom(protectedRoom.id, notMember.accessToken);
    });

    describe('PUBLIC room', () => {
      describe('owner', () => {
        it('should not enter already entered room (409 Conflict)', async () => {
          await app.enterRoom(publicRoom.id, owner.accessToken).expect(409);
        });
      });
      describe('admin', () => {
        it('should not enter already entered room (409 Conflict)', async () => {
          await app.enterRoom(publicRoom.id, admin.accessToken).expect(409);
        });
      });
      describe('member', () => {
        it('should not enter already entered room (409 Conflict)', async () => {
          await app.enterRoom(publicRoom.id, member.accessToken).expect(409);
        });
      });
      describe('non-member', () => {
        it('should enter public room (201 Created)', async () => {
          await app.enterRoom(publicRoom.id, notMember.accessToken).expect(201);
        });
        it('should not enter public room twice (409 Conflict)', async () => {
          await app.enterRoom(publicRoom.id, notMember.accessToken).expect(409);
        });
      });
    });
    describe('PRIVATE room', () => {
      describe('owner', () => {
        it('should not enter private room (403 Forbidden)', async () => {
          await app.enterRoom(privateRoom.id, owner.accessToken).expect(403);
        });
      });
      describe('admin', () => {
        it('should not enter private room (403 Forbidden)', async () => {
          await app.enterRoom(privateRoom.id, admin.accessToken).expect(403);
        });
      });
      describe('member', () => {
        it('should not enter private room (403 Forbidden)', async () => {
          await app.enterRoom(privateRoom.id, member.accessToken).expect(403);
        });
      });
      describe('non-member', () => {
        it('should not enter private room (403 Forbidden)', async () => {
          await app
            .enterRoom(privateRoom.id, notMember.accessToken)
            .expect(403);
        });
      });
    });
    describe('PROTECTED room', () => {
      describe('owner', () => {
        it('should not enter rooms already in (409 Conflict)', async () => {
          await app
            .enterRoom(protectedRoom.id, owner.accessToken, {
              password: constants.room.protectedRoom.password,
            })
            .expect(409);
        });
      });
      describe('admin', () => {
        it('should not enter rooms already in (409 Conflict)', async () => {
          await app
            .enterRoom(protectedRoom.id, admin.accessToken, {
              password: constants.room.protectedRoom.password,
            })
            .expect(409);
        });
      });
      describe('member', () => {
        it('should not enter rooms already in (409 Conflict)', async () => {
          await app
            .enterRoom(protectedRoom.id, member.accessToken, {
              password: constants.room.protectedRoom.password,
            })
            .expect(409);
        });
      });
      describe('non-member', () => {
        it('should not enter protected room without password (400 Bad Request)', async () => {
          await app
            .enterRoom(protectedRoom.id, notMember.accessToken)
            .expect(400);
        });
        it('should not enter protected room with invalid password (403 Forbidden)', async () => {
          await app
            .enterRoom(protectedRoom.id, notMember.accessToken, {
              password: 'invalid_password',
            })
            .expect(403);
        });
        it('should enter protected room with password (201 Created)', async () => {
          await app
            .enterRoom(protectedRoom.id, notMember.accessToken, {
              password: constants.room.protectedRoom.password,
            })
            .expect(201);
        });
        it('should not enter protected room twice (409 Conflict)', async () => {
          await app
            .enterRoom(protectedRoom.id, notMember.accessToken, {
              password: constants.room.protectedRoom.password,
            })
            .expect(409);
        });
      });
    });
    describe('DIRECT room', () => {
      it('should not enter direct room (403 Forbidden)', async () => {
        await app.enterRoom(directRoom.id, notMember.accessToken).expect(403);
      });
    });
    it('Anyone should not enter invalid room (404 Not Found)', async () => {});
  });

  describe('POST /room/:roomId/invite/:userId (Invite Room)', () => {
    describe('PUBLIC room', () => {
      afterEach(async () => {
        await app.leaveRoom(publicRoom.id, notMember.accessToken);
      });
      describe('owner', () => {
        it('should invite non-member (201 Created)', async () => {
          await app
            .inviteRoom(publicRoom.id, notMember.id, owner.accessToken)
            .expect(201);
        });
      });
      describe('admin', () => {
        it('should invite non-member (201 Created)', async () => {
          await app
            .inviteRoom(publicRoom.id, notMember.id, admin.accessToken)
            .expect(201);
        });
      });
      describe('member', () => {
        it('should not invite anyone (403 Forbidden)', async () => {
          await app
            .inviteRoom(publicRoom.id, notMember.id, member.accessToken)
            .expect(403);
        });
      });
      describe('non-member', () => {
        it('should not invite anyone (403 Forbidden)', async () => {
          await app
            .inviteRoom(publicRoom.id, notMember.id, notMember.accessToken)
            .expect(403);
        });
      });
    });
    describe('PRIVATE room', () => {
      afterEach(async () => {
        await app.leaveRoom(privateRoom.id, notMember.accessToken);
      });
      describe('owner', () => {
        it('should invite non-member (201 Created)', async () => {
          await app
            .inviteRoom(privateRoom.id, notMember.id, owner.accessToken)
            .expect(201);
        });
      });
      describe('admin', () => {
        it('should invite non-member (201 Created)', async () => {
          await app
            .inviteRoom(privateRoom.id, notMember.id, admin.accessToken)
            .expect(201);
        });
      });
      describe('member', () => {
        it('should not invite anyone (403 Forbidden)', async () => {
          await app
            .inviteRoom(privateRoom.id, notMember.id, member.accessToken)
            .expect(403);
        });
      });
      describe('non-member', () => {
        it('should not invite anyone (403 Forbidden)', async () => {
          await app
            .inviteRoom(privateRoom.id, notMember.id, notMember.accessToken)
            .expect(403);
        });
      });
    });
    describe('PROTECTED room', () => {
      afterEach(async () => {
        await app.leaveRoom(protectedRoom.id, notMember.accessToken);
      });
      describe('owner', () => {
        it('should invite non-member (201 Created)', async () => {
          await app
            .inviteRoom(protectedRoom.id, notMember.id, owner.accessToken)
            .expect(201);
        });
      });
      describe('admin', () => {
        it('should invite non-member (201 Created)', async () => {
          await app
            .inviteRoom(protectedRoom.id, notMember.id, admin.accessToken)
            .expect(201);
        });
      });
      describe('member', () => {
        it('should not invite anyone (403 Forbidden)', async () => {
          await app
            .inviteRoom(protectedRoom.id, notMember.id, member.accessToken)
            .expect(403);
        });
      });
      describe('non-member', () => {
        it('should not invite anyone (403 Forbidden)', async () => {
          await app
            .inviteRoom(protectedRoom.id, notMember.id, notMember.accessToken)
            .expect(403);
        });
      });
    });
    describe('DIRECT ROOM', () => {
      test('user1 should not invite anyone (403 Forbidden)', async () => {
        await app
          .inviteRoom(directRoom.id, notMember.id, user1.accessToken)
          .expect(403);
      });
      test('user2 should not invite anyone (403 Forbidden)', async () => {
        await app
          .inviteRoom(directRoom.id, notMember.id, user2.accessToken)
          .expect(403);
      });
    });
  });

  describe('GET /room (Get All Rooms)', () => {
    const testGetRooms = (accessToken: string) =>
      app
        .getRooms(accessToken)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Array);
          res.body.forEach(expectRoom);
          expect(res.body).toContainEqual(publicRoom);
          expect(res.body).toContainEqual(protectedRoom);
        });
    describe('owner', () => {
      let _rooms: RoomEntity[];
      it('should get rooms (200 OK)', async () => {
        _rooms = await testGetRooms(owner.accessToken).then((res) => res.body);
      });
      it('should contain private room', async () => {
        expect(_rooms).toContainEqual(privateRoom);
      });
      it('should not contain the direct room', async () => {
        _rooms.forEach((room) => expect(room).not.toEqual(directRoom));
      });
    });
    describe('admin', () => {
      let _rooms: RoomEntity[];
      it('should get rooms (200 OK)', async () => {
        _rooms = await testGetRooms(admin.accessToken).then((res) => res.body);
      });
      it('should contain private room', async () => {
        expect(_rooms).toContainEqual(privateRoom);
      });
      it('should not contain the direct room', async () => {
        _rooms.forEach((room) => expect(room).not.toEqual(directRoom));
      });
    });
    describe('member', () => {
      let _rooms: RoomEntity[];
      it('should get rooms (200 OK)', async () => {
        _rooms = await testGetRooms(member.accessToken).then((res) => res.body);
      });
      it('should contain private room', async () => {
        expect(_rooms).toContainEqual(privateRoom);
      });
      it('should not contain the direct room', async () => {
        _rooms.forEach((room) => expect(room).not.toEqual(directRoom));
      });
    });
    describe('non-member', () => {
      let _rooms: RoomEntity[];
      it('should get rooms (200 OK)', async () => {
        _rooms = await testGetRooms(notMember.accessToken).then(
          (res) => res.body,
        );
      });
      it('should not contain private room', async () => {
        _rooms.forEach((room) => expect(room).not.toEqual(privateRoom));
      });
      it('should not contain the direct room', async () => {
        _rooms.forEach((room) => expect(room).not.toEqual(directRoom));
      });
    });
    describe('user1', () => {
      let _rooms: RoomEntity[];
      it('should get all rooms (200 OK)', async () => {
        _rooms = await testGetRooms(user1.accessToken).then((res) => res.body);
      });
      it('should contain direct room', async () => {
        expect(_rooms).toContainEqual(directRoom);
      });
      it('should not contain private room', async () => {
        _rooms.forEach((room) =>
          expect(room.accessLevel).not.toEqual('PRIVATE'),
        );
      });
    });
    describe('user2', () => {
      let _rooms: RoomEntity[];
      it('should get all rooms (200 OK)', async () => {
        _rooms = await testGetRooms(user2.accessToken).then((res) => res.body);
      });
      it('should contain direct room', async () => {
        expect(_rooms).toContainEqual(directRoom);
      });
      it('should not contain private room', async () => {
        _rooms.forEach((room) =>
          expect(room.accessLevel).not.toEqual('PRIVATE'),
        );
      });
    });
  });

  describe('PATCH /room/:id (Update Room)', () => {
    const shouldNotUpdateAny =
      (update: (dto: UpdateRoomDto) => supertest.Test) => () => {
        it('should not update name (403 Forbidden)', async () => {
          await update({ name: 'new_name' }).expect(403);
        });
        it('should not update access_level (403 Forbidden)', async () => {
          await update({ accessLevel: 'PUBLIC' }).expect(403);
          await update({ accessLevel: 'PRIVATE' }).expect(403);
          await update({ accessLevel: 'PROTECTED' }).expect(403);
          await update({
            accessLevel: 'PROTECTED',
            password: '12345678',
          }).expect(403);
        });
        it('should not update password (403 Forbidden)', async () => {
          await update({ password: '12345678' }).expect(403);
        });
      };
    const updater =
      (user: Ref<UserEntityWithAccessToken>, room: Ref<RoomEntity>) =>
      (dto: UpdateRoomDto) =>
        app.updateRoom(room.current.id, dto, user.current.accessToken);
    const testUpdateRoom = (dto: CreateRoomDto) => () => {
      let _room: RoomEntity;
      const _roomRef: Ref<RoomEntity> = new Ref();
      beforeEach(async () => {
        _room = await setupRoom(dto);
        _roomRef.current = _room;
      });
      afterEach(async () => {
        await app.deleteRoom(_room.id, owner.accessToken);
      });
      describe('owner', () => {
        const update = updater(ownerRef, _roomRef);
        it('should update name (200 OK)', async () => {
          await update({ name: 'new_name' }).expect(200);
        });
        it('should update access_level to public (200 OK)', async () => {
          await update({ accessLevel: 'PUBLIC' }).expect(200);
        });
        it('should update access_level to private (200 OK)', async () => {
          await update({ accessLevel: 'PRIVATE' }).expect(200);
        });
        it('should update access_level to protected (200 OK)', async () => {
          await update({
            accessLevel: 'PROTECTED',
            password: '12345678',
          }).expect(200);
        });
        if (dto.accessLevel === 'PROTECTED') {
          it('should update password (200 Bad Request)', async () => {
            await update({ password: '12345678' }).expect(200);
          });
        } else {
          it('should not update access level to protected without password (400 Bad Request)', async () => {
            await update({ accessLevel: 'PROTECTED' }).expect(400);
          });
          it('should not update password (400 Bad Request)', async () => {
            await update({ password: '12345678' }).expect(400);
          });
        }
        it('should not update access_level to direct (400 Bad Request)', async () => {
          await update({ accessLevel: 'DIRECT' }).expect(400);
        });
      });
      describe('admin', shouldNotUpdateAny(updater(adminRef, _roomRef)));
      describe('member', shouldNotUpdateAny(updater(memberRef, _roomRef)));
      describe(
        'non-member',
        shouldNotUpdateAny(updater(nonMemberRef, _roomRef)),
      );
    };

    describe('PUBLIC room', testUpdateRoom(constants.room.publicRoom));
    describe('PRIVATE room', testUpdateRoom(constants.room.privateRoom));
    describe('PROTECTED room', testUpdateRoom(constants.room.protectedRoom));
    describe('DIRECT room', () => {
      let _room: RoomEntity;
      beforeEach(async () => {
        _room = await app
          .createRoom(
            { ...constants.room.directRoom, userIds: [user2.id] },
            user1.accessToken,
          )
          .then((res) => res.body);
      });
      afterEach(async () => {
        await app.deleteRoom(_room.id, user1.accessToken);
      });
      it('should not update name (400 Forbidden)', async () => {
        await app
          .updateRoom(_room.id, { name: 'new_name' }, user1.accessToken)
          .expect(400);
      });
      it('should not update access_level (400 Forbidden)', async () => {
        await app
          .updateRoom(_room.id, { accessLevel: 'PUBLIC' }, user1.accessToken)
          .expect(400);
        await app
          .updateRoom(_room.id, { accessLevel: 'PRIVATE' }, user1.accessToken)
          .expect(400);
        await app
          .updateRoom(
            _room.id,
            { accessLevel: 'PROTECTED', password: '12345678' },
            user1.accessToken,
          )
          .expect(400);
      });
    });

    it('invalid roomId should return 404 Not Found', async () => {});
  });

  describe('DELETE /room/:id (Delete Room)', () => {
    let _publicRoom, _privateRoom, _protectedRoom, _directRoom: RoomEntity;
    const setupRooms = async () => {
      _publicRoom = await setupRoom(constants.room.publicRoom);
      _privateRoom = await setupRoom(constants.room.privateRoom);
      _protectedRoom = await setupRoom(constants.room.protectedRoom);
      _directRoom = await app
        .createRoom(
          { ...constants.room.directRoom, userIds: [user2.id] },
          user1.accessToken,
        )
        .expect(201)
        .then((res) => res.body);
    };
    const teardownRooms = async () => {
      await app.deleteRoom(_publicRoom.id, owner.accessToken);
      await app.deleteRoom(_privateRoom.id, owner.accessToken);
      await app.deleteRoom(_protectedRoom.id, owner.accessToken);
      await app.deleteRoom(_directRoom.id, user1.accessToken);
    };
    describe('owner', () => {
      beforeAll(setupRooms);
      afterAll(teardownRooms);
      it('should delete public room (204 No Content)', async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken).expect(204);
      });
      it('should delete private room (204 No Content)', async () => {
        await app.deleteRoom(_privateRoom.id, owner.accessToken).expect(204);
      });
      it('should delete protected room (204 No Content)', async () => {
        await app.deleteRoom(_protectedRoom.id, owner.accessToken).expect(204);
      });
      it('should not delete direct room (403 Forbidden)', async () => {
        await app.deleteRoom(_directRoom.id, owner.accessToken).expect(403);
      });
    });

    describe('admin', () => {
      beforeAll(setupRooms);
      afterAll(teardownRooms);
      it('should not delete public room (403 Forbidden)', async () => {
        await app.deleteRoom(_publicRoom.id, admin.accessToken).expect(403);
      });
      it('should not delete private room (403 Forbidden)', async () => {
        await app.deleteRoom(_privateRoom.id, admin.accessToken).expect(403);
      });
      it('should not delete protected room (403 Forbidden)', async () => {
        await app.deleteRoom(_protectedRoom.id, admin.accessToken).expect(403);
      });
      it('should not delete direct room (403 Forbidden)', async () => {
        await app.deleteRoom(_directRoom.id, admin.accessToken).expect(403);
      });
    });

    describe('member', () => {
      beforeAll(setupRooms);
      afterAll(teardownRooms);
      it('should not delete public room (403 Forbidden)', async () => {
        await app.deleteRoom(_publicRoom.id, member.accessToken).expect(403);
      });
      it('should not delete private room (403 Forbidden)', async () => {
        await app.deleteRoom(_privateRoom.id, member.accessToken).expect(403);
      });
      it('should not delete protected room (403 Forbidden)', async () => {
        await app.deleteRoom(_protectedRoom.id, member.accessToken).expect(403);
      });
      it('should not delete direct room (403 Forbidden)', async () => {
        await app.deleteRoom(_directRoom.id, member.accessToken).expect(403);
      });
    });

    describe('non-member', () => {
      beforeAll(setupRooms);
      afterAll(teardownRooms);
      it('should not delete public room (403 Forbidden)', async () => {
        await app.deleteRoom(_publicRoom.id, notMember.accessToken).expect(403);
      });
      it('should not delete private room (403 Forbidden)', async () => {
        await app
          .deleteRoom(_privateRoom.id, notMember.accessToken)
          .expect(403);
      });
      it('should not delete protected room (403 Forbidden)', async () => {
        await app
          .deleteRoom(_protectedRoom.id, notMember.accessToken)
          .expect(403);
      });
      it('should not delete direct room (403 Forbidden)', async () => {
        await app.deleteRoom(_directRoom.id, notMember.accessToken).expect(403);
      });
    });

    describe('user1', () => {
      beforeAll(setupRooms);
      afterAll(teardownRooms);
      it('should delete direct room (204 No Content)', async () => {
        await app.deleteRoom(_directRoom.id, user1.accessToken).expect(204);
      });
    });

    describe('user2', () => {
      beforeAll(setupRooms);
      afterAll(teardownRooms);
      it('should delete direct room (204 No Content)', async () => {
        await app.deleteRoom(_directRoom.id, user2.accessToken).expect(204);
      });
    });

    it('invalid roomId should return 404 Not Found', async () => {});
  });

  describe('DELETE /room/:id/:userId (Leave)', () => {
    let _publicRoom, _privateRoom, _protectedRoom, _directRoom: RoomEntity;
    const setupRooms = async () => {
      _publicRoom = await setupRoom(constants.room.publicRoom);
      _privateRoom = await setupRoom(constants.room.privateRoom);
      _protectedRoom = await setupRoom(constants.room.protectedRoom);
      _directRoom = await app
        .createRoom(
          { ...constants.room.directRoom, userIds: [user2.id] },
          user1.accessToken,
        )
        .expect(201)
        .then((res) => res.body);
    };
    const teardownRooms = async () => {
      await app.deleteRoom(_publicRoom.id, owner.accessToken);
      await app.deleteRoom(_privateRoom.id, owner.accessToken);
      await app.deleteRoom(_protectedRoom.id, owner.accessToken);
      await app.deleteRoom(_directRoom.id, user1.accessToken);
    };
    describe('owner', () => {
      beforeAll(setupRooms);
      afterAll(teardownRooms);
      // TODO: What if owner leaves the room?
      test('should leave public room (204 No Content)', async () => {
        await app.leaveRoom(_publicRoom.id, owner.accessToken).expect(204);
      });
      test('should leave private room (204 No Content)', async () => {
        await app.leaveRoom(_privateRoom.id, owner.accessToken).expect(204);
      });
      test('should leave protected room (204 No Content)', async () => {
        await app.leaveRoom(_protectedRoom.id, owner.accessToken).expect(204);
      });
    });
    describe('admin', () => {
      beforeAll(setupRooms);
      afterAll(teardownRooms);
      test('should leave public room (204 No Content)', async () => {
        await app.leaveRoom(_publicRoom.id, admin.accessToken).expect(204);
      });
      test('should leave private room (204 No Content)', async () => {
        await app.leaveRoom(_privateRoom.id, admin.accessToken).expect(204);
      });
      test('should leave protected room (204 No Content)', async () => {
        await app.leaveRoom(_protectedRoom.id, admin.accessToken).expect(204);
      });
    });
    describe('member', () => {
      beforeAll(setupRooms);
      afterAll(teardownRooms);
      test('should leave public room (204 No Content)', async () => {
        await app.leaveRoom(_publicRoom.id, member.accessToken).expect(204);
      });
      test('should leave private room (204 No Content)', async () => {
        await app.leaveRoom(_privateRoom.id, member.accessToken).expect(204);
      });
      test('should leave protected room (204 No Content)', async () => {
        await app.leaveRoom(_protectedRoom.id, member.accessToken).expect(204);
      });
    });
    describe('non-member', () => {
      beforeAll(setupRooms);
      afterAll(teardownRooms);
      test('should not leave public room which is not in (403 Forbidden)', async () => {
        await app.leaveRoom(_publicRoom.id, notMember.accessToken).expect(403);
      });
      test('should not leave private room which is not in (403 Forbidden)', async () => {
        await app.leaveRoom(_privateRoom.id, notMember.accessToken).expect(403);
      });
      test('should not leave protected room which is not in (403 Forbidden)', async () => {
        await app
          .leaveRoom(_protectedRoom.id, notMember.accessToken)
          .expect(403);
      });
    });
    describe('user1', () => {
      beforeAll(setupRooms);
      afterAll(teardownRooms);
      test('should not leave direct room (403 Forbidden)', async () => {
        await app.leaveRoom(directRoom.id, user1.accessToken).expect(403);
      });
    });
    describe('user2', () => {
      beforeAll(setupRooms);
      afterAll(teardownRooms);
      test('should not leave direct room (403 Forbidden)', async () => {
        await app.leaveRoom(directRoom.id, user2.accessToken).expect(403);
      });
    });
  });

  describe('DELETE /room/:id/kick/:userId (Kick)', () => {
    let _publicRoom, _privateRoom, _protectedRoom, _directRoom: RoomEntity;
    const setupRooms = async () => {
      _publicRoom = await setupRoom(constants.room.publicRoom);
      _privateRoom = await setupRoom(constants.room.privateRoom);
      _protectedRoom = await setupRoom(constants.room.protectedRoom);
      _directRoom = await app
        .createRoom(
          { ...constants.room.directRoom, userIds: [user2.id] },
          user1.accessToken,
        )
        .expect(201)
        .then((res) => res.body);
    };
    const teardownRooms = async () => {
      await app.deleteRoom(_publicRoom.id, owner.accessToken);
      await app.deleteRoom(_privateRoom.id, owner.accessToken);
      await app.deleteRoom(_protectedRoom.id, owner.accessToken);
      await app.deleteRoom(_directRoom.id, user1.accessToken);
    };
    const kickAll = async (
      userId: number,
      accessToken: string,
      status: number,
    ) => {
      await app
        .kickFromRoom(_publicRoom.id, userId, accessToken)
        .expect(status);
      await app
        .kickFromRoom(_privateRoom.id, userId, accessToken)
        .expect(status);
      await app
        .kickFromRoom(_protectedRoom.id, userId, accessToken)
        .expect(status);
    };

    describe('owner', () => {
      beforeEach(setupRooms);
      afterEach(teardownRooms);
      it('should kick admin (204 No Content)', async () => {
        await kickAll(admin.id, owner.accessToken, 204);
      });
      it('should kick member (204 No Content)', async () => {
        await kickAll(member.id, owner.accessToken, 204);
      });
      it('should not kick non-member (404 Not Found)', async () => {
        await kickAll(notMember.id, owner.accessToken, 404);
      });
    });
    describe('admin', () => {
      beforeEach(setupRooms);
      afterEach(teardownRooms);
      it('should not kick owner (403 Forbidden)', async () => {
        await kickAll(owner.id, admin.accessToken, 403);
      });
      it('should kick admin (204 No Content)', async () => {
        await kickAll(admin.id, admin.accessToken, 204);
      });
      it('should kick member (204 No Content)', async () => {
        await kickAll(member.id, admin.accessToken, 204);
      });
      it('should not kick non-member (404 Not Found)', async () => {
        await kickAll(notMember.id, admin.accessToken, 404);
      });
    });
    describe('member', () => {
      beforeEach(setupRooms);
      afterEach(teardownRooms);
      it('should not kick owner (403 Forbidden)', async () => {
        await kickAll(owner.id, member.accessToken, 403);
      });
      it('should not kick admin (403 Forbidden)', async () => {
        await kickAll(admin.id, member.accessToken, 403);
      });
      it('should not kick member (403 No Content)', async () => {
        await kickAll(member.id, member.accessToken, 403);
      });
      it('should not kick non-member (403 Not Found)', async () => {
        await kickAll(notMember.id, member.accessToken, 403);
      });
    });
    describe('non-member', () => {
      beforeEach(setupRooms);
      afterEach(teardownRooms);
      it('should not kick owner (403 Forbidden)', async () => {
        await kickAll(owner.id, notMember.accessToken, 403);
      });
      it('should not kick admin (403 Forbidden)', async () => {
        await kickAll(admin.id, notMember.accessToken, 403);
      });
      it('should not kick member (403 No Content)', async () => {
        await kickAll(member.id, notMember.accessToken, 403);
      });
      it('should not kick non-member (403 Not Found)', async () => {
        await kickAll(notMember.id, notMember.accessToken, 403);
      });
    });
    describe('user1', () => {
      beforeEach(setupRooms);
      afterEach(teardownRooms);
      it('should not kick anyone (403 Forbidden)', async () => {
        await kickAll(user1.id, user1.accessToken, 403);
        await kickAll(user2.id, user1.accessToken, 403);
      });
    });
    describe('user2', () => {
      beforeEach(setupRooms);
      afterEach(teardownRooms);
      it('should not kick anyone (403 Forbidden)', async () => {
        await kickAll(user1.id, user2.accessToken, 403);
        await kickAll(user2.id, user2.accessToken, 403);
      });
    });
  });

  describe('PATCH /room/:id/:userId (Update Role)', () => {
    let _publicRoom, _privateRoom, _protectedRoom, _directRoom: RoomEntity;
    const setupRooms = async () => {
      _publicRoom = await setupRoom(constants.room.publicRoom);
      _privateRoom = await setupRoom(constants.room.privateRoom);
      _protectedRoom = await setupRoom(constants.room.protectedRoom);
      _directRoom = await app
        .createRoom(
          { ...constants.room.directRoom, userIds: [user2.id] },
          user1.accessToken,
        )
        .expect(201)
        .then((res) => res.body);
    };
    const teardownRooms = async () => {
      await app.deleteRoom(_publicRoom.id, owner.accessToken);
      await app.deleteRoom(_privateRoom.id, owner.accessToken);
      await app.deleteRoom(_protectedRoom.id, owner.accessToken);
      await app.deleteRoom(_directRoom.id, user1.accessToken);
    };
    beforeEach(setupRooms);
    afterEach(teardownRooms);
    describe('Owner', () => {
      describe('Target: Owner', () => {
        it('should not update role to admin (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              owner.id,
              { role: Role.ADMINISTRATOR },
              owner.accessToken,
            )
            .expect(403);
        });
        it('should not update role to member (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              owner.id,
              { role: Role.MEMBER },
              owner.accessToken,
            )
            .expect(403);
        });
      });
      describe('Target: Admin', () => {
        it('should update role to member (200 OK)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              admin.id,
              { role: Role.MEMBER },
              owner.accessToken,
            )
            .expect(200);
        });
        it('should not update role to owner (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              admin.id,
              { role: Role.OWNER },
              owner.accessToken,
            )
            .expect(403);
        });
      });
      describe('Target: Member', () => {
        it('should update role to admin (200 OK)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              member.id,
              { role: Role.ADMINISTRATOR },
              owner.accessToken,
            )
            .expect(200);
        });
        it('should not update role to owner (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              member.id,
              { role: Role.OWNER },
              owner.accessToken,
            )
            .expect(403);
        });
      });
      describe('Target: Non-member', () => {
        it('should not update role to admin (404 Not Found)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              notMember.id,
              { role: Role.ADMINISTRATOR },
              owner.accessToken,
            )
            .expect(404);
        });
        it('should not update role to member (404 Not Found)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              notMember.id,
              { role: Role.MEMBER },
              owner.accessToken,
            )
            .expect(404);
        });
        it('should not update role to owner (404 Not Found)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              notMember.id,
              { role: Role.OWNER },
              owner.accessToken,
            )
            .expect(404);
        });
      });
    });
    describe('Admin', () => {
      beforeAll(setupRooms);
      afterAll(teardownRooms);
      describe('Target: Owner', () => {
        it('should not update role to admin (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              owner.id,
              { role: Role.ADMINISTRATOR },
              admin.accessToken,
            )
            .expect(403);
        });
        it('should not update role to member (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              owner.id,
              { role: Role.MEMBER },
              admin.accessToken,
            )
            .expect(403);
        });
      });
      describe('Target: Admin', () => {
        it('should update role to member (200 OK)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              admin.id,
              { role: Role.MEMBER },
              admin.accessToken,
            )
            .expect(200);
        });
        it('should not update role to owner (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              admin.id,
              { role: Role.OWNER },
              admin.accessToken,
            )
            .expect(403);
        });
      });
      describe('Target: Member', () => {
        it('should update role to admin (200 OK)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              member.id,
              { role: Role.ADMINISTRATOR },
              admin.accessToken,
            )
            .expect(200);
        });
        it('should not update role to owner (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              member.id,
              { role: Role.OWNER },
              admin.accessToken,
            )
            .expect(403);
        });
      });
      describe('Target: Non-member', () => {
        it('should not update role to admin (404 Not Found)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              notMember.id,
              { role: Role.ADMINISTRATOR },
              admin.accessToken,
            )
            .expect(404);
        });
        it('should not update role to member (404 Not Found)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              notMember.id,
              { role: Role.MEMBER },
              admin.accessToken,
            )
            .expect(404);
        });
        it('should not update role to owner (404 Not Found)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              notMember.id,
              { role: Role.OWNER },
              admin.accessToken,
            )
            .expect(404);
        });
      });
    });
    describe('Member', () => {
      describe('Target: Owner', () => {
        it('should not update role to admin (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              owner.id,
              { role: Role.ADMINISTRATOR },
              member.accessToken,
            )
            .expect(403);
        });
      });
      describe('Target: Admin', () => {
        it('should not update role to member (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              admin.id,
              { role: Role.MEMBER },
              member.accessToken,
            )
            .expect(403);
        });
      });
      describe('Target: Member', () => {
        it('should not update role to admin (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              member.id,
              { role: Role.ADMINISTRATOR },
              member.accessToken,
            )
            .expect(403);
        });
      });
      describe('Target: Non-member', () => {
        it('should not update role to member (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              notMember.id,
              { role: Role.MEMBER },
              member.accessToken,
            )
            .expect(403);
        });
      });
    });
    describe('Non-member', () => {
      describe('Target: Owner', () => {
        it('should not update role to admin (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              owner.id,
              { role: Role.ADMINISTRATOR },
              notMember.accessToken,
            )
            .expect(403);
        });
      });
      describe('Target: Admin', () => {
        it('should not update role to member (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              admin.id,
              { role: Role.MEMBER },
              notMember.accessToken,
            )
            .expect(403);
        });
      });
      describe('Target: Member', () => {
        it('should not update role to admin (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              member.id,
              { role: Role.ADMINISTRATOR },
              notMember.accessToken,
            )
            .expect(403);
        });
      });
      describe('Target: Non-member', () => {
        it('should not update role to member (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _publicRoom.id,
              notMember.id,
              { role: Role.MEMBER },
              notMember.accessToken,
            )
            .expect(403);
        });
      });
      describe('Target: User1', () => {
        it('should not update role to member (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _directRoom.id,
              user1.id,
              { role: Role.MEMBER },
              notMember.accessToken,
            )
            .expect(403);
        });
      });
    });
    describe('User1', () => {
      describe('Target: User1', () => {
        it('should not update role to member (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _directRoom.id,
              user1.id,
              { role: Role.MEMBER },
              user1.accessToken,
            )
            .expect(403);
        });
      });
      describe('Target: User2', () => {
        it('should not update role to member (403 Forbidden)', async () => {
          await app
            .updateUserOnRoom(
              _directRoom.id,
              user2.id,
              { role: Role.MEMBER },
              user1.accessToken,
            )
            .expect(403);
        });
      });
    });
  });

  describe('PUT /room/:id/bans/:userId (Ban user)', () => {
    describe('Owner', () => {
      let _publicRoom: RoomEntity;
      beforeAll(async () => {
        _publicRoom = await setupRoom(constants.room.publicRoom);
      });
      afterAll(async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken);
      });
      it('should ban admin in the room (200 OK)', async () => {
        await app
          .banUser(_publicRoom.id, admin.id, owner.accessToken)
          .expect(200);
      });
      it('should ban member in the room (200 OK)', async () => {
        await app
          .banUser(_publicRoom.id, member.id, owner.accessToken)
          .expect(200);
      });
      it('should ban non-member (200 OK)', async () => {
        await app
          .banUser(_publicRoom.id, notMember.id, owner.accessToken)
          .expect(200);
      });
    });
    describe('Admin', () => {
      let _publicRoom: RoomEntity;
      let _admin2: UserEntityWithAccessToken;
      beforeAll(async () => {
        const dto = {
          ...constants.user.admin,
          name: 'admin2',
          email: 'admin2@example.com',
        };
        _admin2 = await app.createAndLoginUser(dto);
        _publicRoom = await setupRoom(constants.room.publicRoom);
        await app.inviteRoom(_publicRoom.id, _admin2.id, admin.accessToken);
      });
      afterAll(async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken);
        await app.deleteUser(_admin2.id, _admin2.accessToken).expect(204);
      });
      it('should not ban owner in the room (403 Forbidden)', async () => {
        await app
          .banUser(_publicRoom.id, owner.id, admin.accessToken)
          .expect(403);
      });
      it('should ban admin in the room (200 OK)', async () => {
        await app
          .banUser(_publicRoom.id, _admin2.id, admin.accessToken)
          .expect(200);
      });
      it('should ban member in the room (200 OK)', async () => {
        await app
          .banUser(_publicRoom.id, member.id, admin.accessToken)
          .expect(200);
      });
      it('should ban non-member (200 OK)', async () => {
        await app
          .banUser(_publicRoom.id, notMember.id, admin.accessToken)
          .expect(200);
      });
    });
    describe('Member', () => {
      let _publicRoom: RoomEntity;
      beforeAll(async () => {
        _publicRoom = await setupRoom(constants.room.publicRoom);
      });
      afterAll(async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken);
      });
      it('should not ban owner in the room (403 Forbidden)', async () => {
        await app
          .banUser(_publicRoom.id, owner.id, member.accessToken)
          .expect(403);
      });
      it('should not ban admin in the room (403 Forbidden)', async () => {
        await app
          .banUser(_publicRoom.id, admin.id, member.accessToken)
          .expect(403);
      });
      it('should not ban member in the room (403 Forbidden)', async () => {
        await app
          .banUser(_publicRoom.id, member.id, member.accessToken)
          .expect(403);
      });
      it('should not ban anyone who is not in the room (404 Not Found)', async () => {
        await app
          .banUser(_publicRoom.id, notMember.id, member.accessToken)
          .expect(403);
      });
    });
    describe('Non-member', () => {
      let _publicRoom: RoomEntity;
      beforeAll(async () => {
        _publicRoom = await setupRoom(constants.room.publicRoom);
      });
      afterAll(async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken);
      });
      it('should not ban owner in the room (403 Forbidden)', async () => {
        await app
          .banUser(_publicRoom.id, owner.id, notMember.accessToken)
          .expect(403);
      });
      it('should not ban admin in the room (403 Forbidden)', async () => {
        await app
          .banUser(_publicRoom.id, admin.id, notMember.accessToken)
          .expect(403);
      });
      it('should not ban member in the room (403 Forbidden)', async () => {
        await app
          .banUser(_publicRoom.id, member.id, notMember.accessToken)
          .expect(403);
      });
      it('should not ban anyone who is not in the room (404 Not Found)', async () => {
        await app
          .banUser(_publicRoom.id, notMember.id, notMember.accessToken)
          .expect(403);
      });
    });
    describe('User1', () => {
      let _directRoom: RoomEntity;
      beforeEach(async () => {
        _directRoom = await app
          .createRoom(
            { ...constants.room.directRoom, userIds: [user2.id] },
            user1.accessToken,
          )
          .expect(201)
          .then((res) => res.body);
      });
      afterEach(async () => {
        await app.deleteRoom(_directRoom.id, user1.accessToken);
      });
      it('should not ban user2 (400 Bad Request)', async () => {
        await app
          .banUser(_directRoom.id, user2.id, user1.accessToken)
          .expect(400);
      });
      it('shoud not ban non-member in DIRECT room (400 Bad Request)', async () => {
        await app
          .banUser(_directRoom.id, notMember.id, user1.accessToken)
          .expect(400);
      });
    });
    describe('Ban Scenario', () => {
      let _publicRoom: RoomEntity;
      let _user: UserEntityWithAccessToken;
      beforeAll(async () => {
        _user = await app.createAndLoginUser({
          name: 'BANNED USER',
          email: 'banned@example.com',
          password: '12345678',
        });
        _publicRoom = await app
          .createRoom(constants.room.publicRoom, owner.accessToken)
          .then((res) => res.body);
      });
      afterAll(async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken).expect(204);
        await app.deleteUser(_user.id, _user.accessToken).expect(204);
      });
      // It is okay to ban user who is not in the room
      it('should ban user who is not in the room (200 OK)', async () => {
        await app
          .banUser(_publicRoom.id, notMember.id, owner.accessToken)
          .expect(200);
      });
      it('should invite user to the room (200 OK)', async () => {
        await app
          .inviteRoom(_publicRoom.id, _user.id, owner.accessToken)
          .expect(201);
      });
      it('should ban user (200 OK)', async () => {
        await app
          .banUser(_publicRoom.id, _user.id, owner.accessToken)
          .expect(200);
      });
      test('banned user should not be in the room anymore (404 Not Found)', async () => {
        await app
          .getUserOnRoom(_publicRoom.id, _user.id, owner.accessToken)
          .expect(404);
      });
      // It is okay to ban user who is already banned
      it('should not ban user who is already banned (409 Conflict)', async () => {
        await app
          .banUser(_publicRoom.id, _user.id, owner.accessToken)
          .expect(409);
      });
      it('should not invite banned user to the room (403 Forbidden)', async () => {
        await app
          .inviteRoom(_publicRoom.id, _user.id, owner.accessToken)
          .expect(403);
      });
      test('banned user should not be able to enter the room (403 Forbidden)', async () => {
        await app.enterRoom(_publicRoom.id, _user.accessToken).expect(403);
      });
      test('banned user should not get the room (404 Not Found)', async () => {
        await app.getRoom(_publicRoom.id, _user.accessToken).expect(404);
      });
      test('banned user should not get the room in the list (200 OK)', async () => {
        const rooms = await app
          .getRooms(_user.accessToken)
          .expect(200)
          .then((res) => res.body);
        rooms.forEach((room) => expect(room).not.toEqual(_publicRoom));
      });
    });
  });

  describe('GET /room/:id/bans (Get banned users)', () => {
    describe('Owner', () => {
      let _publicRoom: RoomEntity;
      let bannedUser: UserEntityWithAccessToken;
      beforeAll(async () => {
        bannedUser = await app.createAndLoginUser({
          name: 'BANNED USER',
          email: 'banned@example.com',
          password: '12345678',
        });
        _publicRoom = await setupRoom(constants.room.publicRoom);
      });
      afterAll(async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken).expect(204);
        await app.deleteUser(bannedUser.id, bannedUser.accessToken).expect(204);
      });
      it('should get empty array when no banned users in the room (200 OK)', async () => {
        const res = await app
          .getBannedUsers(_publicRoom.id, owner.accessToken)
          .expect(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body).toHaveLength(0);
      });
      it('Ban user', async () => {
        await app
          .banUser(_publicRoom.id, bannedUser.id, owner.accessToken)
          .expect(200);
      });
      it('should get banned users (200 OK)', async () => {
        const res = await app
          .getBannedUsers(_publicRoom.id, owner.accessToken)
          .expect(200);
        expect(res.body).toBeInstanceOf(Array);
        res.body.forEach(expectPublicUser);
        const publicBannedUser = {
          id: bannedUser.id,
          name: bannedUser.name,
          avatarURL: bannedUser.avatarURL,
        };
        expect(res.body).toContainEqual(publicBannedUser);
      });
    });
    describe('Admin', () => {
      it('should get banned users (200 OK)', async () => {
        await app.getBannedUsers(publicRoom.id, admin.accessToken).expect(200);
      });
    });
    describe('Member', () => {
      it('should not get banned users (403 Forbidden)', async () => {
        await app.getBannedUsers(publicRoom.id, member.accessToken).expect(403);
      });
    });
    describe('Non-member', () => {
      it('should not get banned users (403 Forbidden)', async () => {
        await app
          .getBannedUsers(publicRoom.id, notMember.accessToken)
          .expect(403);
      });
    });
  });

  describe('DELETE /room/:id/bans/:userId (Unban user)', () => {
    describe('Owner', () => {
      let _publicRoom: RoomEntity;
      let _user: UserEntityWithAccessToken;
      beforeAll(async () => {
        _user = await app.createAndLoginUser({
          name: 'BANNED USER',
          email: 'banned@example.com',
          password: '12345678',
        });
        _publicRoom = await setupRoom(constants.room.publicRoom);
        await app.inviteRoom(_publicRoom.id, _user.id, owner.accessToken);
        await app
          .banUser(_publicRoom.id, _user.id, owner.accessToken)
          .expect(200);
      });
      afterAll(async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken).expect(204);
        await app.deleteUser(_user.id, _user.accessToken).expect(204);
      });
      it('should unban user (200 OK)', async () => {
        await app
          .unbanUser(_publicRoom.id, _user.id, owner.accessToken)
          .expect(200);
      });
      test('unbanned user should not be in the room until re-enter (404 Not Found)', async () => {
        await app
          .getUserOnRoom(_publicRoom.id, _user.id, owner.accessToken)
          .expect(404);
      });
      test('unbanned user should join the room (201 Created)', async () => {
        await app.enterRoom(_publicRoom.id, _user.accessToken).expect(201);
      });
      it('should not unban user who is not banned (404 Not Found)', async () => {
        await app
          .unbanUser(_publicRoom.id, member.id, owner.accessToken)
          .expect(404);
      });
    });
    describe('Admin', () => {
      let _publicRoom: RoomEntity;
      let _user: UserEntityWithAccessToken;
      beforeAll(async () => {
        _user = await app.createAndLoginUser({
          name: 'BANNED USER',
          email: 'banned@example.com',
          password: '12345678',
        });
        _publicRoom = await setupRoom(constants.room.publicRoom);
        await app.inviteRoom(_publicRoom.id, _user.id, owner.accessToken);
        await app
          .banUser(_publicRoom.id, _user.id, owner.accessToken)
          .expect(200);
      });
      afterAll(async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken).expect(204);
        await app.deleteUser(_user.id, _user.accessToken).expect(204);
      });
      it('should unban user (200 OK)', async () => {
        await app
          .unbanUser(_publicRoom.id, _user.id, admin.accessToken)
          .expect(200);
      });
      test('unbanned user should not be in the room until re-enter (404 Not Found)', async () => {
        await app
          .getUserOnRoom(_publicRoom.id, _user.id, admin.accessToken)
          .expect(404);
      });
      test('unbanned user should join the room (201 Created)', async () => {
        await app.enterRoom(_publicRoom.id, _user.accessToken).expect(201);
      });
      it('should not unban user who is not banned (404 Not Found)', async () => {
        await app
          .unbanUser(_publicRoom.id, member.id, admin.accessToken)
          .expect(404);
      });
    });
    describe('Member', () => {
      let _publicRoom: RoomEntity;
      let _user: UserEntityWithAccessToken;
      beforeAll(async () => {
        _user = await app.createAndLoginUser({
          name: 'BANNED USER',
          email: 'banned@example.com',
          password: '12345678',
        });
        _publicRoom = await setupRoom(constants.room.publicRoom);
        await app.inviteRoom(_publicRoom.id, _user.id, owner.accessToken);
        await app
          .banUser(_publicRoom.id, _user.id, owner.accessToken)
          .expect(200);
      });
      afterAll(async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken).expect(204);
        await app.deleteUser(_user.id, _user.accessToken).expect(204);
      });
      it('should not unban user (403 Forbidden)', async () => {
        await app
          .unbanUser(_publicRoom.id, _user.id, member.accessToken)
          .expect(403);
      });
    });
    it('notMember should not unban anyone', async () => {});
  });

  describe('PUT /room/:id/mutes/:userId (Mute user)', () => {
    const duration = 3;
    describe('Owner', () => {
      let _publicRoom: RoomEntity;
      beforeAll(async () => {
        _publicRoom = await setupRoom(constants.room.publicRoom);
      });
      afterAll(async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken);
      });
      it('should mute anyone in the room (200 OK)', async () => {
        await app
          .muteUser(_publicRoom.id, admin.id, owner.accessToken, duration)
          .expect(200);
        await app
          .muteUser(_publicRoom.id, member.id, owner.accessToken, duration)
          .expect(200);
      });
    });
    describe('Admin', () => {
      let _publicRoom: RoomEntity;
      let _admin2: UserEntityWithAccessToken;
      beforeAll(async () => {
        const dto = {
          ...constants.user.admin,
          name: 'admin2',
          email: 'admin2@example.com',
        };
        _admin2 = await app.createAndLoginUser(dto);
        _publicRoom = await setupRoom(constants.room.publicRoom);
        await app.inviteRoom(_publicRoom.id, _admin2.id, admin.accessToken);
      });
      afterAll(async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken);
        await app.deleteUser(_admin2.id, _admin2.accessToken).expect(204);
      });
      it('should not mute owner (403 Forbidden)', async () => {
        await app
          .muteUser(_publicRoom.id, owner.id, admin.accessToken, duration)
          .expect(403);
      });
      it('should mute admin/member in the room (200 OK)', async () => {
        await app
          .muteUser(_publicRoom.id, _admin2.id, admin.accessToken, duration)
          .expect(200);
        await app
          .muteUser(_publicRoom.id, member.id, admin.accessToken, duration)
          .expect(200);
      });
    });
    describe('Member', () => {
      let _publicRoom: RoomEntity;
      let _member2: UserEntityWithAccessToken;
      beforeAll(async () => {
        const dto = {
          ...constants.user.member,
          name: 'member3',
          email: 'member3@example.com',
        };
        _member2 = await app.createAndLoginUser(dto);
        _publicRoom = await setupRoom(constants.room.publicRoom);
        await app.inviteRoom(_publicRoom.id, _member2.id, admin.accessToken);
      });
      afterAll(async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken);
        await app.deleteUser(_member2.id, _member2.accessToken).expect(204);
      });
      it('should not mute anyone (403 Forbidden)', async () => {
        await app
          .muteUser(_publicRoom.id, owner.id, member.accessToken, duration)
          .expect(403);
        await app
          .muteUser(_publicRoom.id, admin.id, member.accessToken, duration)
          .expect(403);
        await app
          .muteUser(_publicRoom.id, _member2.id, member.accessToken, duration)
          .expect(403);
        await app
          .muteUser(_publicRoom.id, notMember.id, member.accessToken, duration)
          .expect(403);
      });
    });
    describe('Non-member', () => {
      let _publicRoom: RoomEntity;
      beforeAll(async () => {
        _publicRoom = await setupRoom(constants.room.publicRoom);
      });
      afterAll(async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken);
      });
      it('should not mute anyone (403 Forbidden)', async () => {
        await app
          .muteUser(_publicRoom.id, owner.id, notMember.accessToken, duration)
          .expect(403);
        await app
          .muteUser(_publicRoom.id, admin.id, notMember.accessToken, duration)
          .expect(403);
        await app
          .muteUser(_publicRoom.id, member.id, notMember.accessToken, duration)
          .expect(403);
        await app
          .muteUser(
            _publicRoom.id,
            notMember.id,
            notMember.accessToken,
            duration,
          )
          .expect(403);
      });
    });

    describe('Mute Scenario', () => {
      let _publicRoom: RoomEntity;
      beforeAll(async () => {
        _publicRoom = await setupRoom(constants.room.publicRoom);
      });
      afterAll(async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken);
      });
      it('should mute user (200 OK)', async () => {
        await app
          .muteUser(_publicRoom.id, member.id, owner.accessToken, duration)
          .expect(200);
      });
      it('should not mute user who is already muted (409 Conflict)', async () => {
        await app
          .muteUser(_publicRoom.id, member.id, owner.accessToken, duration)
          .expect(409);
        await app
          .muteUser(_publicRoom.id, member.id, admin.accessToken, duration)
          .expect(409);
      });
      it('should mute user after the duration (200 OK)', async () => {
        await new Promise((r) => setTimeout(r, 5000));
        await app
          .muteUser(_publicRoom.id, member.id, owner.accessToken, duration)
          .expect(200);
      }, 6000);
      it('should mute user forever (200 OK)', async () => {
        await app
          .muteUser(_publicRoom.id, admin.id, owner.accessToken)
          .expect(200);
      });
      it('should not mute user who is already muted forever (409 Conflict)', async () => {
        await app
          .muteUser(_publicRoom.id, admin.id, owner.accessToken)
          .expect(409);
      });
      it('should not mute user who is not in the room (404 Not Found)', async () => {
        await app
          .muteUser(_publicRoom.id, notMember.id, owner.accessToken, duration)
          .expect(404);
        await app
          .muteUser(_publicRoom.id, notMember.id, admin.accessToken, duration)
          .expect(404);
      });
    });
  });

  describe('GET /room/:id/mutes (Get muted users)', () => {
    let _publicRoom: RoomEntity;
    let mutedUser: UserEntityWithAccessToken;
    beforeAll(async () => {
      mutedUser = await app.createAndLoginUser({
        name: 'MUTED USER',
        email: 'muted@example.com',
        password: '12345678',
      });
      _publicRoom = await setupRoom(constants.room.publicRoom);
      await app.inviteRoom(_publicRoom.id, mutedUser.id, owner.accessToken);
    });
    afterAll(async () => {
      await app.deleteRoom(_publicRoom.id, owner.accessToken).expect(204);
      await app.deleteUser(mutedUser.id, mutedUser.accessToken).expect(204);
    });
    describe('Owner', () => {
      it('should get empty array when no muted users in the room (200 OK)', async () => {
        const res = await app
          .getMutedUsers(_publicRoom.id, owner.accessToken)
          .expect(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body).toHaveLength(0);
      });
      it('should mute user (200 OK)', async () => {
        await app
          .muteUser(_publicRoom.id, mutedUser.id, owner.accessToken, 1)
          .expect(200);
      });
      it('should get muted users (200 OK)', async () => {
        const res = await app
          .getMutedUsers(_publicRoom.id, owner.accessToken)
          .expect(200);
        expect(res.body).toBeInstanceOf(Array);
        res.body.forEach(expectPublicUser);
        const publicMutedUser = {
          id: mutedUser.id,
          name: mutedUser.name,
          avatarURL: mutedUser.avatarURL,
        };
        expect(res.body).toContainEqual(publicMutedUser);
      });
    });
    describe('Admin', () => {
      it('should get muted users (200 OK)', async () => {
        await app.getMutedUsers(_publicRoom.id, admin.accessToken).expect(200);
      });
    });
    describe('Member', () => {
      it('should not get muted users (403 Forbidden)', async () => {
        await app.getMutedUsers(_publicRoom.id, member.accessToken).expect(403);
      });
    });
    describe('Non-member', () => {
      it('should not get muted users (403 Forbidden)', async () => {
        await app
          .getMutedUsers(_publicRoom.id, notMember.accessToken)
          .expect(403);
      });
    });
    describe('Owner and Admin', () => {
      it('should get empty array after the duration (200 OK)', (done) => {
        setTimeout(async () => {
          const res = await app
            .getMutedUsers(_publicRoom.id, owner.accessToken)
            .expect(200);
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body).toHaveLength(0);
          const res2 = await app
            .getMutedUsers(_publicRoom.id, admin.accessToken)
            .expect(200);
          expect(res2.body).toBeInstanceOf(Array);
          expect(res2.body).toHaveLength(0);
          done();
        }, 2000);
      });
    });
  });

  describe('DELETE /room/:id/mutes/:userId (Unmute user)', () => {
    describe('Owner', () => {
      let _publicRoom: RoomEntity;
      beforeAll(async () => {
        _publicRoom = await setupRoom(constants.room.publicRoom);
        await app
          .muteUser(_publicRoom.id, admin.id, owner.accessToken, 10)
          .expect(200);
        await app
          .muteUser(_publicRoom.id, member.id, owner.accessToken, 10)
          .expect(200);
      });
      afterAll(async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken).expect(204);
      });
      it('should unmute anyone in the room (200 OK)', async () => {
        await app
          .unmuteUser(_publicRoom.id, admin.id, owner.accessToken)
          .expect(200);
        await app
          .unmuteUser(_publicRoom.id, member.id, owner.accessToken)
          .expect(200);
      });
      it('should not unmute non-member (404 Not Found)', async () => {
        await app
          .unmuteUser(_publicRoom.id, notMember.id, owner.accessToken)
          .expect(404);
      });
    });
    describe('Admin', () => {
      let _publicRoom: RoomEntity;
      let _admin2: UserEntityWithAccessToken;
      beforeAll(async () => {
        const dto = {
          ...constants.user.admin,
          name: 'admin2',
          email: 'admin2@example.com',
          password: '12345678',
        };
        _admin2 = await app.createAndLoginUser(dto);
        _publicRoom = await setupRoom(constants.room.publicRoom);
        await app.inviteRoom(_publicRoom.id, _admin2.id, admin.accessToken);
        await app
          .muteUser(_publicRoom.id, _admin2.id, admin.accessToken, 10)
          .expect(200);
        await app
          .muteUser(_publicRoom.id, member.id, admin.accessToken, 10)
          .expect(200);
      });
      afterAll(async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken).expect(204);
        await app.deleteUser(_admin2.id, _admin2.accessToken).expect(204);
      });
      it('should not unmute owner in the room (404 Not Found)', async () => {
        await app
          .unmuteUser(_publicRoom.id, owner.id, admin.accessToken)
          .expect(404);
      });
      it('should unmute admin/member (200 OK)', async () => {
        await app
          .unmuteUser(_publicRoom.id, _admin2.id, admin.accessToken)
          .expect(200);
        await app
          .unmuteUser(_publicRoom.id, member.id, admin.accessToken)
          .expect(200);
      });
      it('should not unmute non-member (404 Not Found)', async () => {
        await app
          .unmuteUser(_publicRoom.id, notMember.id, admin.accessToken)
          .expect(404);
      });
    });
    describe('Member', () => {
      let _publicRoom: RoomEntity;
      let _member2: UserEntityWithAccessToken;
      beforeAll(async () => {
        const dto = {
          ...constants.user.member,
          name: 'member3',
          email: 'member3@example.com',
          password: '12345678',
        };
        _member2 = await app.createAndLoginUser(dto);
        _publicRoom = await setupRoom(constants.room.publicRoom);
        await app.inviteRoom(_publicRoom.id, _member2.id, admin.accessToken);
        await app
          .muteUser(_publicRoom.id, admin.id, owner.accessToken, 10)
          .expect(200);
        await app
          .muteUser(_publicRoom.id, _member2.id, owner.accessToken, 10)
          .expect(200);
      });
      afterAll(async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken).expect(204);
        await app.deleteUser(_member2.id, _member2.accessToken).expect(204);
      });
      it('should not unmute anyone (403 Forbidden)', async () => {
        await app
          .unmuteUser(_publicRoom.id, owner.id, member.accessToken)
          .expect(403);
        await app
          .unmuteUser(_publicRoom.id, admin.id, member.accessToken)
          .expect(403);
        await app
          .unmuteUser(_publicRoom.id, _member2.id, member.accessToken)
          .expect(403);
        await app
          .unmuteUser(_publicRoom.id, notMember.id, member.accessToken)
          .expect(403);
      });
    });
    describe('Non-member', () => {
      let _publicRoom: RoomEntity;
      beforeAll(async () => {
        _publicRoom = await setupRoom(constants.room.publicRoom);
        await app
          .muteUser(_publicRoom.id, admin.id, owner.accessToken, 10)
          .expect(200);
        await app
          .muteUser(_publicRoom.id, member.id, owner.accessToken, 10)
          .expect(200);
      });
      afterAll(async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken).expect(204);
      });
      it('should not unmute anyone (403 Forbidden)', async () => {
        await app
          .unmuteUser(_publicRoom.id, owner.id, notMember.accessToken)
          .expect(403);
        await app
          .unmuteUser(_publicRoom.id, admin.id, notMember.accessToken)
          .expect(403);
        await app
          .unmuteUser(_publicRoom.id, member.id, notMember.accessToken)
          .expect(403);
        await app
          .unmuteUser(_publicRoom.id, notMember.id, notMember.accessToken)
          .expect(403);
      });
    });
  });
});
