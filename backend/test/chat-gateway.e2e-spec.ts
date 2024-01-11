import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket, io } from 'socket.io-client';
import { AppModule } from 'src/app.module';
import { MessageEntity } from 'src/chat/entities/message.entity';
import { constants } from './constants';
import { TestApp } from './utils/app';

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
  let user1, user2, blockedUser1, blockedUser2;

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
    user1 = await app.createAndLoginUser(dto1);
    user2 = await app.createAndLoginUser(dto2);
    blockedUser1 = await app.createAndLoginUser(dto3);
    blockedUser2 = await app.createAndLoginUser(dto4);
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
    await app.close();
    ws1.close();
    ws2.close();
    ws3.close();
    ws4.close();
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
      expect(ws1).toBeDefined();
      expect(ws2).toBeDefined();
      expect(ws3).toBeDefined();
      expect(ws4).toBeDefined();

      // Wait for connection
      await connect(ws1);
      await connect(ws2);
      await connect(ws3);
      await connect(ws4);
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
    });

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

    let ctx3, ctx4: Promise<void>;
    it('setup promises to not recv messages from blockedUser1', async () => {
      await new Promise((r) => setTimeout(r, 1000));
      ctx3 = new Promise<void>((resolve) => {
        ws1.on('message', (data) => {
          console.error(data);
          throw new Error(
            'User1 should not receive any message from blockedUser1',
          );
        });
        setTimeout(() => {
          ws1.off('message');
          resolve();
        }, 3000);
      });
      ctx4 = new Promise<void>((resolve) => {
        ws2.on('message', (data) => {
          console.error(data);
          throw new Error(
            'User2 should not receive any message from blockedUser1',
          );
        });
        setTimeout(() => {
          ws2.off('message');
          resolve();
        }, 3000);
      });
    });

    it('blockedUser1 sends message', () => {
      const helloMessage = {
        userId: blockedUser1.id,
        roomId: room.id,
        content: 'hello',
      };
      ws3.emit('message', helloMessage);
    });

    it('user1 and user2 should not receive message from blockedUser1', async () => {
      await ctx3;
      await ctx4;
    });

    it('user1 and user2 block blockedUser2', async () => {
      await app
        .blockUser(user1.id, blockedUser2.id, user1.accessToken)
        .expect(200);
      await app
        .blockUser(user2.id, blockedUser2.id, user2.accessToken)
        .expect(200);
    });

    let ctx5, ctx6: Promise<void>;
    it('setup promises to not recv messages from blockedUser2', async () => {
      await new Promise((r) => setTimeout(r, 1000));
      ctx5 = new Promise<void>((resolve) => {
        ws1.on('message', (data) => {
          console.error(data);
          throw new Error(
            'User1 should not receive any message from blockedUser2',
          );
        });
        setTimeout(() => {
          ws1.off('message');
          resolve();
        }, 3000);
      });
      ctx6 = new Promise<void>((resolve) => {
        ws2.on('message', (data) => {
          console.error(data);
          throw new Error(
            'User2 should not receive any message from blockedUser2',
          );
        });
        setTimeout(() => {
          ws2.off('message');
          resolve();
        }, 3000);
      });
    });

    it('blockedUser2 sends message', () => {
      const helloMessage = {
        userId: blockedUser2.id,
        roomId: room.id,
        content: 'hello',
      };
      ws4.emit('message', helloMessage);
    });

    it('user1 and user2 should not receive message from blockedUser2', async () => {
      await ctx5;
      await ctx6;
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

    it('user1 unblocks blockedUser1', async () => {
      await app
        .unblockUser(user1.id, blockedUser1.id, user1.accessToken)
        .expect(200);
    });

    let ctx7, ctx8: Promise<void>;
    it('setup promises to recv messages from blockedUser1 after unblocking', async () => {
      await new Promise((r) => setTimeout(r, 1000));
      ctx7 = new Promise<void>((resolve) => {
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
      ctx8 = new Promise<void>((resolve) => {
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
      await ctx7;
    });

    it('blockedUser1 receives ACK', async () => {
      await ctx8;
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
});
