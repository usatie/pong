import { Role } from '@prisma/client';
import { UpdateUserOnRoomDto } from 'src/room/dto/update-UserOnRoom.dto';
import { UpdateRoomDto } from 'src/room/dto/update-room.dto';
import { RoomEntity } from 'src/room/entities/room.entity';
import { constants } from './constants';
import { TestApp } from './utils/app';
import { initializeApp } from './utils/initialize';
import { expectRoom } from './utils/matcher';

describe('RoomController (e2e)', () => {
  let app: TestApp;
  beforeAll(async () => {
    app = new TestApp(await initializeApp());
  });
  afterAll(() => app.close());

  let owner, admin, member, notMember;

  let publicRoom: RoomEntity;
  let privateRoom: RoomEntity;
  let protectedRoom: RoomEntity;
  beforeAll(async () => {
    // Owner
    {
      owner = await app.createAndLoginUser(constants.user.owner);
      publicRoom = await app
        .createRoom(constants.room.publicRoom, owner.accessToken)
        .expect(201)
        .then((res) => res.body);
      privateRoom = await app
        .createRoom(constants.room.privateRoom, owner.accessToken)
        .expect(201)
        .then((res) => res.body);
      protectedRoom = await app
        .createRoom(constants.room.protectedRoom, owner.accessToken)
        .expect(201)
        .then((res) => res.body);
    }
    // Member
    {
      member = await app.createAndLoginUser(constants.user.member);
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
      await app.leaveRoom(publicRoom.id, notMember.id, notMember.accessToken);
      await app.leaveRoom(
        protectedRoom.id,
        notMember.id,
        notMember.accessToken,
      );
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
        await app.leaveRoom(publicRoom.id, notMember.id, notMember.accessToken);
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
        await app.leaveRoom(
          privateRoom.id,
          notMember.id,
          notMember.accessToken,
        );
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
        await app.leaveRoom(
          protectedRoom.id,
          notMember.id,
          notMember.accessToken,
        );
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

  // name: room name
  // access_level : public, private, protected
  // password?
  describe('PATCH /room/:id (Update Room)', () => {
    describe('Owner should update room', () => {
      it("Public room's name should be updated (200 OK)", async () => {
        const dto: UpdateRoomDto = { name: 'new_name' };
        const expected = { ...publicRoom, ...dto };
        await app
          .updateRoom(publicRoom.id, dto, owner.accessToken)
          .expect(200)
          .expect(expected);
      });

      // name
      it("Any room's name should be updated (200 OK)", async () => {});
      // Password
      it("Protected room's password should be changed (200 OK)", async () => {});
      it("Protected room's password should not be removed (400)", async () => {});
      it("Private room's password should not be changed (400)", async () => {});
      it("Public room's password should not be changed (400)", async () => {});
      // access_level
      it("Any room's access_level should be changed (200 OK)", async () => {});
      it('access_level should not be changed to protected without password (400)', async () => {});
      it('access_level should not be changed to public/private with password (400)', async () => {});
    });

    it('admin/member/notMember should not update room (403 Forbidden)', async () => {
      const dto: UpdateRoomDto = { name: 'new_name' };
      for (const user of [admin, member, notMember]) {
        await app.updateRoom(publicRoom.id, dto, user.accessToken).expect(403);
      }
    });

    it('invalid roomId should return 404 Not Found', async () => {});
  });

  describe('DELETE /room/:id (Delete Room)', () => {
    it('owner should delete the room (204 No Content)', async () => {
      const testRoom = await app
        .createRoom(constants.room.publicRoom, owner.accessToken)
        .expect(201)
        .then((res): RoomEntity => res.body);
      await app.deleteRoom(testRoom.id, owner.accessToken).expect(204);
    });

    it('admin/member/notMember should not delete the room (403 Forbidden)', async () => {
      for (const user of [admin, member, notMember]) {
        await app.deleteRoom(publicRoom.id, user.accessToken).expect(403);
      }
    });

    it('invalid roomId should return 404 Not Found', async () => {});
  });

  describe('GET /room (Get All Rooms)', () => {
    it('anyone should get all rooms (200 OK)', async () => {
      for (const user of [owner, admin, member, notMember]) {
        await app
          .getRooms(user.accessToken)
          .expect(200)
          .then((res) => {
            expect(res.body).toBeInstanceOf(Array);
            res.body.forEach(expectRoom);
          });
      }
    });

    it('should not get private rooms which a user is not in (200 OK)', async () => {});
  });

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
