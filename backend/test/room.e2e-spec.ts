import { Role } from '@prisma/client';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { UpdateUserOnRoomDto } from 'src/room/dto/update-UserOnRoom.dto';
import { UpdateRoomDto } from 'src/room/dto/update-room.dto';
import { RoomEntity } from 'src/room/entities/room.entity';
import supertest from 'supertest';
import { constants } from './constants';
import { TestApp, UserEntityWithAccessToken } from './utils/app';
import { initializeApp } from './utils/initialize';
import { expectRoom } from './utils/matcher';

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
  const ownerRef: Ref<UserEntityWithAccessToken> = new Ref();
  const adminRef: Ref<UserEntityWithAccessToken> = new Ref();
  const memberRef: Ref<UserEntityWithAccessToken> = new Ref();
  const nonMemberRef: Ref<UserEntityWithAccessToken> = new Ref();

  let publicRoom, privateRoom, protectedRoom: RoomEntity;
  const publicRoomRef: Ref<RoomEntity> = new Ref();
  const privateRoomRef: Ref<RoomEntity> = new Ref();
  const protectedRoomRef: Ref<RoomEntity> = new Ref();
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
  });

  afterAll(async () => {
    // Delete room created by owner
    await app.deleteRoom(publicRoom.id, owner.accessToken);
    await app.deleteRoom(privateRoom.id, owner.accessToken);
    await app.deleteRoom(protectedRoom.id, owner.accessToken);
    // Delete users
    for (const user of [owner, admin, member, notMember]) {
      await app.deleteUser(user.id, user.accessToken);
    }
  });

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

    afterAll(async () => {
      await app.deleteRoom(_publicRoom.id, owner.accessToken);
      await app.deleteRoom(_privateRoom.id, owner.accessToken);
      await app.deleteRoom(_protectedRoom.id, owner.accessToken);
      await app.deleteRoom(_duplicatedRoom.id, owner.accessToken);
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
      let dtoWithoutPassword = { ...constants.room.protectedRoom };
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
    });

    describe('notMember', () => {
      it('should get public room', () => {
        return app.getRoom(publicRoom.id, notMember.accessToken).expect(200);
      });
      it('should get protected room', () => {
        return app.getRoom(protectedRoom.id, notMember.accessToken).expect(200);
      });
      it('should not get private room', () => {
        return app.getRoom(privateRoom.id, notMember.accessToken).expect(403);
      });
    });

    it('public room should be accessed by notMember (200 OK)', async () => {});

    it('private room should not be accessed by notMember (403 Forbidden)', async () => {});

    it('protected room should not be accessed by notMember (403 Forbidden)', async () => {});

    it('invalid roomId should return 404 Not Found (403?)', async () => {});
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
      it('should get all rooms (200 OK)', async () => {
        await testGetRooms(owner.accessToken).expect((res) => {
          expect(res.body).toContainEqual(privateRoom);
        });
      });
    });
    describe('admin', () => {
      it('should get all rooms (200 OK)', async () => {
        await testGetRooms(admin.accessToken).expect((res) => {
          expect(res.body).toContainEqual(privateRoom);
        });
      });
    });
    describe('member', () => {
      it('should get all rooms (200 OK)', async () => {
        await testGetRooms(member.accessToken).expect((res) => {
          expect(res.body).toContainEqual(privateRoom);
        });
      });
    });
    describe('non-member', () => {
      it('should not get private rooms (200 OK)', async () => {
        await testGetRooms(notMember.accessToken).expect((res) => {
          const expectNotPrivate = (room: RoomEntity) =>
            expect(room.accessLevel).not.toEqual('PRIVATE');
          res.body.forEach(expectNotPrivate);
        });
      });
    });
  });

  const setupRoom = async (dto: CreateRoomDto) => {
    const room = await app
      .createRoom(dto, owner.accessToken)
      .expect(201)
      .then((res) => res.body);
    await app.inviteRoom(room.id, member.id, owner.accessToken);
    await app.inviteRoom(room.id, admin.id, owner.accessToken);
    await app.updateUserOnRoom(
      room.id,
      admin.id,
      { role: Role.ADMINISTRATOR },
      owner.accessToken,
    );
    return room;
  };

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
      let _roomRef: Ref<RoomEntity> = new Ref();
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

    it('invalid roomId should return 404 Not Found', async () => {});
  });

  describe('DELETE /room/:id (Delete Room)', () => {
    let _publicRoom, _privateRoom, _protectedRoom: RoomEntity;
    const setupRooms = async () => {
      _publicRoom = await setupRoom(constants.room.publicRoom);
      _privateRoom = await setupRoom(constants.room.privateRoom);
      _protectedRoom = await setupRoom(constants.room.protectedRoom);
    };
    const teardownRooms = async () => {
      await app.deleteRoom(_publicRoom.id, owner.accessToken);
      await app.deleteRoom(_privateRoom.id, owner.accessToken);
      await app.deleteRoom(_protectedRoom.id, owner.accessToken);
    };
    describe('owner', () => {
      beforeAll(setupRooms);
      afterAll(teardownRooms);
      test('should delete public room (204 No Content)', async () => {
        await app.deleteRoom(_publicRoom.id, owner.accessToken).expect(204);
      });
      test('should delete private room (204 No Content)', async () => {
        await app.deleteRoom(_privateRoom.id, owner.accessToken).expect(204);
      });
      test('should delete protected room (204 No Content)', async () => {
        await app.deleteRoom(_protectedRoom.id, owner.accessToken).expect(204);
      });
    });

    describe('admin', () => {
      beforeAll(setupRooms);
      afterAll(teardownRooms);
      test('should not delete public room (403 Forbidden)', async () => {
        await app.deleteRoom(_publicRoom.id, admin.accessToken).expect(403);
      });
      test('should not delete private room (403 Forbidden)', async () => {
        await app.deleteRoom(_privateRoom.id, admin.accessToken).expect(403);
      });
      test('should not delete protected room (403 Forbidden)', async () => {
        await app.deleteRoom(_protectedRoom.id, admin.accessToken).expect(403);
      });
    });

    describe('member', () => {
      beforeAll(setupRooms);
      afterAll(teardownRooms);
      test('should not delete public room (403 Forbidden)', async () => {
        await app.deleteRoom(_publicRoom.id, member.accessToken).expect(403);
      });
      test('should not delete private room (403 Forbidden)', async () => {
        await app.deleteRoom(_privateRoom.id, member.accessToken).expect(403);
      });
      test('should not delete protected room (403 Forbidden)', async () => {
        await app.deleteRoom(_protectedRoom.id, member.accessToken).expect(403);
      });
    });

    describe('non-member', () => {
      beforeAll(setupRooms);
      afterAll(teardownRooms);
      test('should not delete public room (403 Forbidden)', async () => {
        await app.deleteRoom(_publicRoom.id, notMember.accessToken).expect(403);
      });
      test('should not delete private room (403 Forbidden)', async () => {
        await app
          .deleteRoom(_privateRoom.id, notMember.accessToken)
          .expect(403);
      });
      test('should not delete protected room (403 Forbidden)', async () => {
        await app
          .deleteRoom(_protectedRoom.id, notMember.accessToken)
          .expect(403);
      });
    });

    it('invalid roomId should return 404 Not Found', async () => {});
  });

  // leave / kick
  describe('DELETE /room/:id/:userId (Leave)', () => {
    let _publicRoom, _privateRoom, _protectedRoom: RoomEntity;
    const setupRooms = async () => {
      _publicRoom = await setupRoom(constants.room.publicRoom);
      _privateRoom = await setupRoom(constants.room.privateRoom);
      _protectedRoom = await setupRoom(constants.room.protectedRoom);
    };
    const teardownRooms = async () => {
      await app.deleteRoom(_publicRoom.id, owner.accessToken);
      await app.deleteRoom(_privateRoom.id, owner.accessToken);
      await app.deleteRoom(_protectedRoom.id, owner.accessToken);
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
  });
  describe('DELETE /room/:id/kick/:userId (Kick)', () => {});
  const testRoomSetup = async (): Promise<number> => {
    // Owner
    const roomId = await app
      .createRoom(constants.room.publicRoom, owner.accessToken)
      .expect(201)
      .then((res) => res.body.id);
    // Admin
    await app.enterRoom(roomId, admin.accessToken).expect(201);
    const role = Role.ADMINISTRATOR;
    await app
      .updateUserOnRoom(roomId, admin.id, { role }, owner.accessToken)
      .expect(200);
    // Member
    await app.enterRoom(roomId, member.accessToken).expect(201);
    // Not Member
    return roomId;
  };

  describe('POST /room/:id/bans/:userId (Ban user)', () => {
    it('owner should ban anyone in the room', async () => {});
    it('admin should ban admin/member', async () => {});
    it('member should not ban anyone', async () => {});
    it('notMember should not ban anyone', async () => {});

    it('banned user is not in the room anymore', async () => {});
    it('banned user should not enter the room again', async () => {});

    // It is okay to ban user who is already banned
    // it('should not ban user who is already banned', async () => {});
    // It is okay to ban user who is not in the room
    // it('should not ban user who is not in the room (400)', async () => {});
  });

  describe('DELETE /room/:id/bans/:userId (Unban user)', () => {
    it('owner should unban anyone in the room', async () => {});
    it('admin should unban admin/member', async () => {});
    it('member should not unban anyone', async () => {});
    it('notMember should not unban anyone', async () => {});

    it('unbanned user is not in the room anymore', async () => {});
    it('unbanned user should enter the room again', async () => {});
  });

  describe('POST /room/:id/mutes/:userId (Mute user)', () => {
    it('owner should mute anyone in the room', async () => {});
    it('admin should mute admin/member', async () => {});
    it('member should not mute anyone', async () => {});
    it('notMember should not mute anyone', async () => {});

    it('muted user should not be able to speak', async () => {});
    it('muted user should be able to speak again after the duration', async () => {});

    it('should not mute user who is already muted', async () => {});
    it('should not mute user who is not in the room', async () => {});
  });

  describe('DELETE /room/:id/mutes/:userId (Unmute user)', () => {
    it('owner should unmute anyone in the room', async () => {});
    it('admin should unmute admin/member', async () => {});
    it('member should not unmute anyone', async () => {});
    it('notMember should not unmute anyone', async () => {});

    it('unmuted user should be able to speak', async () => {});
  });

  describe('DELETE /room/:id/:userId (Kick/Leave)', () => {
    let testRoomId: number;

    beforeEach(async () => {
      testRoomId = await testRoomSetup();
    });
    afterEach(async () => {
      await app.deleteRoom(testRoomId, owner.accessToken);
    });

    it('owner should kick anyone in the room', async () => {
      for (const user of [admin, member]) {
        await app
          .kickFromRoom(testRoomId, user.id, owner.accessToken)
          .expect(204);
        await app
          .getUserOnRoom(testRoomId, user.id, owner.accessToken)
          .expect(404);
      }
    });
    it('admin should kick admin/member', async () => {
      await app
        .kickFromRoom(testRoomId, member.id, admin.accessToken)
        .expect(204);
      await app
        .kickFromRoom(testRoomId, admin.id, admin.accessToken)
        .expect(204);
    });
    it('member should not kick anyone', async () => {});
    it('not member should not kicked anyone', async () => {});

    it('notMember should not be kicked by anyone', async () => {});

    it('kicked user should enter the room again', async () => {
      /* TODO */
    });
    it('owner/admin/member should leave', async () => {});
    it('notMember should not leave', async () => {});
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
      await app.deleteRoom(testRoomId, owner.accessToken);
    });

    it('owner should modify member/admin role', async () => {
      await app
        .updateUserOnRoom(testRoomId, member.id, toAdminDto, owner.accessToken)
        .expect(200);
      await app
        .updateUserOnRoom(testRoomId, admin.id, toMemberDto, owner.accessToken)
        .expect(200);
    });
    it('admin should modify admin/member role', async () => {
      await app
        .updateUserOnRoom(testRoomId, member.id, toAdminDto, admin.accessToken)
        .expect(200);
      await app
        .updateUserOnRoom(testRoomId, admin.id, toMemberDto, admin.accessToken)
        .expect(200);
    });
    it("member should not modify anyone's role", async () => {
      await app
        .updateUserOnRoom(
          testRoomId,
          member.id,
          toMemberDto,
          member.accessToken,
        )
        .expect(403);
    });
    it("admin should not modify user's role to owner", async () => {
      /* TODO */
    });
    it("admin should not modify user's role to owner", async () => {
      /* TODO */
    });
    it("admin should not modify user's role to owner", async () => {
      /* TODO */
    });
    it("admin should not modify user's role to owner", async () => {
      /* TODO */
    });
    it("admin should not modify user's role to owner", async () => {
      /* TODO */
    });
    it("admin should not modify owner's role", async () => {
      await app
        .updateUserOnRoom(testRoomId, owner.id, toAdminDto, admin.accessToken)
        .expect(403);
      await app
        .updateUserOnRoom(testRoomId, owner.id, toMemberDto, admin.accessToken)
        .expect(403);
      // from admin to member
      await app
        .updateUserOnRoom(testRoomId, member.id, toOwnerDto, admin.accessToken)
        .expect(403);
      // from member to admin
      await app
        .updateUserOnRoom(testRoomId, admin.id, toMemberDto, member.accessToken)
        .expect(403);
      // from member to owner
      await app
        .updateUserOnRoom(testRoomId, owner.id, toMemberDto, member.accessToken)
        .expect(403);
    });
  });
});
