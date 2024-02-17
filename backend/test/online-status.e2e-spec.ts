import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket, io } from 'socket.io-client';
import { AppModule } from 'src/app.module';
import { UserStatus } from 'src/chat/chat.service';
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

  describe('online status (login logoff) ', () => {
    let userAndSockets: UserAndSocket[];

    beforeAll(() => {
      const users = [user1, user2];
      userAndSockets = users.map((u) => {
        const ws = io('http://localhost:3000/chat', {
          extraHeaders: {
            cookie: `token=${u.accessToken}`,
          },
          autoConnect: false,
        });
        return { user: u, ws };
      });
    });
    afterEach(() => {
      userAndSockets.forEach((u) => {
        u.ws.removeAllListeners(); // otherwise, the listeners are accumulated
        u.ws.disconnect();
      });
    });
    describe('when I log in', () => {
      it('should receive the online status of me', (done) => {
        const us = userAndSockets[0];
        us.ws.on('online-status', (users) => {
          expectOnlineStatusResponse(users);
          expect(users).toHaveLength(1);
          expect(users[0].userId).toBe(us.user.id);
          expect(users[0].status).toBe(UserStatus.Online);
          done();
        });
        us.ws.connect();
      });
    });

    describe('when other user logs in', () => {
      let firstLoginUser: UserAndSocket;
      let secondLoginUser: UserAndSocket;

      beforeAll(() => {
        firstLoginUser = userAndSockets[0];
        secondLoginUser = userAndSockets[1];
        const myLogin = new Promise<void>((resolve) => {
          firstLoginUser.ws.once('online-status', () => {
            // it is my own online status
            resolve();
          });
        });
        firstLoginUser.ws.connect();
        return myLogin;
      });

      it('should receive the online status of the other user', (done) => {
        firstLoginUser.ws.on('online-status', (users) => {
          expectOnlineStatusResponse(users);
          expect(users).toHaveLength(1);
          expect(users[0].userId).toBe(secondLoginUser.user.id);
          expect(users[0].status).toBe(UserStatus.Online);
          done();
        });
        secondLoginUser.ws.connect();
      });
    });

    describe('when other user logs out', () => {
      let firstLoginUser: UserAndSocket;
      let secondLoginUser: UserAndSocket;

      beforeAll(async () => {
        firstLoginUser = userAndSockets[0];
        secondLoginUser = userAndSockets[1];
        const myLogin = new Promise<void>((resolve) => {
          firstLoginUser.ws.once('online-status', () => {
            // it is my own online status
            resolve();
          });
        });
        firstLoginUser.ws.connect();
        await myLogin;
        return myLogin.then(() => {
          const otherLogin = new Promise<void>((resolve) => {
            firstLoginUser.ws.once('online-status', () => {
              // it is the other user's online status
              resolve();
            });
          });
          secondLoginUser.ws.connect();
          return otherLogin;
        });
      });

      it('should receive the offline status of the other user', (done) => {
        firstLoginUser.ws.on('online-status', (users) => {
          expectOnlineStatusResponse(users);
          expect(users).toHaveLength(1);
          expect(users[0].userId).toBe(secondLoginUser.user.id);
          expect(users[0].status).toBe(UserStatus.Offline);
          done();
        });
        secondLoginUser.ws.disconnect();
      });
    });
  });
});
