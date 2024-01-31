import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket, io } from 'socket.io-client';
import { AppModule } from 'src/app.module';
import { TestApp, UserEntityWithAccessToken } from './utils/app';

async function createNestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  return app;
}

describe('ChatGateway and ChatController (e2e)', () => {
  let app: TestApp;
  let user1;
  let user2;

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
  });

  const connect = (ws: Socket) => {
    return new Promise<void>((resolve) => {
      ws.on('connect', () => {
        resolve();
      });
    });
  };

  describe('online status', () => {
    let onlineUser;
    let onlineUserSocket;
    let offlineUser;

    beforeAll(async () => {
      onlineUser = user1;
      onlineUserSocket = io('ws://localhost:3000/chat', {
        extraHeaders: { cookie: 'token=' + onlineUser.accessToken },
      });
      await connect(onlineUserSocket);
      offlineUser = user2;
    });
    afterAll(() => {
      onlineUserSocket.close();
    });

    it('connected user should be online', async () => {
      const res = await app
        .isOnline(onlineUser.id, onlineUser.accessToken)
        .expect(200);
      const body = res.body;
      expect(body.isOnline).toEqual(true);
    });
    it('disconnected user should be offline', async () => {
      const res = await app
        .isOnline(offlineUser.id, offlineUser.accessToken)
        .expect(200);
      const body = res.body;
      expect(body.isOnline).toEqual(false);
    });
    it('check online status with invalid access token should be unauthorized', async () => {
      await app.isOnline(onlineUser.id, '').expect(401);
    });
  });
});
