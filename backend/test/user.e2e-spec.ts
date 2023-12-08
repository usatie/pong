import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { initializeApp } from './utils/initialize';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { LoginDto } from 'src/auth/dto/login.dto';
import { expectUser } from './utils/matcher';
import { constants } from './constants';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  /* User API */
  const getUsers = () => {
    return request(app.getHttpServer()).get('/user');
  };

  const getUser = (id: number) => {
    return request(app.getHttpServer()).get(`/user/${id}`);
  };

  const updateUser = (id: number, user: UpdateUserDto) => {
    return request(app.getHttpServer()).patch(`/user/${id}`).send(user);
  };

  const deleteUser = (id: number) => {
    return request(app.getHttpServer()).delete(`/user/${id}`);
  };

  const createUser = (user: CreateUserDto) => {
    return request(app.getHttpServer()).post('/user').send(user);
  };

  /* Friend API (Private) */
  const sendFriendRequest = (
    userId: number,
    recipientId: number,
    accessToken: string,
  ) => {
    return request(app.getHttpServer())
      .post(`/user/${userId}/friendrequest`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ recipientId });
  };

  const getFriendRequests = (userId: number, accessToken: string) => {
    return request(app.getHttpServer())
      .get(`/user/${userId}/friendrequest`)
      .set('Authorization', `Bearer ${accessToken}`);
  };

  const cancelFriendRequest = (
    userId: number,
    recipientId: number,
    accessToken: string,
  ) => {
    return request(app.getHttpServer())
      .patch(`/user/${userId}/friendrequest/${recipientId}/cancel`)
      .set('Authorization', `Bearer ${accessToken}`);
  };

  const acceptFriendRequest = (
    userId: number,
    requesterId: number,
    accessToken: string,
  ) => {
    return request(app.getHttpServer())
      .patch(`/user/${userId}/friendrequest/${requesterId}/accept`)
      .set('Authorization', `Bearer ${accessToken}`);
  };

  const rejectFriendRequest = (
    userId: number,
    requesterId: number,
    accessToken: string,
  ) => {
    return request(app.getHttpServer())
      .patch(`/user/${userId}/friendrequest/${requesterId}/reject`)
      .set('Authorization', `Bearer ${accessToken}`);
  };

  const unfriend = (userId: number, friendId: number, accessToken: string) => {
    return request(app.getHttpServer())
      .post(`/user/${userId}/unfriend`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ friendId });
  };

  const getBlockingUsers = (userId: number, accessToken: string) => {
    return request(app.getHttpServer())
      .get(`/user/${userId}/block`)
      .set('Authorization', `Bearer ${accessToken}`);
  };

  const blockUser = (
    userId: number,
    blockedUserId: number,
    accessToken: string,
  ) => {
    return request(app.getHttpServer())
      .post(`/user/${userId}/block`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ blockedUserId });
  };

  const unblockUser = (userId: number, blockedUserId, accessToken: string) => {
    return request(app.getHttpServer())
      .post(`/user/${userId}/unblock`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ blockedUserId });
  };

  /* Friend API (Public) */
  const getFriends = (userId: number, accessToken: string) => {
    return request(app.getHttpServer())
      .get(`/user/${userId}/friend`)
      .set('Authorization', `Bearer ${accessToken}`);
  };

  /* Auth API */
  const login = (login: LoginDto) => {
    return request(app.getHttpServer()).post('/auth/login').send(login);
  };

  beforeAll(async () => {
    app = await initializeApp();
  });
  afterAll(() => app.close());

  describe('Without authentiation', () => {
    it('GET /user should return users list', async () => {
      const res = await getUsers().expect(200);
      const users = res.body;
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBeGreaterThan(0);
      users.forEach(expectUser);
    });

    it('GET /user/:id should return 401 Unauthorized', () => {
      return getUser(1).expect(401);
    });

    it('PATCH /user/:id should return 401 Unauthorized', () => {
      return updateUser(1, {}).expect(401);
    });

    it('DELETE /user/:id should return 401 Unauthorized', () => {
      return deleteUser(1).expect(401);
    });
  });

  describe('Invalid Sign up', () => {
    it('POST /user with invalid email should return 400 Bad Request', () => {
      const dto: CreateUserDto = {
        name: constants.user.test.name,
        email: 'invalid',
        password: constants.user.test.password,
      };
      return createUser(dto).expect(400);
    });

    it('POST /user with too short name should return 400 Bad Request', () => {
      const dto: CreateUserDto = {
        name: 'a',
        email: constants.user.test.email,
        password: constants.user.test.password,
      };
      return createUser(dto).expect(400);
    });

    it('POST /user with too short password should return 400 Bad Request', () => {
      const dto: CreateUserDto = {
        name: constants.user.test.name,
        email: constants.user.test.email,
        password: 'a',
      };
      return createUser(dto).expect(400);
    });
  });

  describe('Invalid authentication', () => {
    it('POST /auth/login with invalid email should return 400 Bad Request', () => {
      const dto: LoginDto = {
        email: 'invalid',
        password: constants.user.test.password,
      };
      return login(dto).expect(400);
    });

    it('POST /auth/login with email not registered should return 404 Not Found', () => {
      const dto: LoginDto = {
        email: 'nosuchuser@example.com',
        password: constants.user.test.password,
      };
      return login(dto).expect(404);
    });

    it('POST /auth/login with invalid password should return 401 Unauthorized', () => {
      const dto = {
        email: constants.user.susami.email,
        password: 'invalid',
      };
      return login(dto).expect(401);
    });
  });

  describe('[Sign up] => [Log in] => [Delete]', () => {
    let userId: number;
    let accessToken: string;

    it('POST /user should return 201 Created', async () => {
      const res = await createUser(constants.user.test)
        .expect(201)
        .expect((res) => expectUser(res.body));
      userId = res.body.id;
    });

    it('POST /auth/login should return 201 Created', async () => {
      const dto: LoginDto = {
        email: constants.user.test.email,
        password: constants.user.test.password,
      };
      const res = await login(dto).expect(201);
      accessToken = res.body.accessToken;
    });

    it('DELETE /user/:id should return 204 No Content', async () => {
      return deleteUser(userId)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204)
        .expect({});
    });
  });

  describe('With authentication', () => {
    let userId: number;
    let accessToken: string;

    beforeAll(async () => {
      let res = await createUser(constants.user.test);
      userId = res.body.id;

      const loginDto: LoginDto = {
        email: constants.user.test.email,
        password: constants.user.test.password,
      };
      res = await login(loginDto);
      accessToken = res.body.accessToken;
    });

    afterAll(async () => {
      await deleteUser(userId).set('Authorization', `Bearer ${accessToken}`);
    });

    it('GET /user/:id should return the user', () => {
      const expected = {
        id: userId,
        email: constants.user.test.email,
        name: constants.user.test.name,
      };
      return getUser(userId)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(expected);
    });

    it('PATCH /user/:id should update the user', () => {
      const dto: UpdateUserDto = {
        name: 'new_name',
      };
      const expected = {
        id: userId,
        email: constants.user.test.email,
        name: 'new_name',
      };
      return updateUser(userId, dto)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(expected);
    });
  });

  describe('Friend Request', () => {
    let user1;
    let user2;

    beforeAll(async () => {
      const setupUser = async (dto) => {
        let res = await createUser(dto);
        const user = res.body;
        const loginDto: LoginDto = {
          email: dto.email,
          password: dto.password,
        };
        res = await login(loginDto);
        user.accessToken = res.body.accessToken;
        return user;
      };
      user1 = await setupUser(constants.user.test);
      user2 = await setupUser(constants.user.test2);
    });

    afterAll(async () => {
      const teardownUser = (user) => {
        return deleteUser(user.id).set(
          'Authorization',
          `Bearer ${user.accessToken}`,
        );
      };
      await teardownUser(user1);
      await teardownUser(user2);
    });

    it('Invalid access token should return 401 Unauthorized', async () => {
      await getFriendRequests(user1.id, 'invalid').expect(401);
      await sendFriendRequest(user1.id, user2.id, 'invalid').expect(401);
      await acceptFriendRequest(user1.id, user2.id, 'invalid').expect(401);
      await rejectFriendRequest(user1.id, user2.id, 'invalid').expect(401);
      await cancelFriendRequest(user1.id, user2.id, 'invalid').expect(401);
    });

    it('user2 should get empty friend requests', async () => {
      const users = await getFriendRequests(user2.id, user2.accessToken)
        .expect(200)
        .then((res) => res.body);
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBe(0);
    });

    it('user1 should send a friend request to user2', async () => {
      await sendFriendRequest(user1.id, user2.id, user1.accessToken).expect(
        201,
      );
      const users = await getFriendRequests(user2.id, user2.accessToken)
        .expect(200)
        .then((res) => res.body);
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBe(1);
      const expected = { ...user1 };
      delete expected.accessToken;
      expect(users).toContainEqual(expected);
    });

    it('user1 should cancel the friend request to user2', async () => {
      await cancelFriendRequest(user1.id, user2.id, user1.accessToken).expect(
        200,
      );
      const users = await getFriendRequests(user2.id, user2.accessToken)
        .expect(200)
        .then((res) => res.body);
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBe(0);
    });

    it('user2 should reject the friend request from user1', async () => {
      await sendFriendRequest(user1.id, user2.id, user1.accessToken).expect(
        201,
      );
      await rejectFriendRequest(user2.id, user1.id, user2.accessToken).expect(
        200,
      );
      const users = await getFriendRequests(user2.id, user2.accessToken)
        .expect(200)
        .then((res) => res.body);
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBe(0);
    });

    it('user2 should accept the friend request from user1', async () => {
      await sendFriendRequest(user1.id, user2.id, user1.accessToken).expect(
        201,
      );
      await acceptFriendRequest(user2.id, user1.id, user2.accessToken).expect(
        200,
      );
      const users = await getFriendRequests(user2.id, user2.accessToken)
        .expect(200)
        .then((res) => res.body);
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBe(0);
    });
  });

  describe('Friend', () => {
    let user1;
    let user2;

    beforeAll(async () => {
      const setupUser = async (dto) => {
        let res = await createUser(dto);
        const user = res.body;
        const loginDto: LoginDto = {
          email: dto.email,
          password: dto.password,
        };
        res = await login(loginDto);
        user.accessToken = res.body.accessToken;
        return user;
      };
      user1 = await setupUser(constants.user.test);
      user2 = await setupUser(constants.user.test2);
    });

    afterAll(async () => {
      const teardownUser = (user) => {
        return deleteUser(user.id).set(
          'Authorization',
          `Bearer ${user.accessToken}`,
        );
      };
      await teardownUser(user1);
      await teardownUser(user2);
    });

    it('Invalid access token should return 401 Unauthorized', async () => {
      await getFriends(user1.id, 'invalid').expect(401);
      await unfriend(user1.id, user2.id, 'invalid').expect(401);
    });

    it('user1 should get empty friends list', async () => {
      await getFriends(user1.id, user1.accessToken).expect(200).expect([]);
    });

    it('user1 and user2 should become friend', async () => {
      await sendFriendRequest(user1.id, user2.id, user1.accessToken).expect(
        201,
      );
      await acceptFriendRequest(user2.id, user1.id, user2.accessToken).expect(
        200,
      );
    });

    it('user1 should get user2 in friends list', async () => {
      const expected = [{ ...user2 }];
      expected.forEach((user) => delete user.accessToken);
      await getFriends(user1.id, user1.accessToken)
        .expect(200)
        .expect(expected);
    });

    it('user2 should get user1 in friends list', async () => {
      const expected = [{ ...user1 }];
      expected.forEach((user) => delete user.accessToken);
      await getFriends(user2.id, user2.accessToken)
        .expect(200)
        .expect(expected);
    });

    it('user1 should unfriend user2', async () => {
      await unfriend(user1.id, user2.id, user1.accessToken)
        .expect(200)
        .expect('Unfriended');
      await getFriends(user1.id, user1.accessToken).expect(200).expect([]);
      await getFriends(user2.id, user2.accessToken).expect(200).expect([]);
    });
  });

  describe('Block', () => {
    let user1;
    let user2;

    beforeAll(async () => {
      const setupUser = async (dto) => {
        let res = await createUser(dto);
        const user = res.body;
        const loginDto: LoginDto = {
          email: dto.email,
          password: dto.password,
        };
        res = await login(loginDto);
        user.accessToken = res.body.accessToken;
        return user;
      };
      user1 = await setupUser(constants.user.test);
      user2 = await setupUser(constants.user.test2);
    });

    afterAll(async () => {
      const teardownUser = (user) => {
        return deleteUser(user.id).set(
          'Authorization',
          `Bearer ${user.accessToken}`,
        );
      };
      await teardownUser(user1);
      await teardownUser(user2);
    });

    it('Invalid access token should return 401 Unauthorized', async () => {
      await blockUser(user1.id, user2.id, 'invalid').expect(401);
      await unblockUser(user1.id, user2.id, 'invalid').expect(401);
    });

    it('user1 and user2 should become friend', async () => {
      await sendFriendRequest(user1.id, user2.id, user1.accessToken).expect(
        201,
      );
      await acceptFriendRequest(user2.id, user1.id, user2.accessToken).expect(
        200,
      );
    });

    it('user1 and user2 should get empty blocking users list', async () => {
      await getBlockingUsers(user1.id, user1.accessToken)
        .expect(200)
        .expect([]);
      await getBlockingUsers(user2.id, user2.accessToken)
        .expect(200)
        .expect([]);
    });

    it('user1 should block user2', async () => {
      await blockUser(user1.id, user2.id, user1.accessToken)
        .expect(200)
        .expect('Blocked');
    });

    it('user1 should get updated blocking users list', async () => {
      const expected = [{ ...user2 }];
      expected.forEach((user) => delete user.accessToken);
      await getBlockingUsers(user1.id, user1.accessToken)
        .expect(200)
        .expect(expected);
    });

    it('user2 should get empty blocking users list', async () => {
      await getBlockingUsers(user2.id, user2.accessToken)
        .expect(200)
        .expect([]);
    });

    it('user1 and user2 should get empty friends list', async () => {
      await getFriends(user1.id, user1.accessToken).expect(200).expect([]);
      await getFriends(user2.id, user2.accessToken).expect(200).expect([]);
    });
  });
});
