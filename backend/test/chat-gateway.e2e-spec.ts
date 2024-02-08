import { Role } from '@prisma/client';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket, io } from 'socket.io-client';
import { AppModule } from 'src/app.module';
import { MessageEntity } from 'src/chat/entities/message.entity';
import { constants } from './constants';
import { TestApp, UserEntityWithAccessToken } from './utils/app';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';

async function createNestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  return app;
}

describe('ChatGateway and ChatController (e2e)', () => {
  let app: TestApp;
  let ws1: Socket; // Client socket 1
  let ws2: Socket; // Client socket 2
  let ws3: Socket; // Client socket 3
  let ws4: Socket; // Client socket 4
  let ws5: Socket; // Client socket 5
  let ws6: Socket; // Client socket 6
  let ws7: Socket; // Client socket 7
  let user1,
    user2,
    blockedUser1,
    blockedUser2,
    kickedUser1,
    bannedUser1,
    mutedUser1;
  const waitTime = 500;
  type UserAndSocket = {
    user: UserEntityWithAccessToken;
    ws: Socket;
  };

  beforeAll(async () => {
    //app = await initializeApp();
    const _app = await createNestApp();
    await _app.listen(3000);
    app = new TestApp(_app);
    const dto1 = {
      name: 'test-user1',
      email: 'test1@test.com',
      password: 'test-password',
    };
    const dto2 = {
      name: 'test-user2',
      email: 'test2@test.com',
      password: 'test-password',
    };
    const dto3 = {
      name: 'blocked-user1',
      email: 'blocked1@test.com',
      password: 'test-password',
    };
    const dto4 = {
      name: 'blocked-user2',
      email: 'blocked2@test.com',
      password: 'test-password',
    };
    const dto5 = {
      name: 'kicked-user1',
      email: 'kicked1@test.com',
      password: 'test-password',
    };
    const dto6 = {
      name: 'banned-user1',
      email: 'banned@test.com',
      password: 'test-password',
    };
    const dto7 = {
      name: 'muted-user1',
      email: 'muted1@test.com',
      password: 'test-password',
    };
    user1 = await app.createAndLoginUser(dto1);
    user2 = await app.createAndLoginUser(dto2);
    blockedUser1 = await app.createAndLoginUser(dto3);
    blockedUser2 = await app.createAndLoginUser(dto4);
    kickedUser1 = await app.createAndLoginUser(dto5);
    bannedUser1 = await app.createAndLoginUser(dto6);
    mutedUser1 = await app.createAndLoginUser(dto7);
    await app
      .blockUser(user1.id, blockedUser1.id, user1.accessToken)
      .expect(200);
    await app
      .blockUser(user2.id, blockedUser1.id, user2.accessToken)
      .expect(200);
  });

  afterAll(async () => {
    await app.deleteUser(user1.id, user1.accessToken).expect(204);
    await app.deleteUser(user2.id, user2.accessToken).expect(204);
    await app.deleteUser(blockedUser1.id, blockedUser1.accessToken).expect(204);
    await app.deleteUser(blockedUser2.id, blockedUser2.accessToken).expect(204);
    await app.deleteUser(kickedUser1.id, kickedUser1.accessToken).expect(204);
    await app.deleteUser(bannedUser1.id, bannedUser1.accessToken).expect(204);
    await app.deleteUser(mutedUser1.id, mutedUser1.accessToken).expect(204);
    await app.close();
    ws1.close();
    ws2.close();
    ws3.close();
    ws4.close();
    ws5.close();
    ws6.close();
    ws7.close();
  });

  const connect = (ws: Socket) => {
    return new Promise<void>((resolve) => {
      ws.on('connect', () => {
        resolve();
      });
    });
  };

  // 1.
  // RoomController
  // POST /room/ -> create room -> ChatGateway.joinRoom(roomId, userId)
  // POST /room/:roomId -> enter room -> ChatGateway.joinRoom(roomId, userId)
  // DELETE /room/:roomId/:userId -> leave room -> ChatGateway.leaveRoom(roomId, userId)
  // DELETE /room/:roomId -> delete room -> ChatGateway.deleteRoom(roomId)

  // ChatController
  // POST /room/:roomId -> save message to db -> ChatGateway.newMessage(message)

  // ChatGateway
  // handleConnection: accessToken -> map[userId] = socket.id -> joinRoom
  // handleDisconnect: accessToken
  // on 'message' -> to(roomId).emit('message')

  // 2.
  // ChatGateway
  // handleConnection: accessToken -> map[userId] = socket.id -> joinRoom
  // handleDisconnect: accessToken
  // on 'join' -> prisma.room.update -> joinRoom
  // on 'leave' ->
  // on 'send' -> to(roomId).send('recv')

  // 3.
  describe('Chat Usage', () => {
    afterAll(async () => {
      await app.deleteRoom(room.id, user1.accessToken).expect(204);
    });
    // Chat
    it('Connect to chat server', async () => {
      ws1 = io('ws://localhost:3000/chat', {
        extraHeaders: { cookie: 'token=' + user1.accessToken },
      });
      ws2 = io('ws://localhost:3000/chat', {
        extraHeaders: { cookie: 'token=' + user2.accessToken },
      });
      ws3 = io('ws://localhost:3000/chat', {
        extraHeaders: { cookie: 'token=' + blockedUser1.accessToken },
      });
      ws4 = io('ws://localhost:3000/chat', {
        extraHeaders: { cookie: 'token=' + blockedUser2.accessToken },
      });
      ws5 = io('ws://localhost:3000/chat', {
        extraHeaders: { cookie: 'token=' + kickedUser1.accessToken },
      });
      ws6 = io('ws://localhost:3000/chat', {
        extraHeaders: { cookie: 'token=' + bannedUser1.accessToken },
      });
      expect(ws1).toBeDefined();
      expect(ws2).toBeDefined();
      expect(ws3).toBeDefined();
      expect(ws4).toBeDefined();
      expect(ws5).toBeDefined();
      expect(ws6).toBeDefined();

      // Wait for connection
      await connect(ws1);
      await connect(ws2);
      await connect(ws3);
      await connect(ws4);
      await connect(ws5);
      await connect(ws6);
    });

    // // Enter room by API call
    let room;
    it('Create and enter a room', async () => {
      const res = await app
        .createRoom(constants.room.publicRoom, user1.accessToken)
        .expect(201);
      room = res.body;
      expect(room.id).toBeDefined();
      // user2 (ws2) enters the room
      await app.enterRoom(room.id, user2.accessToken).expect(201);
      await app.enterRoom(room.id, blockedUser1.accessToken).expect(201);
      await app.enterRoom(room.id, blockedUser2.accessToken).expect(201);
      await app.enterRoom(room.id, kickedUser1.accessToken).expect(201);
      await app.enterRoom(room.id, bannedUser1.accessToken).expect(201);
    });

    describe('Typical scenario', () => {
      // Setup promises to recv messages
      let ctx1, ctx2: Promise<void>;
      it('Setup promises to recv messages', () => {
        ctx1 = new Promise<void>((resolve) => {
          ws2.on('message', (data) => {
            const expected: MessageEntity = {
              user: {
                id: user1.id,
                name: user1.name,
                avatarURL: user1.avatarURL,
              },
              roomId: room.id,
              content: 'hello',
            };
            expect(data).toEqual(expected);
            const ack = {
              userId: user2.id,
              roomId: room.id,
              content: 'ACK: ' + data.content,
            };
            ws2.emit('message', ack);
            ws2.off('message');
            resolve();
          });
        });
        ctx2 = new Promise<void>((resolve) => {
          ws1.on('message', (data) => {
            if (data.user.id === user1.id) return;
            const expected: MessageEntity = {
              user: {
                id: user2.id,
                name: user2.name,
                avatarURL: user2.avatarURL,
              },
              roomId: room.id,
              content: 'ACK: hello',
            };
            expect(data).toEqual(expected);
            ws1.off('message');
            resolve();
          });
        });
      });

      // Send messages
      it('user1 sends messages', async () => {
        const helloMessage = {
          userId: user1.id,
          roomId: room.id,
          content: 'hello',
        };
        ws1.emit('message', helloMessage);
      });

      it('user2 receives messages and send ACK', async () => {
        await ctx1;
      });

      it('user1 receives ACK', async () => {
        await ctx2;
      });

      it('user1 should get all messages in the room', async () => {
        const res = await app
          .getMessagesInRoom(room.id, user1.accessToken)
          .expect(200);
        const messages = res.body;
        expect(messages).toHaveLength(2);
        expect(messages).toEqual([
          {
            user: {
              id: user1.id,
              name: user1.name,
              avatarURL: user1.avatarURL,
            },
            roomId: room.id,
            content: 'hello',
            createdAt: expect.any(String),
          },
          {
            user: {
              id: user2.id,
              name: user2.name,
              avatarURL: user2.avatarURL,
            },
            roomId: room.id,
            content: 'ACK: hello',
            createdAt: expect.any(String),
          },
        ]);
      });
    });
    describe('Block scenario', () => {
      it('blockedUser1 sends message', () => {
        const helloMessage = {
          userId: blockedUser1.id,
          roomId: room.id,
          content: 'hello',
        };
        ws3.emit('message', helloMessage);
      });

      it('user1 and user2 should not receive message from blockedUser1', (done) => {
        const mockMessage = jest.fn();
        const mockMessage2 = jest.fn();
        ws1.on('message', mockMessage);
        ws2.on('message', mockMessage2);
        setTimeout(() => {
          expect(mockMessage).not.toBeCalled();
          expect(mockMessage2).not.toBeCalled();
          ws1.off('message');
          ws2.off('message');
          done();
        }, waitTime);
      });

      it('user1 and user2 block blockedUser2', async () => {
        await app
          .blockUser(user1.id, blockedUser2.id, user1.accessToken)
          .expect(200);
        await app
          .blockUser(user2.id, blockedUser2.id, user2.accessToken)
          .expect(200);
      });

      it('blockedUser2 sends message', () => {
        const helloMessage = {
          userId: blockedUser2.id,
          roomId: room.id,
          content: 'hello',
        };
        ws4.emit('message', helloMessage);
      });

      it('user1 and user2 should not receive message from blockedUser2', (done) => {
        const mockMessage = jest.fn();
        const mockMessage2 = jest.fn();
        ws1.on('message', mockMessage);
        ws2.on('message', mockMessage2);
        setTimeout(() => {
          expect(mockMessage).not.toBeCalled();
          expect(mockMessage2).not.toBeCalled();
          ws1.off('message');
          ws2.off('message');
          done();
        }, waitTime);
      });

      it('user1 should get all messages except from blockedUser1 and blockedUser2 in the room', async () => {
        const res = await app
          .getMessagesInRoom(room.id, user1.accessToken)
          .expect(200);
        const messages = res.body;
        expect(messages).toHaveLength(2);
        expect(messages).toEqual([
          {
            user: {
              id: user1.id,
              name: user1.name,
              avatarURL: user1.avatarURL,
            },
            roomId: room.id,
            content: 'hello',
            createdAt: expect.any(String),
          },
          {
            user: {
              id: user2.id,
              name: user2.name,
              avatarURL: user2.avatarURL,
            },
            roomId: room.id,
            content: 'ACK: hello',
            createdAt: expect.any(String),
          },
        ]);
      });
    });

    describe('Unblock scenario', () => {
      it('user1 unblocks blockedUser1', async () => {
        await app
          .unblockUser(user1.id, blockedUser1.id, user1.accessToken)
          .expect(200);
      });

      let ctx3, ctx4: Promise<void>;
      it('setup promises to recv messages from blockedUser1 after unblocking', async () => {
        ctx3 = new Promise<void>((resolve) => {
          ws1.on('message', (data) => {
            const expected: MessageEntity = {
              user: {
                id: blockedUser1.id,
                name: blockedUser1.name,
                avatarURL: blockedUser1.avatarURL,
              },
              roomId: room.id,
              content: 'hello',
            };
            expect(data).toEqual(expected);
            const ack = {
              userId: user1.id,
              roomId: room.id,
              content: 'ACK: ' + data.content,
            };
            ws1.emit('message', ack);
            ws1.off('message');
            resolve();
          });
        });
        ctx4 = new Promise<void>((resolve) => {
          ws3.on('message', (data) => {
            if (data.user.id === blockedUser1.id) return;
            const expected: MessageEntity = {
              user: {
                id: user1.id,
                name: user1.name,
                avatarURL: user1.avatarURL,
              },
              roomId: room.id,
              content: 'ACK: hello',
            };
            expect(data).toEqual(expected);
            ws3.off('message');
            resolve();
          });
        });
      });

      it('blockedUser1 sends message after unblocking', () => {
        const helloMessage = {
          userId: blockedUser1.id,
          roomId: room.id,
          content: 'hello',
        };
        ws3.emit('message', helloMessage);
      });

      it('user1 receives messages and send ACK', async () => {
        await ctx3;
      });

      it('blockedUser1 receives ACK', async () => {
        await ctx4;
      });

      it('user1 should get all messages except from blockedUser2 in the room', async () => {
        const res = await app
          .getMessagesInRoom(room.id, user1.accessToken)
          .expect(200);
        const messages = res.body;
        expect(messages).toHaveLength(5);
        expect(messages).toEqual([
          {
            user: {
              id: user1.id,
              name: user1.name,
              avatarURL: user1.avatarURL,
            },
            roomId: room.id,
            content: 'hello',
            createdAt: expect.any(String),
          },
          {
            user: {
              id: user2.id,
              name: user2.name,
              avatarURL: user2.avatarURL,
            },
            roomId: room.id,
            content: 'ACK: hello',
            createdAt: expect.any(String),
          },
          {
            user: {
              id: blockedUser1.id,
              name: blockedUser1.name,
              avatarURL: blockedUser1.avatarURL,
            },
            roomId: room.id,
            content: 'hello',
            createdAt: expect.any(String),
          },
          {
            user: {
              id: blockedUser1.id,
              name: blockedUser1.name,
              avatarURL: blockedUser1.avatarURL,
            },
            roomId: room.id,
            content: 'hello',
            createdAt: expect.any(String),
          },
          {
            user: {
              id: user1.id,
              name: user1.name,
              avatarURL: user1.avatarURL,
            },
            roomId: room.id,
            content: 'ACK: hello',
            createdAt: expect.any(String),
          },
        ]);
      });

      it('user1 unblocks blockedUser2', async () => {
        await app
          .unblockUser(user1.id, blockedUser2.id, user1.accessToken)
          .expect(200);
      });
    });

    describe('Kick scenario', () => {
      let ctx5: Promise<void[]>;
      it('setup promises to recv leave event with user id', async () => {
        const expectedEvent = {
          userId: kickedUser1.id,
          roomId: room.id,
        };
        const promises = [ws1, ws2, ws3, ws4, ws5, ws6].map(
          (ws) =>
            new Promise<void>((resolve) => {
              ws.on('leave', (data) => {
                expect(data).toEqual(expectedEvent);
                ws.off('leave');
                resolve();
              });
            }),
        );

        ctx5 = Promise.all(promises);
      });

      it('user1 kicks kickedUser1', async () => {
        await app
          .kickFromRoom(room.id, kickedUser1.id, user1.accessToken)
          .expect(204);
      });

      it('all users (except kickedUser1) should receive leave event with kickedUser1 id', async () => {
        await ctx5;
      });

      it('kickedUser1 sends message', () => {
        const helloMessage = {
          userId: kickedUser1.id,
          roomId: room.id,
          content: 'hello',
        };
        ws5.emit('message', helloMessage);
      });

      it('user1 and user2 should not receive message from kickedUser1', (done) => {
        const mockMessage = jest.fn();
        const mockMessage2 = jest.fn();
        ws1.on('message', mockMessage);
        ws2.on('message', mockMessage2);
        setTimeout(() => {
          expect(mockMessage).not.toBeCalled();
          expect(mockMessage2).not.toBeCalled();
          ws1.off('message');
          ws2.off('message');
          done();
        }, waitTime);
      });

      it('user1 should get all messages except from kickedUser1 in the room', async () => {
        const res = await app
          .getMessagesInRoom(room.id, user1.accessToken)
          .expect(200);
        const messages = res.body;
        expect(messages).toHaveLength(6);
        expect(messages).toEqual([
          {
            user: {
              id: user1.id,
              name: user1.name,
              avatarURL: user1.avatarURL,
            },
            roomId: room.id,
            content: 'hello',
            createdAt: expect.any(String),
          },
          {
            user: {
              id: user2.id,
              name: user2.name,
              avatarURL: user2.avatarURL,
            },
            roomId: room.id,
            content: 'ACK: hello',
            createdAt: expect.any(String),
          },
          {
            user: {
              id: blockedUser1.id,
              name: blockedUser1.name,
              avatarURL: blockedUser1.avatarURL,
            },
            roomId: room.id,
            content: 'hello',
            createdAt: expect.any(String),
          },
          {
            user: {
              id: blockedUser2.id,
              name: blockedUser2.name,
              avatarURL: blockedUser2.avatarURL,
            },
            roomId: room.id,
            content: 'hello',
            createdAt: expect.any(String),
          },
          {
            user: {
              id: blockedUser1.id,
              name: blockedUser1.name,
              avatarURL: blockedUser1.avatarURL,
            },
            roomId: room.id,
            content: 'hello',
            createdAt: expect.any(String),
          },
          {
            user: {
              id: user1.id,
              name: user1.name,
              avatarURL: user1.avatarURL,
            },
            roomId: room.id,
            content: 'ACK: hello',
            createdAt: expect.any(String),
          },
        ]);
      });

      it('user1 sends message', () => {
        const helloMessage = {
          userId: user1.id,
          roomId: room.id,
          content: 'hello',
        };
        ws1.emit('message', helloMessage);
      });

      it('kickedUser1 should not receive message from user1', (done) => {
        const mockMessage = jest.fn();
        ws5.on('message', mockMessage);
        setTimeout(() => {
          expect(mockMessage).not.toBeCalled();
          ws5.off('message');
          done();
        }, waitTime);
      });
    });

    describe('Ban scenario', () => {
      it('user1 bans bannedUser1', async () => {
        await app
          .banUser(room.id, bannedUser1.id, user1.accessToken)
          .expect(200);
      });

      it('bannedUser1 sends message', () => {
        const helloMessage = {
          userId: bannedUser1.id,
          roomId: room.id,
          content: 'hello',
        };
        ws6.emit('message', helloMessage);
      });

      it('user1 and user2 should not receive message from bannedUser1', (done) => {
        const mockMessage = jest.fn();
        const mockMessage2 = jest.fn();
        ws1.on('message', mockMessage);
        ws2.on('message', mockMessage2);
        setTimeout(() => {
          expect(mockMessage).not.toBeCalled();
          expect(mockMessage2).not.toBeCalled();
          ws1.off('message');
          ws2.off('message');
          done();
        }, waitTime);
      });

      it('user1 should get all messages except from bannedUser1 in the room', async () => {
        const res = await app
          .getMessagesInRoom(room.id, user1.accessToken)
          .expect(200);
        const messages = res.body;
        expect(messages).toHaveLength(7);
        expect(messages).toEqual([
          {
            user: {
              id: user1.id,
              name: user1.name,
              avatarURL: user1.avatarURL,
            },
            roomId: room.id,
            content: 'hello',
            createdAt: expect.any(String),
          },
          {
            user: {
              id: user2.id,
              name: user2.name,
              avatarURL: user2.avatarURL,
            },
            roomId: room.id,
            content: 'ACK: hello',
            createdAt: expect.any(String),
          },
          {
            user: {
              id: blockedUser1.id,
              name: blockedUser1.name,
              avatarURL: blockedUser1.avatarURL,
            },
            roomId: room.id,
            content: 'hello',
            createdAt: expect.any(String),
          },
          {
            user: {
              id: blockedUser2.id,
              name: blockedUser2.name,
              avatarURL: blockedUser2.avatarURL,
            },
            roomId: room.id,
            content: 'hello',
            createdAt: expect.any(String),
          },
          {
            user: {
              id: blockedUser1.id,
              name: blockedUser1.name,
              avatarURL: blockedUser1.avatarURL,
            },
            roomId: room.id,
            content: 'hello',
            createdAt: expect.any(String),
          },
          {
            user: {
              id: user1.id,
              name: user1.name,
              avatarURL: user1.avatarURL,
            },
            roomId: room.id,
            content: 'ACK: hello',
            createdAt: expect.any(String),
          },
          {
            user: {
              id: user1.id,
              name: user1.name,
              avatarURL: user1.avatarURL,
            },
            roomId: room.id,
            content: 'hello',
            createdAt: expect.any(String),
          },
        ]);
      });

      it('user1 sends message', () => {
        const helloMessage = {
          userId: user1.id,
          roomId: room.id,
          content: 'hello',
        };
        ws1.emit('message', helloMessage);
      });

      it('bannedUser1 should not receive message from user1', (done) => {
        const mockMessage = jest.fn();
        ws6.on('message', mockMessage);
        setTimeout(() => {
          expect(mockMessage).not.toBeCalled();
          ws6.off('message');
          done();
        }, waitTime);
      });
    });
  });

  describe('Mute scenario', () => {
    afterAll(async () => {
      await app.deleteRoom(room.id, user1.accessToken).expect(204);
    });
    it('Connect to chat server as mutedUser1', async () => {
      ws7 = io('ws://localhost:3000/chat', {
        extraHeaders: { cookie: 'token=' + mutedUser1.accessToken },
      });
      expect(ws7).toBeDefined();
      await connect(ws7);
    });

    let room;
    it('Create and enter a room', async () => {
      const res = await app
        .createRoom(constants.room.publicRoom, user1.accessToken)
        .expect(201);
      room = res.body;
      expect(room.id).toBeDefined();
      await app.enterRoom(room.id, user2.accessToken).expect(201);
      await app.enterRoom(room.id, blockedUser1.accessToken).expect(201);
      await app.enterRoom(room.id, blockedUser2.accessToken).expect(201);
      await app.enterRoom(room.id, kickedUser1.accessToken).expect(201);
      await app.enterRoom(room.id, bannedUser1.accessToken).expect(201);
      await app.enterRoom(room.id, mutedUser1.accessToken).expect(201);
    });

    const muteTime = 1;

    it('user1 mutes mutedUser1', async () => {
      await app
        .muteUser(room.id, mutedUser1.id, user1.accessToken, muteTime)
        .expect(200);
    });

    it('mutedUser1 sends message', () => {
      const helloMessage = {
        userId: mutedUser1.id,
        roomId: room.id,
        content: 'hello',
      };
      ws7.emit('message', helloMessage);
    });

    it('all users should not receive message from mutedUser1', (done) => {
      const mockMessage = jest.fn();
      const mockMessage2 = jest.fn();
      const mockMessage3 = jest.fn();
      const mockMessage4 = jest.fn();
      const mockMessage5 = jest.fn();
      const mockMessage6 = jest.fn();
      ws1.on('message', mockMessage);
      ws2.on('message', mockMessage2);
      ws3.on('message', mockMessage3);
      ws4.on('message', mockMessage4);
      ws5.on('message', mockMessage5);
      ws6.on('message', mockMessage6);
      setTimeout(() => {
        expect(mockMessage).not.toBeCalled();
        expect(mockMessage2).not.toBeCalled();
        expect(mockMessage3).not.toBeCalled();
        expect(mockMessage4).not.toBeCalled();
        expect(mockMessage5).not.toBeCalled();
        expect(mockMessage6).not.toBeCalled();
        ws1.off('message');
        ws2.off('message');
        ws3.off('message');
        ws4.off('message');
        ws5.off('message');
        ws6.off('message');
        done();
      }, waitTime);
    });

    let ctx6: Promise<void[]>;
    it('setup promises to recv messages from mutedUser1 after the duration', async () => {
      await new Promise((r) => setTimeout(r, muteTime * 1000)); // Wait for mute duration
      const expected: MessageEntity = {
        user: {
          id: mutedUser1.id,
          name: mutedUser1.name,
          avatarURL: mutedUser1.avatarURL,
        },
        roomId: room.id,
        content: 'hello',
      };
      const promises = [ws1, ws2, ws3, ws4, ws5, ws6].map(
        (ws) =>
          new Promise<void>((resolve) => {
            ws.on('message', (data) => {
              expect(data).toEqual(expected);
              ws.off('message');
              resolve();
            });
          }),
      );
      ctx6 = Promise.all(promises);
    });

    it('mutedUser1 sends message after the duration', () => {
      const helloMessage = {
        userId: mutedUser1.id,
        roomId: room.id,
        content: 'hello',
      };
      ws7.emit('message', helloMessage);
    });

    it('all users should receive message from mutedUser1 after the duration', async () => {
      await ctx6;
    });

    it('user1 unmutes mutedUser1', async () => {
      await app
        .unmuteUser(room.id, mutedUser1.id, user1.accessToken)
        .expect(200);
    });

    it('user1 mute mutedUser1 again', async () => {
      await app
        .muteUser(room.id, mutedUser1.id, user1.accessToken, 10)
        .expect(200);
    });

    it('mutedUser1 sends message', () => {
      const helloMessage = {
        userId: mutedUser1.id,
        roomId: room.id,
        content: 'hello',
      };
      ws7.emit('message', helloMessage);
    });

    it('all users should not receive message from mutedUser1', (done) => {
      const mockMessage = jest.fn();
      const mockMessage2 = jest.fn();
      const mockMessage3 = jest.fn();
      const mockMessage4 = jest.fn();
      const mockMessage5 = jest.fn();
      const mockMessage6 = jest.fn();
      ws1.on('message', mockMessage);
      ws2.on('message', mockMessage2);
      ws3.on('message', mockMessage3);
      ws4.on('message', mockMessage4);
      ws5.on('message', mockMessage5);
      ws6.on('message', mockMessage6);
      setTimeout(() => {
        expect(mockMessage).not.toBeCalled();
        expect(mockMessage2).not.toBeCalled();
        expect(mockMessage3).not.toBeCalled();
        expect(mockMessage4).not.toBeCalled();
        expect(mockMessage5).not.toBeCalled();
        expect(mockMessage6).not.toBeCalled();
        ws1.off('message');
        ws2.off('message');
        ws3.off('message');
        ws4.off('message');
        ws5.off('message');
        ws6.off('message');
        done();
      }, waitTime);
    });

    it('user1 unmutes mutedUser1', async () => {
      await app
        .unmuteUser(room.id, mutedUser1.id, user1.accessToken)
        .expect(200);
    });

    it('all users should receive message from mutedUser1 after unmuting', async () => {
      await ctx6;
    });
  });

  describe('Client notification on chat channel actions', () => {
    describe('Notification that a user has entered', () => {
      let room;
      let ctx7: Promise<void[]>;
      beforeAll(async () => {
        const res = await app
          .createRoom(constants.room.publicRoom, user1.accessToken)
          .expect(201);
        room = res.body;
        expect(room.id).toBeDefined();

        const expectedEvent = {
          roomId: room.id,
          userId: user2.id,
        };
        const promises = [ws1, ws2].map(
          (ws) =>
            new Promise<void>((resolve) => {
              ws.on('enter-room', (data) => {
                expect(data).toEqual(expectedEvent);
                ws.off('enter-room');
                resolve();
              });
            }),
        );
        ctx7 = Promise.all(promises);
      });
      afterAll(async () => {
        await app.deleteRoom(room.id, user1.accessToken).expect(204);
      });

      it('is sent when user2 enters the room', async () => {
        await app.enterRoom(room.id, user2.accessToken).expect(201);
      });

      it('should be received by room members', async () => {
        await ctx7;
      });
      it('should not be received by non-members', (done) => {
        const mockEnterEventListener = jest.fn();
        ws3.on('enter-room', mockEnterEventListener);
        setTimeout(() => {
          expect(mockEnterEventListener).not.toBeCalled();
          ws3.off('enter-room');
          done();
        }, waitTime);
      });
    });
    describe('Notification that a user has updated role', () => {
      let room;
      let ctx8: Promise<void[]>;
      beforeAll(async () => {
        const res = await app
          .createRoom(constants.room.publicRoom, user1.accessToken)
          .expect(201);
        room = res.body;
        expect(room.id).toBeDefined();
        await app.enterRoom(room.id, user2.accessToken).expect(201);
        const expectedEvent = {
          roomId: room.id,
          userId: user2.id,
          role: Role.ADMINISTRATOR,
        };
        const promises = [ws1, ws2].map(
          (ws) =>
            new Promise<void>((resolve) => {
              ws.on('update-role', (data) => {
                expect(data).toEqual(expectedEvent);
                ws.off('update-role');
                resolve();
              });
            }),
        );
        ctx8 = Promise.all(promises);
      });
      afterAll(async () => {
        await app.deleteRoom(room.id, user1.accessToken).expect(204);
      });

      it('is sent when user1 updates user2 role to admin', async () => {
        await app
          .updateUserOnRoom(
            room.id,
            user2.id,
            { role: Role.ADMINISTRATOR },
            user1.accessToken,
          )
          .expect(200);
      });

      it('should be received by room members.', async () => {
        await ctx8;
      });

      it('should not be received by non-members', (done) => {
        const mockUpdateRoleEventListener = jest.fn();
        ws3.on('update-role', mockUpdateRoleEventListener);
        setTimeout(() => {
          expect(mockUpdateRoleEventListener).not.toBeCalled();
          ws3.off('update-role');
          done();
        }, waitTime);
      });
    });
    describe('Notification that a user has muted', () => {
      let room;
      let ctx9: Promise<void[]>;
      let ctx10: Promise<void[]>;
      beforeAll(async () => {
        const res = await app
          .createRoom(constants.room.publicRoom, user1.accessToken)
          .expect(201);
        room = res.body;
        expect(room.id).toBeDefined();
        await app.enterRoom(room.id, user2.accessToken).expect(201);
        const expectedEvent = {
          roomId: room.id,
          userId: user2.id,
        };
        const promises = [ws1, ws2].map(
          (ws) =>
            new Promise<void>((resolve) => {
              ws.on('mute', (data) => {
                expect(data).toEqual(expectedEvent);
                ws.off('mute');
                resolve();
              });
            }),
        );
        ctx9 = Promise.all(promises);

        const promises2 = [ws1, ws2].map(
          (ws) =>
            new Promise<void>((resolve) => {
              ws.on('unmute', (data) => {
                expect(data).toEqual(expectedEvent);
                ws.off('unmute');
                resolve();
              });
            }),
        );
        ctx10 = Promise.all(promises2);
      });
      afterAll(async () => {
        await app.deleteRoom(room.id, user1.accessToken).expect(204);
      });

      it('is sent when user1 mutes user2', async () => {
        await app.muteUser(room.id, user2.id, user1.accessToken).expect(200);
      });

      it('should be received by room members', async () => {
        await ctx9;
      });

      it('should not be received by non-members', (done) => {
        const mockMuteEventListener = jest.fn();
        ws3.on('mute', mockMuteEventListener);
        setTimeout(() => {
          expect(mockMuteEventListener).not.toBeCalled();
          ws3.off('mute');
          done();
        }, waitTime);
      });
      describe('Notification that a user has unmuted', () => {
        it('is sent when user1 unmutes user2', async () => {
          await app
            .unmuteUser(room.id, user2.id, user1.accessToken)
            .expect(200);
        });

        it('should be received by room members', async () => {
          await ctx10;
        });

        it('should not be received by non-members', (done) => {
          const mockUnmuteEventListener = jest.fn();
          ws3.on('unmute', mockUnmuteEventListener);
          setTimeout(() => {
            expect(mockUnmuteEventListener).not.toBeCalled();
            ws3.off('unmute');
            done();
          }, waitTime);
        });
      });
    });
    describe('Notification that deleted a room', () => {
      const setupRoom = async (createRoomDto: CreateRoomDto) => {
        const dto = { ...createRoomDto, userIds: [user2.id] };
        const res = await app.createRoom(dto, user1.accessToken).expect(201);
        const room = res.body;
        expect(room.id).toBeDefined();
        return room;
      };

      describe('Notification that deleted a public room', () => {
        let _publicRoom;
        let ctx11: Promise<void[]>;
        beforeAll(async () => {
          _publicRoom = await setupRoom(constants.room.publicRoom);

          const expectedEvent = {
            roomId: _publicRoom.id,
          };
          const promises = [ws1, ws2, ws3, ws4, ws5, ws6].map(
            (ws) =>
              new Promise<void>((resolve) => {
                ws.on('delete-room', (data) => {
                  expect(data).toEqual(expectedEvent);
                  ws.off('delete-room');
                  resolve();
                });
              }),
          );
          ctx11 = Promise.all(promises);
        });
        afterAll(async () => {
          await app.deleteRoom(_publicRoom.id, user1.accessToken);
        });

        it('is sent when user1 deletes the public room', async () => {
          await app.deleteRoom(_publicRoom.id, user1.accessToken).expect(204);
        });

        it('should be received by all users', async () => {
          await ctx11;
        });
      });
      describe('Notification that deleted a protected room', () => {
        let _protectedRoom;
        let ctx12: Promise<void[]>;
        beforeAll(async () => {
          _protectedRoom = await setupRoom(constants.room.protectedRoom);

          const expectedEvent = {
            roomId: _protectedRoom.id,
          };
          const promises = [ws1, ws2, ws3, ws4, ws5, ws6].map(
            (ws) =>
              new Promise<void>((resolve) => {
                ws.on('delete-room', (data) => {
                  expect(data).toEqual(expectedEvent);
                  ws.off('delete-room');
                  resolve();
                });
              }),
          );
          ctx12 = Promise.all(promises);
        });
        afterAll(async () => {
          await app.deleteRoom(_protectedRoom.id, user1.accessToken);
        });

        it('is sent when user1 deletes the protected room', async () => {
          await app
            .deleteRoom(_protectedRoom.id, user1.accessToken)
            .expect(204);
        });

        it('should be received by all users', async () => {
          await ctx12;
        });
      });
      describe('Notification that deleted a private room', () => {
        let _privateRoom;
        let ctx13: Promise<void[]>;
        beforeAll(async () => {
          _privateRoom = await setupRoom(constants.room.privateRoom);

          const expectedEvent = {
            roomId: _privateRoom.id,
          };
          const promises = [ws1, ws2].map(
            (ws) =>
              new Promise<void>((resolve) => {
                ws.on('delete-room', (data) => {
                  expect(data).toEqual(expectedEvent);
                  ws.off('delete-room');
                  resolve();
                });
              }),
          );
          ctx13 = Promise.all(promises);
        });
        afterAll(async () => {
          await app.deleteRoom(_privateRoom.id, user1.accessToken);
        });

        it('is sent when user1 deletes the private room', async () => {
          await app.deleteRoom(_privateRoom.id, user1.accessToken).expect(204);
        });
        it('should be received by room members', async () => {
          await ctx13;
        });

        it('should not be received by non-members', (done) => {
          const mockDeleteRoomEventListener = jest.fn();
          ws3.on('delete-room', mockDeleteRoomEventListener);
          setTimeout(() => {
            expect(mockDeleteRoomEventListener).not.toBeCalled();
            ws3.off('delete-room');
            done();
          }, waitTime);
        });
      });
    });
    describe('Notification that owner has left the room (delete-room)', () => {
      let room;
      let ctx14: Promise<void[]>;
      const setupRoom = async (createRoomDto: CreateRoomDto) => {
        const dto = { ...createRoomDto, userIds: [user2.id] };
        const res = await app.createRoom(dto, user1.accessToken).expect(201);
        const room = res.body;
        expect(room.id).toBeDefined();
        return room;
      };
      beforeAll(async () => {
        room = await setupRoom(constants.room.publicRoom);
        const expectedEvent = {
          roomId: room.id,
        };
        const promises = [ws1, ws2, ws3, ws4, ws5, ws6].map(
          (ws) =>
            new Promise<void>((resolve) => {
              ws.on('delete-room', (data) => {
                expect(data).toEqual(expectedEvent);
                ws.off('delete-room');
                resolve();
              });
            }),
        );
        ctx14 = Promise.all(promises);
      });
      afterAll(async () => {
        await app.deleteRoom(room.id, user1.accessToken);
      });

      it('is sent when owner(user1) leaves the public room', async () => {
        await app.leaveRoom(room.id, user1.accessToken).expect(204);
      });

      it('should be received by all users', async () => {
        await ctx14;
      });

      it('should not be received by non-members', (done) => {
        const mockKickEventListener = jest.fn();
        ws3.on('delete-room', mockKickEventListener);
        setTimeout(() => {
          expect(mockKickEventListener).not.toBeCalled();
          ws3.off('delete-room');
          done();
        }, waitTime);
      });
    });
  });

  /*
  describe('[joinRoom]', () => {
    it('one user should join the room', async () => {
      // joinRoom
      ws1.emit('joinRoom', { roomId: constants.roomId, userId: 1 });

      // Wait 100ms for server to handle joinRoom
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Check if the client has joined the room
      const chatGateway = app.get(ChatGateway);
      const sockets = await chatGateway.server
        .to('room/' + constants.roomId)
        .fetchSockets();
      const ids = sockets.map((socket) => socket.id);
      expect(ids).toHaveLength(1);
      expect(ids).toContain(ws1.id);
    });

    it('two users should join the room', async () => {
      // joinRoom
      ws1.emit('joinRoom', { roomId: constants.roomId, userId: 1 });
      ws2.emit('joinRoom', { roomId: constants.roomId, userId: 2 });

      // Wait 100ms for server to handle joinRoom
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if the client has joined the room
      const chatGateway = app.get(ChatGateway);
      const sockets = await chatGateway.server
        .to('room/' + constants.roomId)
        .fetchSockets();
      const ids = sockets.map((socket) => socket.id);
      expect(ids).toHaveLength(2);
      expect(ids).toContain(ws1.id);
      expect(ids).toContain(ws2.id);
      ws2.close();
    });
  });

  describe('[newMessage]', () => {
    it('A user should receive a message sent themself', async () => {
      // joinRoom
      ws1.emit('joinRoom', { roomId: constants.roomId, userId: 1 });

      // client receives the message
      const done = new Promise<void>((resolve) => {
        ws1.on('sendToClient', (data) => {
          expect(data).toEqual(constants.message);
          resolve();
        });
      });

      // newMessage
      ws1.emit('newMessage', constants.message);
      await done;
    });

    it('A user should receive a message sent by another user', async () => {
      // joinRoom
      ws1.emit('joinRoom', { roomId: constants.roomId, userId: 1 });
      ws2.emit('joinRoom', { roomId: constants.roomId, userId: 2 });

      // newMessage
      ws1.emit('newMessage', constants.message);

      // TODO
    });
  });

  describe('[privateMessage]', () => {
    // TODO
  });
  */

  /*
  describe('[block]', () => {
    // TODO
  });
  describe('[unblock]', () => {
    // TODO
  });
  */
  describe('[leaveRoom]', () => {
    // TODO
  });
  describe('[disconnect]', () => {
    // TODO
  });
  describe('[joinDM]', () => {
    // TODO
  });
  describe('invite pong game', () => {
    let userAndSockets: UserAndSocket[];

    beforeAll(() => {
      const users = [user1, user2, mutedUser1, kickedUser1];
      userAndSockets = users.map((user) => ({
        user,
        ws: io('ws://localhost:3000/chat', {
          extraHeaders: { cookie: 'token=' + user.accessToken },
        }),
      }));
      return userAndSockets.map((s) => connect(s.ws));
    });
    afterAll(() => {
      userAndSockets.map((userAndSocket) => {
        userAndSocket.ws.close();
      });
    });
    afterEach(() => {
      userAndSockets.map((us) => {
        us.ws.disconnect();
        us.ws.connect();
      });
    });
    describe('invite a user', () => {
      describe('success case', () => {
        let invite: UserAndSocket;
        let invited: UserAndSocket;
        let notInvited: UserAndSocket;

        let ctx1: Promise<any>;
        const mockCallback = jest.fn();

        beforeAll(() => {
          invite = userAndSockets[0];
          invited = userAndSockets[1];
          notInvited = userAndSockets[2];
          ctx1 = new Promise<any>((resolve) =>
            invited.ws.on('invite-pong', (data) => resolve(data)),
          );
          notInvited.ws.on('invite-pong', mockCallback);

          invite.ws.emit('invite-pong', {
            userId: invited.user.id,
          });
          ctx1.then((data) => {
            expect(data).toEqual({
              userId: invite.user.id,
            });
          });
        });
        it('user who is invited should receive invite message', () => ctx1);
        it("user who isn't invited should not receive invite message", () =>
          new Promise<void>((resolve) =>
            setTimeout(() => {
              expect(mockCallback).not.toBeCalled();
              resolve();
            }, waitTime),
          ));
      });
      // TODO: block してるuser から invite されるケース
      describe('failure case', () => {
        let invitee;
        let blocked;
        let mockCallback: jest.Mock<any, any, any>;

        beforeAll(async () => {
          mockCallback = jest.fn();
          invitee = userAndSockets[0];
          blocked = userAndSockets[1];
          await app
            .blockUser(
              invitee.user.id,
              blocked.user.id,
              invitee.user.accessToken,
            )
            .expect(200);
          invitee.ws.on('invite-pong', mockCallback);
          blocked.ws.emit('invite-pong', {
            userId: invitee.user.id,
          });
        });
        afterAll(async () => {
          await app
            .unblockUser(
              invitee.user.id,
              blocked.user.id,
              invitee.user.accessToken,
            )
            .expect(200);
        });
        it('user should not receive invite message from blocking user', () =>
          new Promise<void>((resolve) =>
            setTimeout(async () => {
              expect(mockCallback).not.toHaveBeenCalled();
              resolve();
            }, waitTime),
          ));
      });
      describe('invite -> cancel -> invite', () => {
        let invitee;
        let inviter;
        let mockCallback;

        beforeAll(() => {
          mockCallback = jest.fn();
          invitee = userAndSockets[0];
          inviter = userAndSockets[1];

          invitee.ws.on('invite-pong', mockCallback);
          inviter.ws.emit('invite-pong', {
            userId: invitee.user.id,
          });
          inviter.ws.emit('invite-cancel-pong', {
            userId: invitee.user.id,
          });
          inviter.ws.emit('invite-pong', {
            userId: invitee.user.id,
          });
        });
        it('user who is invited should receive invite message once per time', () =>
          new Promise<void>((resolve) =>
            setTimeout(() => {
              expect(mockCallback).toHaveBeenCalledTimes(2);
              resolve();
            }, waitTime),
          ));
      });
    });
    describe('approve invite', () => {
      describe('success case', () => {
        let PromiseToMatchByInviter: Promise<any>;
        let PromiseToMatchByInvited: Promise<any>;
        let roomId;
        const mockCallback1 = jest.fn();
        beforeAll(() => {
          const inviter = userAndSockets[0];
          const invitee = userAndSockets[1];
          const notInvited1 = userAndSockets[2];

          const promiseToInvite = new Promise<any>((resolve) =>
            invitee.ws.on('invite-pong', (data) => resolve(data)),
          );
          PromiseToMatchByInviter = new Promise<any>((resolve) =>
            inviter.ws.on('match-pong', (data) => resolve(data)),
          );
          PromiseToMatchByInvited = new Promise<any>((resolve) =>
            invitee.ws.on('match-pong', (data) => resolve(data)),
          );

          notInvited1.ws.on('invite-pong', mockCallback1);
          notInvited1.ws.on('approve-pong', mockCallback1);
          notInvited1.ws.on('match-pong', mockCallback1);

          inviter.ws.emit('invite-pong', {
            userId: invitee.user.id,
          });
          return promiseToInvite.then((data) => {
            invitee.ws.emit('approve-pong', {
              userId: data.userId,
            });
          });
        });
        it("invite user should receive room's id", () =>
          PromiseToMatchByInviter.then((data) => {
            expect(data).toHaveProperty('roomId');
            roomId = data.roomId;
          }));
        it("approve user should receive room's id", () =>
          PromiseToMatchByInvited.then((data) => {
            expect(data).toHaveProperty('roomId');
            expect(data.roomId).toEqual(roomId);
          }));
        it('unrelated user should not receive any messages', () =>
          new Promise<void>((resolve) =>
            setTimeout(() => {
              expect(mockCallback1).not.toBeCalled();
              resolve();
            }, waitTime),
          ));
      });
      describe('failure case', () => {
        const mockCallback1 = jest.fn();
        const mockCallback2 = jest.fn();
        let errorCtx: Promise<any>;

        beforeAll(() => {
          const emitter = userAndSockets[0];
          const listener = userAndSockets[1];

          emitter.ws.on('match-pong', mockCallback1);
          errorCtx = new Promise<any>((resolve) =>
            emitter.ws.on('error-pong', (data) => resolve(data)),
          );
          listener.ws.on('match-pong', mockCallback2);

          emitter.ws.emit('approve-pong', {
            userId: listener.user.id,
          });
        });
        // TODO: 複数のuser から invite されるケース
        it('should receive an error when approving without an existing invite', () =>
          errorCtx);
        it('user should not receive approve message from not invite user', () =>
          new Promise<void>((resolve) =>
            setTimeout(() => {
              expect(mockCallback1).not.toHaveBeenCalled();
              expect(mockCallback2).not.toHaveBeenCalled();
              resolve();
            }, waitTime),
          ));
      });
      describe('invite -> cancel -> approve: dose not match', () => {
        const mockToMatchByEmitter = jest.fn();
        const mockToMatchByListener = jest.fn();

        beforeAll(() => {
          const emitter = userAndSockets[0];
          const listener = userAndSockets[1];

          emitter.ws.on('match-pong', mockToMatchByEmitter);

          const PromiseToInvite = new Promise<any>((resolve) =>
            listener.ws.on('invite-pong', (data) => resolve(data)),
          );
          listener.ws.on('match-pong', mockToMatchByListener);

          emitter.ws.emit('invite-pong', {
            userId: listener.user.id,
          });
          return PromiseToInvite.then((data) => {
            emitter.ws.emit('invite-cancel-pong', {
              userId: data.userId,
            });
            setTimeout(() => {
              listener.ws.emit('approve-pong', {
                userId: data.userId,
              });
            }, waitTime);
          });
        });
        it('user should not receive match message from canceled invite user', () =>
          new Promise<void>((resolve) =>
            setTimeout(() => {
              expect(mockToMatchByEmitter).not.toHaveBeenCalled();
              expect(mockToMatchByListener).not.toHaveBeenCalled();
              resolve();
            }, waitTime),
          ));
      });
    });
    describe('deny invite', () => {
      describe('success case', () => {
        const mockCallback1 = jest.fn();
        const mockCallback2 = jest.fn();
        let ctxToDeny: Promise<any>;

        beforeAll(() => {
          const inviter = userAndSockets[0];
          const invitee = userAndSockets[1];
          const notInvited1 = userAndSockets[2];

          notInvited1.ws.on('invite-pong', mockCallback1);
          notInvited1.ws.on('deny-pong', mockCallback1);

          const promiseToInvite = new Promise<any>((resolve) =>
            invitee.ws.on('invite-pong', (data) => resolve(data)),
          );
          inviter.ws.emit('invite-pong', {
            userId: invitee.user.id,
          });
          ctxToDeny = new Promise<any>((resolve) =>
            inviter.ws.on('deny-pong', (data) => resolve(data)),
          );
          return promiseToInvite.then((data) => {
            invitee.ws.emit('deny-pong', {
              userId: data.userId,
            });
          });
        });
        it('inviter should receive an deny message', () => ctxToDeny);
        it('unrelated user should not receive any messages', () =>
          new Promise<void>((resolve) =>
            setTimeout(() => {
              expect(mockCallback1).not.toHaveBeenCalled();
              expect(mockCallback2).not.toHaveBeenCalled();
              resolve();
            }, waitTime),
          ));
      });
      describe('failure case', () => {
        const mockCallback1 = jest.fn();
        const mockCallback2 = jest.fn();
        let errorCtx: Promise<any>;

        beforeAll(() => {
          const emitter = userAndSockets[0];
          const listener = userAndSockets[1];

          listener.ws.on('error-pong', mockCallback2);
          emitter.ws.emit('deny-pong', {
            userId: listener.user.id,
          });
          errorCtx = new Promise<any>((resolve) =>
            emitter.ws.on('error-pong', (data) => resolve(data)),
          );
        });
        it('should receive an error when denying without an existing invite', () =>
          errorCtx);
        it('user should not receive deny message from not invite user', () =>
          new Promise<void>((resolve) =>
            setTimeout(() => {
              expect(mockCallback1).not.toHaveBeenCalled();
              expect(mockCallback2).not.toHaveBeenCalled();
              resolve();
            }, waitTime),
          ));
      });
    });
    describe('invite-cancel', () => {
      describe('success case', () => {
        const mockCallback1 = jest.fn();
        let ctxToCancel: Promise<any>;

        beforeAll(() => {
          const inviter = userAndSockets[0];
          const invitee = userAndSockets[1];
          const notInvited1 = userAndSockets[2];

          notInvited1.ws.on('invite-pong', mockCallback1);
          notInvited1.ws.on('invite-cancel-pong', mockCallback1);

          const promiseToInvite = new Promise<any>((resolve) =>
            invitee.ws.on('invite-pong', (data) => resolve(data)),
          );
          inviter.ws.emit('invite-pong', {
            userId: invitee.user.id,
          });
          ctxToCancel = new Promise<any>((resolve) =>
            invitee.ws.on('invite-cancel-pong', (data) => resolve(data)),
          );
          return promiseToInvite.then(() => {
            inviter.ws.emit('invite-cancel-pong');
          });
        });
        it('invitee should receive an invite-cancel message', () =>
          ctxToCancel.then((data) => {
            expect(data).toHaveProperty('id');
            expect(data).toHaveProperty('avatarURL');
            expect(data).toHaveProperty('name');
          }));
        it('unrelated user should not receive any messages', () =>
          new Promise<void>((resolve) =>
            setTimeout(() => {
              expect(mockCallback1).not.toHaveBeenCalled();
              resolve();
            }, waitTime),
          ));
      });
      describe('failure case', () => {
        let errorCtx: Promise<any>;
        beforeAll(() => {
          const canceler = userAndSockets[0];
          errorCtx = new Promise<any>((resolve) =>
            canceler.ws.on('error-pong', (data) => resolve(data)),
          );
          canceler.ws.emit('invite-cancel-pong');
        });
        it('should receive an error when canceling without an existing invite', () =>
          errorCtx);
      });
    });
  });
});
