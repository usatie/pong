import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { initializeApp } from './utils/initialize';
import { constants } from './constants';
import { LoginDto } from 'src/auth/dto/login.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

describe('RoomController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await initializeApp();
  });
  afterAll(() => app.close());

  /* User API */
  const deleteUser = (id: number) => {
    return request(app.getHttpServer()).delete(`/user/${id}`);
  };

  const createUser = (user: CreateUserDto) => {
    return request(app.getHttpServer()).post('/user').send(user);
  };

  /* Auth API */
  const login = (login: LoginDto) => {
    return request(app.getHttpServer()).post('/auth/login').send(login);
  };

  /* Match API */
  const createMatch = (
    winnerId: number,
    winnerScore: number,
    loserId: number,
    loserScore: number,
  ) => {
    return request(app.getHttpServer())
      .post('/history')
      .send({
        winner: {
          userId: winnerId,
          score: winnerScore,
        },
        loser: {
          userId: loserId,
          score: loserScore,
        },
      });
  };

  /* Utils */
  const getUserIdFromAccessToken = (accessToken: string) => {
    const payloadBase64 = accessToken.split('.')[1];
    const payloadBuf = Buffer.from(payloadBase64, 'base64');
    const payloadString = payloadBuf.toString('utf-8');
    const payload = JSON.parse(payloadString);
    return payload.userId;
  };

  const getHistory = (userId: number, accessToken: string) => {
    return request(app.getHttpServer())
      .get(`/user/${userId}/history`)
      .set('Authorization', `Bearer ${accessToken}`);
  };

  const expectHistoryResponse = (res: request.Response) => {
    const expectUser = (user: any) => {
      const expected = {
        id: expect.any(Number),
        email: expect.any(String),
        name: expect.any(String),
        avatarURL: expect.any(String),
        password: expect.any(String),
      };
      // TODO: Remove password and email from response
      // TODO: Force avatarURL to be not null
      // TODO: Remove this try-catch
      try {
        expect(user).toEqual(expected);
      } catch {
        // Remove password from expected object
        expected.avatarURL = null;
        expect(user).toEqual(expected);
      }
    };
    const expectPlayerObject = (player: any) => {
      const expected = {
        id: expect.any(Number),
        score: expect.any(Number),
        winLose: expect.any(String),
        user: expect.any(Object),
        matchId: expect.any(Number),
        createdAt: expect.any(String),
        userId: expect.any(Number),
      };
      // TODO: Remove createdAt from response
      // TODO: Remove userId from response
      // TODO: Remove matchId from response
      expect(player).toEqual(expected);
      expectUser(player.user);
    };
    const expectHistoryObject = (history: any) => {
      const expected = {
        id: expect.any(Number),
        players: expect.any(Array),
        result: expect.any(String),
        createdAt: expect.any(String),
      };
      expect(history).toEqual(expected);
      history.players.forEach(expectPlayerObject);
    };
    expect(res.body).toBeInstanceOf(Array);
    res.body.forEach(expectHistoryObject);
  };

  describe('Match API', () => {
    let userId: number;
    let accessToken: string;

    beforeAll(async () => {
      // Create user
      let res = await createUser(constants.user.test);

      // Login
      const loginDto: LoginDto = {
        email: constants.user.test.email,
        password: constants.user.test.password,
      };
      res = await login(loginDto).expect(201);
      accessToken = res.body.accessToken;
      userId = getUserIdFromAccessToken(accessToken);
    });

    afterAll(async () => {
      await deleteUser(userId).set('Authorization', `Bearer ${accessToken}`);
    });

    it('should create a match', async () => {
      await createMatch(userId, 10, 1, 5).expect(201);
      await createMatch(userId, 8, 2, 10).expect(201);
    });

    it('should return 200 OK', async () => {
      await getHistory(userId, accessToken)
        .expect(200)
        .expect(expectHistoryResponse);
    });
  });
});
