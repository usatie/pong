import { Role } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest, * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { RoomEntity } from 'src/room/entities/room.entity';
import { UpdateRoomDto } from 'src/room/dto/update-room.dto';
import { AuthEntity } from 'src/auth/entity/auth.entity';
import { UserOnRoomEntity } from 'src/room/entities/UserOnRoom.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const testUser = {
    name: 'test_user',
    email: 'test@example.com',
    password: 'password-test',
  };
  const testUserLogin = { email: testUser.email, password: testUser.password };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true })); // enable validation
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    ); // enable serialization
    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
    await app.init();
  });

  describe('/ (GET)', () => {
    it('should return "Hello World!"', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('/user', () => {
    const testUserResponse = (user) => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).not.toHaveProperty('password');
    };
    describe('Without authentiation', () => {
      it('GET /user should return users list', async () => {
        const res = await request(app.getHttpServer()).get('/user').expect(200);
        const users = res.body;
        expect(users).toBeInstanceOf(Array);
        expect(users.length).toBeGreaterThan(0);
        users.forEach(testUserResponse);
      });

      it('GET /user/:id should return 401 Unauthorized', () => {
        return request(app.getHttpServer()).get('/user/1').expect(401);
      });

      it('PATCH /user/:id should return 401 Unauthorized', () => {
        return request(app.getHttpServer()).patch('/user/1').expect(401);
      });

      it('DELETE /user/:id should return 401 Unauthorized', () => {
        return request(app.getHttpServer()).delete('/user/1').expect(401);
      });
    });

    describe('Invalid Sign up', () => {
      it('POST /user with invalid email should return 400 Bad Request', () => {
        const invalidUser = { ...testUser, email: 'invalid' };
        return request(app.getHttpServer())
          .post('/user')
          .send(invalidUser)
          .expect(400);
      });

      it('POST /user with too short name should return 400 Bad Request', () => {
        const invalidUser = { ...testUser, name: 'a' };
        return request(app.getHttpServer())
          .post('/user')
          .send(invalidUser)
          .expect(400);
      });

      it('POST /user with too short password should return 400 Bad Request', () => {
        const invalidUser = { ...testUser, password: 'short' };
        return request(app.getHttpServer())
          .post('/user')
          .send(invalidUser)
          .expect(400);
      });
    });

    describe('Invalid authentication', () => {
      it('POST /auth/login with invalid email should return 400 Bad Request', () => {
        const invalidLogin = { ...testUserLogin, email: 'invalid' };
        return request(app.getHttpServer())
          .post('/auth/login')
          .send(invalidLogin)
          .expect(400);
      });

      it('POST /auth/login with email not registered should return 404 Not Found', () => {
        const invalidLogin = {
          ...testUserLogin,
          email: 'nosuchuser@example.com',
        };
        return request(app.getHttpServer())
          .post('/auth/login')
          .send(invalidLogin)
          .expect(404);
      });

      it('POST /auth/login with invalid password should return 401 Unauthorized', () => {
        const invalidLogin = {
          email: 'susami@example.com',
          password: 'invalid',
        };
        return request(app.getHttpServer())
          .post('/auth/login')
          .send(invalidLogin)
          .expect(401);
      });
    });

    describe('Sign up, Log in and Delete', () => {
      it('[POST /user] => [POST /auth/login] => [DELETE /user/:id]', async () => {
        const id = await request(app.getHttpServer())
          .post('/user')
          .send(testUser)
          .expect(201)
          .then((res) => {
            const user = res.body;
            testUserResponse(res.body);
            return user.id;
          });

        const accessToken = await request(app.getHttpServer())
          .post('/auth/login')
          .send(testUserLogin)
          .expect(201)
          .then((res) => res.body.accessToken);

        return request(app.getHttpServer())
          .delete(`/user/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(204)
          .expect({});
      });
    });

    describe('With authentication', () => {
      let id: number;
      let accessToken: string;

      beforeAll(async () => {
        id = await request(app.getHttpServer())
          .post('/user')
          .send(testUser)
          .then((res) => res.body.id);

        accessToken = await request(app.getHttpServer())
          .post('/auth/login')
          .send(testUserLogin)
          .then((res) => res.body.accessToken);
      });

      afterAll(async () => {
        await request(app.getHttpServer())
          .delete(`/user/${id}`)
          .set('Authorization', `Bearer ${accessToken}`);
      });

      it('GET /user/:id should return the user', () => {
        const expectedUser = { ...testUser, id };
        delete expectedUser.password;
        return request(app.getHttpServer())
          .get(`/user/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .expect(expectedUser);
      });

      it('PATCH /user/:id should update the user', () => {
        const updatedUser = {
          ...testUser,
          id,
          name: 'new_name',
        };
        delete updatedUser.password;
        return request(app.getHttpServer())
          .patch(`/user/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updatedUser)
          .expect(200)
          .expect(updatedUser);
      });

      it('DELETE /user/:id should delete the user', () => {
        return request(app.getHttpServer())
          .delete(`/user/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(204)
          .expect({});
      });
    });
  });
  describe('/room/:id', () => {
    const userDtos: CreateUserDto[] = [
      {
        name: 'OWNER',
        email: 'owner@example.com',
        password: 'password-owner',
      },
      {
        name: 'ADMINISTRATOR',
        email: 'admin@example.com',
        password: 'password-admin',
      },
      {
        name: 'MEMBER',
        email: 'member@example.com',
        password: 'password-member',
      },
      {
        name: 'NotMEMBER',
        email: 'NotMember@example.com',
        password: 'password-NotMember',
      },
    ];

    type dtoWithToken = CreateUserDto & {
      accessToken: string;
    };

    type PayloadOfJWT = {
      userId;
      iat;
      exp;
    };

    const payloadFromJWT = ({ accessToken }: { accessToken: string }) =>
      atob(accessToken.split('.')[1]);

    const isSuccessResponse = (res): boolean =>
      res.status / 100 > 2 && res.status / 100 < 3;

    const green = '\u001b[32m';

    const reset = '\u001b[0m';

    // console.log(red + 'This text is red. ' + green + 'Greeeeeeen!' + reset);

    const loginUser = (u: CreateUserDto): Promise<dtoWithToken> =>
      request(app.getHttpServer())
        .post('/auth/login')
        .send(u)
        .then((res) => {
          isSuccessResponse(res)
            ? console.log(
              'login',
              res.status,
              res.status / 100,
              isSuccessResponse(res),
              res.body,
              reset,
            )
            : console.log(
              green + 'login',
              res.status,
              res.status / 100,
              isSuccessResponse(res),
              res.body,
              reset,
            );
          return isSuccessResponse(res)
            ? {
              ...u,
              ...res.body,
            }
            : Promise.reject(res.body);
        });

    const deleteUser = (u: dtoWithToken) => {
      const payload: PayloadOfJWT = JSON.parse(payloadFromJWT(u));
      return request(app.getHttpServer())
        .delete(`/user/${payload.userId}`)
        .set('Authorization', `Bearer ${u.accessToken}`)
        .then((res) =>
          isSuccessResponse(res) ? res.body : Promise.reject(res.body),
        );
    };

    const createUser = (dto: CreateUserDto): Promise<UserEntity> =>
      request(app.getHttpServer())
        .post('/user')
        .send(dto)
        .then((res) => {
          return isSuccessResponse(res) ? res.body : Promise.reject(res.body);
        });

    const getUsers = () => {
      return request(app.getHttpServer())
        .get('/user')
        .then((res) => res.body);
    };

    beforeEach(async () => {
      console.log('beforeEach', await getUsers());
      await Promise.all(
        userDtos.map((dto) =>
          createUser(dto)
            .then((user) => ({
              ...user,
              password: dto.password,
            }))
            .catch((e) => {
              console.error(e);
              return Promise.reject(e);
            }),
        ),
      );
      return console.log('beforeEach finished : ', await getUsers());
    });

    afterEach(async () => {
      console.log('afterEach', await getUsers());

      await Promise.all(
        userDtos.map((u) =>
          loginUser(u)
            .then((uToken) => deleteUser(uToken))
            .catch((e) => console.error(e)),
        ),
      );

      return console.log('afterEach finished : ', await getUsers());
    });

    it('should be defined', () => {
      return expect(app).toBeDefined();
    });

    it('test 1', () => {
      return expect(true).toBe(true);
    });
    it('test 2', () => {
      return expect(true).toBe(true);
    });
    it('test 1', () => {
      return expect(true).toBe(true);
    });
    it('test 2', () => {
      return expect(true).toBe(true);
    });
    it('test 1', () => {
      return expect(true).toBe(true);
    });
    it('test 2', () => {
      return expect(true).toBe(true);
    });
    it('test 1', () => {
      return expect(true).toBe(true);
    });
    it('test 2', () => {
      return expect(true).toBe(true);
    });
  });
});
