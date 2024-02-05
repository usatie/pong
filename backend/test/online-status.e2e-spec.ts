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
  let user1: UserEntityWithAccessToken;
  let user2: UserEntityWithAccessToken;

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
    let userAndSockets: UserAndSocket[];

    beforeAll(() => {
      const users = [user1, user2];
      userAndSockets = users.map((user) => {
        const ws = io('http://localhost:3000/chat', {
          extraHeaders: {
            cookie: `token=${user.accessToken}`,
          },
        });
        return { user, ws };
      });
      return Promise.all(userAndSockets.map((u) => connect(u.ws)));
    });
    afterAll(() => {
      userAndSockets.forEach((u) => u.ws.close());
    });
    afterEach(() => {
      return userAndSockets.forEach((u) => {
        u.ws.disconnect();
        u.ws.connect();
        return connect(u.ws);
      });
    });

    describe('when a user logs in', () => {
      const eventName = 'online-status';
      let firstLoginUser: UserAndSocket;
      let secondLoginUser: UserAndSocket;

      beforeAll(async () => {
        firstLoginUser = userAndSockets[0];
        secondLoginUser = userAndSockets[1];
      });

      it('should emit the online status of the user', (done) => {
        firstLoginUser.ws.on(eventName, (users) => {
          expectOnlineStatusResponse(users);
          expect(users).toHaveLength(1);
          const filterd = users.filter(
            (user) => user.userId === firstLoginUser.user.id,
          );
          expect(filterd).toHaveLength(1);
          expect(filterd[0].status).toBe('online');
          done();
        });
      });

      it('should emit the online status of the user', (done) => {
        secondLoginUser.ws.on(eventName, (users) => {
          expectOnlineStatusResponse(users);
          expect(users).toHaveLength(2);
          {
            const filterd = users.filter(
              (user) => user.userId === firstLoginUser.user.id,
            );
            expect(filterd).toHaveLength(1);
            expect(filterd[0].status).toBe('online');
          }
          {
            const filterd = users.filter(
              (user) => user.userId === secondLoginUser.user.id,
            );
            expect(filterd).toHaveLength(1);
            expect(filterd[0].status).toBe('online');
          }
          done();
        });
      });
    });
    describe('when a user logs out', () => {
      const eventName = 'online-status';
      let loginUser: UserAndSocket;
      let logoutUser: UserAndSocket;

      beforeAll(async () => {
        loginUser = userAndSockets[0];
        logoutUser = userAndSockets[1];
      });

      it('should emit the offline status when a user logs out', (done) => {
        loginUser.ws.on(eventName, () => {
          loginUser.ws.removeAllListeners();
          loginUser.ws.on(eventName, (users) => {
            expectOnlineStatusResponse(users);
            expect(users).toHaveLength(1);
            const filterd = users.filter(
              (u) => u.userId === logoutUser.user.id,
            );
            expect(filterd).toHaveLength(1);
            expect(filterd[0].status).toBe('offline');
            done();
          });
          logoutUser.ws.disconnect();
        });
      });
    });

    describe('when a user start pong game', () => {});
  });
});
