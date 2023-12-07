import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket, io } from 'socket.io-client';
import { AppModule } from 'src/app.module';
import { ChatGateway } from 'src/chat/chat.gateway';

async function createNestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  return app;
}

const roomId = 'test-room';

const constants = {
  roomId,
  message: {
    userName: 'test-user',
    text: 'hello',
    roomId: roomId,
  },
};

describe('AppController (e2e)', () => {
  let app: INestApplication; // Server
  let ws1: Socket; // Client socket 1
  let ws2: Socket; // Client socket 2

  beforeEach(async () => {
    app = await createNestApp();
    await app.listen(3000);
    ws1 = io('ws://localhost:3000/chat');
    ws2 = io('ws://localhost:3000/chat');
  });
  afterEach(async () => {
    await app.close();
    ws1.close();
    ws2.close();
  });

  describe('[joinRoom]', () => {
    it('one user should join the room', async () => {
      // joinRoom
      ws1.emit('joinRoom', constants.roomId);

      // Wait 100ms for server to handle joinRoom
      await new Promise((resolve) => setTimeout(resolve, 100));

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
      ws1.emit('joinRoom', constants.roomId);
      ws2.emit('joinRoom', constants.roomId);

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
      ws1.emit('joinRoom', constants.roomId);

      // newMessage
      ws1.emit('newMessage', constants.message);

      // client receives the message
      await new Promise<void>((resolve) => {
        ws1.on('sendToClient', (data) => {
          expect(data).toEqual(constants.message);
          resolve();
        });
      });
    });

    it('A user should receive a message sent by another user', async () => {
      // joinRoom
      ws1.emit('joinRoom', constants.roomId);
      ws2.emit('joinRoom', constants.roomId);

      // newMessage
      ws1.emit('newMessage', constants.message);

      // TODO
    });
  });

  describe('[privateMessage]', () => {
    // TODO
  });
  describe('[block]', () => {
    // TODO
  });
  describe('[unblock]', () => {
    // TODO
  });
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
