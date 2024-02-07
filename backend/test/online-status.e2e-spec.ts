import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket, io } from 'socket.io-client';
import { AppModule } from 'src/app.module';
import { TestApp, UserEntityWithAccessToken } from './utils/app';
import { expectOnlineStatusResponse } from './utils/matcher';
import { UserStatus } from 'src/chat/chat.service';

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

const connect = (ws: Socket) => {
  return new Promise<void>((resolve) => {
    ws.on('connect', () => {
      resolve();
    });
  });
};

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
  describe('online-status (pong)', () => {
    let LoginUser: UserAndSocket;
    let pongUser: UserAndSocket;

    beforeAll(() => {
      const users = [user1, user2];
      LoginUser = {
        user: users[0],
        ws: io('http://localhost:3000/chat', {
          extraHeaders: {
            cookie: `token=${users[0].accessToken}`,
          },
          autoConnect: false,
        }),
      };
      pongUser = {
        user: users[1],
        ws: io('http://localhost:3000/pong', {
          extraHeaders: {
            cookie: `token=${users[1].accessToken}`,
          },
          query: { game_id: 'test', is_player: true },
          forceNew: true, // to avoid reusing the same connection. Otherwise, the query is not sent.
          autoConnect: false,
        }),
      };
    });
    afterEach(() => {
      LoginUser.ws.removeAllListeners(); // otherwise, the listeners are accumulated
      pongUser.ws.removeAllListeners();
      LoginUser.ws.disconnect();
      pongUser.ws.disconnect();
    });
    describe('when I login while a user start pong game', () => {
      beforeAll(() => {
        const pong = connect(pongUser.ws);
        pongUser.ws.connect();
        return pong;
      });
      it('should receive the pong status of the other user', (done) => {
        LoginUser.ws.on('online-status', (users) => {
          expectOnlineStatusResponse(users);
          expect(users).toHaveLength(2);
          {
            const pong = users.filter((u) => u.userId === pongUser.user.id);
            expect(pong).toHaveLength(1);
            expect(pong[0].status).toBe(UserStatus.Pong);
          }
          {
            const online = users.filter((u) => u.userId === LoginUser.user.id);
            expect(online).toHaveLength(1);
            expect(online[0].status).toBe(UserStatus.Online);
          }
          done();
        });
        LoginUser.ws.connect();
      });
    });
    describe('when a user start pong game while I login', () => {
      beforeAll(() => {
        const myLoginStatus = new Promise<void>((resolve) => {
          LoginUser.ws.once('online-status', () => {
            resolve();
          });
        });
        LoginUser.ws.connect();
        return myLoginStatus;
      });
      it('should receive the pong status of the other user', (done) => {
        LoginUser.ws.on('online-status', (users) => {
          expectOnlineStatusResponse(users);
          expect(users).toHaveLength(1);
          expect(users[0].userId).toBe(pongUser.user.id);
          expect(users[0].status).toBe(UserStatus.Pong);
          done();
        });
        pongUser.ws.connect();
      });
    });
  });
});
