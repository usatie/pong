import { LoginDto } from 'src/auth/dto/login.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { constants } from './constants';
import { TestApp } from './utils/app';
import { initializeApp } from './utils/initialize';
import { expectPublicUser, expectUser } from './utils/matcher';

describe('UserController (e2e)', () => {
  let app: TestApp;

  beforeAll(async () => {
    app = new TestApp(await initializeApp());
  });
  afterAll(() => app.close());

  describe('Without authentiation', () => {
    it('GET /user should return users list', async () => {
      const res = await app.getUsers().expect(200);
      const users = res.body;
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBeGreaterThan(0);
      users.forEach(expectPublicUser);
    });

    it('GET /user/:id should return 401 Unauthorized', () => {
      return app.getUser(1, 'invalid_token').expect(401);
    });

    it('PATCH /user/:id should return 401 Unauthorized', () => {
      return app.updateUser(1, {}, 'invalid_token').expect(401);
    });

    it('DELETE /user/:id should return 401 Unauthorized', () => {
      return app.deleteUser(1, 'invalid_token').expect(401);
    });
  });

  describe('Invalid Sign up', () => {
    it('POST /user with invalid email should return 400 Bad Request', () => {
      const dto: CreateUserDto = {
        name: constants.user.test.name,
        email: 'invalid',
        password: constants.user.test.password,
      };
      return app.createUser(dto).expect(400);
    });

    it('POST /user with too short name should return 400 Bad Request', () => {
      const dto: CreateUserDto = {
        name: 'a',
        email: constants.user.test.email,
        password: constants.user.test.password,
      };
      return app.createUser(dto).expect(400);
    });

    it('POST /user with too short password should return 400 Bad Request', () => {
      const dto: CreateUserDto = {
        name: constants.user.test.name,
        email: constants.user.test.email,
        password: 'a',
      };
      return app.createUser(dto).expect(400);
    });
  });

  describe('Invalid authentication', () => {
    it('POST /auth/login with invalid email should return 400 Bad Request', () => {
      const dto: LoginDto = {
        email: 'invalid',
        password: constants.user.test.password,
      };
      return app.login(dto).expect(400);
    });

    it('POST /auth/login with email not registered should return 404 Not Found', () => {
      const dto: LoginDto = {
        email: 'nosuchuser@example.com',
        password: constants.user.test.password,
      };
      return app.login(dto).expect(404);
    });

    it('POST /auth/login with invalid password should return 401 Unauthorized', () => {
      const dto = {
        email: constants.user.susami.email,
        password: 'invalid',
      };
      return app.login(dto).expect(401);
    });
  });

  describe('[Sign up] => [Log in] => [Delete]', () => {
    let user;

    it('POST /user should return 201 Created', async () => {
      const res = await app
        .createUser(constants.user.test)
        .expect(201)
        .expect((res) => expectUser(res.body));
      user = res.body;
    });

    it('POST /auth/login should return 201 Created', async () => {
      const dto: LoginDto = {
        email: constants.user.test.email,
        password: constants.user.test.password,
      };
      const res = await app.login(dto).expect(201);
      expect(res.body.accessToken).toBeDefined();
      user.accessToken = res.body.accessToken;
    });

    it('DELETE /user/:id should return 204 No Content', async () => {
      return app.deleteUser(user.id, user.accessToken).expect(204).expect({});
    });
  });

  describe('With authentication', () => {
    let user;

    beforeAll(async () => {
      user = await app.createAndLoginUser(constants.user.test);
    });

    afterAll(async () => {
      await app.deleteUser(user.id, user.accessToken);
    });

    it('GET /user/:id should return the user', () => {
      const expected = {
        id: user.id,
        name: constants.user.test.name,
        avatarURL: null,
      };
      return app
        .getUser(user.id, user.accessToken)
        .expect(200)
        .expect(expected);
    });

    it('PATCH /user/:id should update the user', () => {
      const dto: UpdateUserDto = {
        name: 'new_name',
      };
      const expected = {
        id: user.id,
        email: constants.user.test.email,
        name: 'new_name',
        avatarURL: null,
        twoFactorEnabled: false,
      };
      return app
        .updateUser(user.id, dto, user.accessToken)
        .expect(200)
        .expect(expected);
    });
  });

  describe('Friend Request', () => {
    let user1;
    let user2;

    beforeAll(async () => {
      const setupUser = async (dto) => {
        let res = await app.createUser(dto);
        const user = res.body;
        const loginDto: LoginDto = {
          email: dto.email,
          password: dto.password,
        };
        res = await app.login(loginDto);
        user.accessToken = res.body.accessToken;
        return user;
      };
      user1 = await setupUser(constants.user.test);
      user2 = await setupUser(constants.user.test2);
    });

    afterAll(async () => {
      await app.deleteUser(user1.id, user1.accessToken);
      await app.deleteUser(user2.id, user2.accessToken);
    });

    it('Invalid access token should return 401 Unauthorized', async () => {
      await app.getFriendRequests(user1.id, 'invalid').expect(401);
      await app.sendFriendRequest(user1.id, user2.id, 'invalid').expect(401);
      await app.acceptFriendRequest(user1.id, user2.id, 'invalid').expect(401);
      await app.rejectFriendRequest(user1.id, user2.id, 'invalid').expect(401);
      await app.cancelFriendRequest(user1.id, user2.id, 'invalid').expect(401);
    });

    it('user2 should get empty friend requests', async () => {
      const users = await app
        .getFriendRequests(user2.id, user2.accessToken)
        .expect(200)
        .then((res) => res.body);
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBe(0);
    });

    it('user1 should send a friend request to user2', async () => {
      await app
        .sendFriendRequest(user1.id, user2.id, user1.accessToken)
        .expect(201);
      const users = await app
        .getFriendRequests(user2.id, user2.accessToken)
        .expect(200)
        .then((res) => res.body);
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBe(1);
      const expected = { ...user1 };
      delete expected.accessToken;
      expect(users).toContainEqual(expected);
    });

    it('user1 should cancel the friend request to user2', async () => {
      await app
        .cancelFriendRequest(user1.id, user2.id, user1.accessToken)
        .expect(200);
      const users = await app
        .getFriendRequests(user2.id, user2.accessToken)
        .expect(200)
        .then((res) => res.body);
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBe(0);
    });

    it('user2 should reject the friend request from user1', async () => {
      await app
        .sendFriendRequest(user1.id, user2.id, user1.accessToken)
        .expect(201);
      await app
        .rejectFriendRequest(user2.id, user1.id, user2.accessToken)
        .expect(200);
      const users = await app
        .getFriendRequests(user2.id, user2.accessToken)
        .expect(200)
        .then((res) => res.body);
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBe(0);
    });

    it('user2 should accept the friend request from user1', async () => {
      await app
        .sendFriendRequest(user1.id, user2.id, user1.accessToken)
        .expect(201);
      await app
        .acceptFriendRequest(user2.id, user1.id, user2.accessToken)
        .expect(200);
      const users = await app
        .getFriendRequests(user2.id, user2.accessToken)
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
        let res = await app.createUser(dto);
        const user = res.body;
        const loginDto: LoginDto = {
          email: dto.email,
          password: dto.password,
        };
        res = await app.login(loginDto);
        user.accessToken = res.body.accessToken;
        return user;
      };
      user1 = await setupUser(constants.user.test);
      user2 = await setupUser(constants.user.test2);
    });

    afterAll(async () => {
      await app.deleteUser(user1.id, user1.accessToken);
      await app.deleteUser(user2.id, user2.accessToken);
    });

    it('Invalid access token should return 401 Unauthorized', async () => {
      await app.getFriends(user1.id, 'invalid').expect(401);
      await app.unfriend(user1.id, user2.id, 'invalid').expect(401);
    });

    it('user1 should get empty friends list', async () => {
      await app.getFriends(user1.id, user1.accessToken).expect(200).expect([]);
    });

    it('user1 and user2 should become friend', async () => {
      await app
        .sendFriendRequest(user1.id, user2.id, user1.accessToken)
        .expect(201);
      await app
        .acceptFriendRequest(user2.id, user1.id, user2.accessToken)
        .expect(200);
    });

    it('user1 should get user2 in friends list', async () => {
      const expected = [{ ...user2 }];
      expected.forEach((user) => delete user.accessToken);
      await app
        .getFriends(user1.id, user1.accessToken)
        .expect(200)
        .expect(expected);
    });

    it('user2 should get user1 in friends list', async () => {
      const expected = [{ ...user1 }];
      expected.forEach((user) => delete user.accessToken);
      await app
        .getFriends(user2.id, user2.accessToken)
        .expect(200)
        .expect(expected);
    });

    it('user1 should unfriend user2', async () => {
      await app
        .unfriend(user1.id, user2.id, user1.accessToken)
        .expect(200)
        .expect('Unfriended');
      await app.getFriends(user1.id, user1.accessToken).expect(200).expect([]);
      await app.getFriends(user2.id, user2.accessToken).expect(200).expect([]);
    });
  });

  describe('Block', () => {
    let user1;
    let user2;

    beforeAll(async () => {
      const setupUser = async (dto) => {
        let res = await app.createUser(dto);
        const user = res.body;
        const loginDto: LoginDto = {
          email: dto.email,
          password: dto.password,
        };
        res = await app.login(loginDto);
        user.accessToken = res.body.accessToken;
        return user;
      };
      user1 = await setupUser(constants.user.test);
      user2 = await setupUser(constants.user.test2);
    });

    afterAll(async () => {
      await app.deleteUser(user1.id, user1.accessToken);
      await app.deleteUser(user2.id, user2.accessToken);
    });

    it('Invalid access token should return 401 Unauthorized', async () => {
      await app.blockUser(user1.id, user2.id, 'invalid').expect(401);
      await app.unblockUser(user1.id, user2.id, 'invalid').expect(401);
    });

    it('user1 and user2 should become friend', async () => {
      await app
        .sendFriendRequest(user1.id, user2.id, user1.accessToken)
        .expect(201);
      await app
        .acceptFriendRequest(user2.id, user1.id, user2.accessToken)
        .expect(200);
    });

    it('user1 and user2 should get empty blocking users list', async () => {
      await app
        .getBlockingUsers(user1.id, user1.accessToken)
        .expect(200)
        .expect([]);
      await app
        .getBlockingUsers(user2.id, user2.accessToken)
        .expect(200)
        .expect([]);
    });

    it('user1 should block user2', async () => {
      await app
        .blockUser(user1.id, user2.id, user1.accessToken)
        .expect(200)
        .expect('Blocked');
    });

    it('user1 should get updated blocking users list', async () => {
      const expected = [{ ...user2 }];
      expected.forEach((user) => delete user.accessToken);
      await app
        .getBlockingUsers(user1.id, user1.accessToken)
        .expect(200)
        .expect(expected);
    });

    it('user2 should get empty blocking users list', async () => {
      await app
        .getBlockingUsers(user2.id, user2.accessToken)
        .expect(200)
        .expect([]);
    });

    it('user1 and user2 should get empty friends list', async () => {
      await app.getFriends(user1.id, user1.accessToken).expect(200).expect([]);
      await app.getFriends(user2.id, user2.accessToken).expect(200).expect([]);
    });

    it('user1 should unblock user2', async () => {
      await app
        .unblockUser(user1.id, user2.id, user1.accessToken)
        .expect(200)
        .expect('Unblocked');
    });

    it('user1 and user2 should get empty blocking users list', async () => {
      await app
        .getBlockingUsers(user1.id, user1.accessToken)
        .expect(200)
        .expect([]);
      await app
        .getBlockingUsers(user2.id, user2.accessToken)
        .expect(200)
        .expect([]);
    });

    it('user1 and user2 should get empty friends list', async () => {
      await app.getFriends(user1.id, user1.accessToken).expect(200).expect([]);
      await app.getFriends(user2.id, user2.accessToken).expect(200).expect([]);
    });
  });

  describe('Friend Request edge cases', () => {
    let user1;
    let user2;

    beforeEach(async () => {
      const setupUser = async (dto) => {
        let res = await app.createUser(dto);
        const user = res.body;
        const loginDto: LoginDto = {
          email: dto.email,
          password: dto.password,
        };
        res = await app.login(loginDto);
        user.accessToken = res.body.accessToken;
        return user;
      };
      user1 = await setupUser(constants.user.test);
      user2 = await setupUser(constants.user.test2);
    });

    afterEach(async () => {
      await app.deleteUser(user1.id, user1.accessToken);
      await app.deleteUser(user2.id, user2.accessToken);
    });

    it('Should not accept requests that doesnt exist', async () => {
      await app
        .acceptFriendRequest(user1.id, user2.id, user1.accessToken)
        .expect(404);
    });

    it('Should not reject requests that doesnt exist', async () => {
      await app
        .rejectFriendRequest(user1.id, user2.id, user1.accessToken)
        .expect(404);
    });

    it('Should not cancel requests that doesnt exist', async () => {
      await app
        .cancelFriendRequest(user1.id, user2.id, user1.accessToken)
        .expect(404);
    });

    it('Should not send request twice', async () => {
      await app
        .sendFriendRequest(user1.id, user2.id, user1.accessToken)
        .expect(201);
      await app
        .sendFriendRequest(user1.id, user2.id, user1.accessToken)
        .expect(409);
    });

    it('Should not send request to friend', async () => {
      await app
        .sendFriendRequest(user1.id, user2.id, user1.accessToken)
        .expect(201);
      await app
        .acceptFriendRequest(user2.id, user1.id, user2.accessToken)
        .expect(200);
      await app
        .sendFriendRequest(user1.id, user2.id, user1.accessToken)
        .expect(409);
    });

    it('Should not send request to blocked user', async () => {
      // user1 blocks user2
      await app.blockUser(user1.id, user2.id, user1.accessToken).expect(200);

      // user2 sends request to user1
      await app
        .sendFriendRequest(user2.id, user1.id, user2.accessToken)
        .expect(409);
    });

    it('Should not send requests to self', async () => {
      await app
        .sendFriendRequest(user1.id, user1.id, user1.accessToken)
        .expect(400);
    });
  });
});
