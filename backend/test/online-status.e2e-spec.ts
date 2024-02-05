import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket, io } from 'socket.io-client';
import { AppModule } from 'src/app.module';
import { TestApp, UserEntityWithAccessToken } from './utils/app';
import { expectOnlineStatusResponse } from './utils/matcher';

type UserAndSocket = {
  user: UserEntityWithAccessToken;
  ws: Socket;
};

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
    describe('when a user logs in', () => {
      let firstLoginUser: UserAndSocket;
      let secondLoginUser: UserAndSocket;

      beforeAll(async () => {
        firstLoginUser.user = user1;
        secondLoginUser.user = user2;
        firstLoginUser.ws = io('http://localhost:3000', {
          auth: { token: user1.accessToken },
        });
        secondLoginUser.ws = io('http://localhost:3000', {
          auth: { token: user2.accessToken },
        });
        await connect(firstLoginUser.ws);
        await connect(secondLoginUser.ws);
      });

      afterAll(async () => {
        firstLoginUser.ws.disconnect();
        secondLoginUser.ws.disconnect();
      });

      it('should emit the online status of the user', (done) => {
        firstLoginUser.ws.on('online-status', (status) => {
          expectOnlineStatusResponse(status);
          expect(status).toHaveLength(2);
          const [user1Status, user2Status] = status;
          expect(user1Status.userId).toBe(user1.id);
          expect(user1Status.online).toBe(true);
          expect(user2Status.userId).toBe(user2.id);
          expect(user2Status.online).toBe(false);
          done();
        });
      });

      it('should emit the online status of the user', (done) => {
        secondLoginUser.ws.on('online-status', (status) => {
          expectOnlineStatusResponse(status);
          expect(status).toHaveLength(2);
          const [user1Status, user2Status] = status;
          expect(user1Status.userId).toBe(user1.id);
          expect(user1Status.online).toBe(true);
          expect(user2Status.userId).toBe(user2.id);
          expect(user2Status.online).toBe(true);
          done();
        });
      });
    });
  });
});
