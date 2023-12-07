import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { initializeApp } from './util';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { LoginDto } from 'src/auth/dto/login.dto';

const constants = {
  susami: {
    name: 'susami',
    email: 'susami@example.com',
    password: 'password-susami',
  },
  testUser: {
    name: 'test_user',
    email: 'test@test.com',
    password: 'password-test',
  },
  testUserLogin: {
    email: 'test@test.com',
    password: 'password-test',
  },
};

describe('UserController (e2e)', () => {
  let app: INestApplication;

  const expectUser = (user) => {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect(user).not.toHaveProperty('password');
  };
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

  const login = (login: LoginDto) => {
    return request(app.getHttpServer()).post('/auth/login').send(login);
  };

  beforeAll(async () => {
    app = await initializeApp();
  });

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
        name: constants.testUser.name,
        email: 'invalid',
        password: constants.testUser.password,
      };
      return createUser(dto).expect(400);
    });

    it('POST /user with too short name should return 400 Bad Request', () => {
      const dto: CreateUserDto = {
        name: 'a',
        email: constants.testUser.email,
        password: constants.testUser.password,
      };
      return createUser(dto).expect(400);
    });

    it('POST /user with too short password should return 400 Bad Request', () => {
      const dto: CreateUserDto = {
        name: constants.testUser.name,
        email: constants.testUser.email,
        password: 'a',
      };
      return createUser(dto).expect(400);
    });
  });

  describe('Invalid authentication', () => {
    it('POST /auth/login with invalid email should return 400 Bad Request', () => {
      const dto: LoginDto = {
        email: 'invalid',
        password: constants.testUser.password,
      };
      return login(dto).expect(400);
    });

    it('POST /auth/login with email not registered should return 404 Not Found', () => {
      const dto: LoginDto = {
        email: 'nosuchuser@example.com',
        password: constants.testUser.password,
      };
      return login(dto).expect(404);
    });

    it('POST /auth/login with invalid password should return 401 Unauthorized', () => {
      const dto = {
        email: constants.susami.email,
        password: 'invalid',
      };
      return login(dto).expect(401);
    });
  });

  describe('[Sign up] => [Log in] => [Delete]', () => {
    let userId: number;
    let accessToken: string;

    it('POST /user should return 201 Created', async () => {
      const res = await createUser(constants.testUser)
        .expect(201)
        .expect((res) => expectUser(res.body));
      userId = res.body.id;
    });

    it('POST /auth/login should return 201 Created', async () => {
      const res = await login(constants.testUserLogin).expect(201);
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
      let res = await createUser(constants.testUser);
      userId = res.body.id;

      res = await login(constants.testUserLogin);
      accessToken = res.body.accessToken;
    });

    afterAll(async () => {
      await deleteUser(userId).set('Authorization', `Bearer ${accessToken}`);
    });

    it('GET /user/:id should return the user', () => {
      const expected = {
        id: userId,
        email: constants.testUser.email,
        name: constants.testUser.name,
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
        email: constants.testUser.email,
        name: 'new_name',
      };
      return updateUser(userId, dto)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(expected);
    });
  });
});
