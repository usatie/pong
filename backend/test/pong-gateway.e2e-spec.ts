import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket, io } from 'socket.io-client';
import { AppModule } from 'src/app.module';
import { TestApp } from './utils/app';
import { expectHistoryResponse } from './utils/matcher';

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
  let user1, user2;

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
    user1 = await app.createAndLoginUser(dto1);
    user2 = await app.createAndLoginUser(dto2);
  });

  afterAll(async () => {
    await app.deleteUser(user1.id, user1.accessToken).expect(204);
    await app.deleteUser(user2.id, user2.accessToken).expect(204);
    await app.close();
    ws1.close();
    ws2.close();
  });

  const connect = (ws: Socket) => {
    return new Promise<void>((resolve) => {
      ws.on('connect', () => {
        resolve();
      });
    });
  };

  describe('connect', () => {
    it('Connects to chat server', async () => {
      ws1 = io('ws://localhost:3000/pong', {
        extraHeaders: { cookie: 'token=' + user1.accessToken },
        query: { game_id: 'test-game-id', is_player: true },
      });
      ws2 = io('ws://localhost:3000/pong', {
        extraHeaders: { cookie: 'token=' + user2.accessToken },
        query: { game_id: 'test-game-id', is_player: true },
      });
      expect(ws1).toBeDefined();
      expect(ws2).toBeDefined();

      // Wait for connection
      await connect(ws1);
      await connect(ws2);

      expect(ws1.connected).toBeTruthy();
      expect(ws2.connected).toBeTruthy();
    });
  });

  describe('collide', () => {
    it('creates a match result', async () => {
      ws1.emit('collide');
      ws1.emit('collide');
      ws1.emit('collide');

      await app
        .getHistory(user1.id, user1.accessToken)
        .expect(200)
        .expect(expectHistoryResponse)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].result).toBe('COMPLETE');
          expect(res.body[0].players).toHaveLength(2);
          const result1 = res.body[0].players.find(
            (player) => player.user.id === user1.id,
          );
          const result2 = res.body[0].players.find(
            (player) => player.user.id === user2.id,
          );
          expect(result1).toBeDefined();
          expect(result2).toBeDefined();
          expect(result1.score).toBe(0);
          expect(result2.score).toBe(3);
          expect(result1.winLose).toBe('LOSE');
          expect(result2.winLose).toBe('WIN');
        });
    });
  });
});
