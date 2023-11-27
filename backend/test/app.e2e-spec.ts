import { Role } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';

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
    interface testUser {
      name: string;
      email: string;
      password: string;
      id: number;
      accessToken: string;
      role: Role;
    }
    enum UserType {
      owner,
      admin,
      member,
      NotMember,
    }
    let users: testUser[] = [
      {
        name: 'owner',
        email: 'owner@example.com',
        password: 'password-owner',
        id: <number>undefined,
        accessToken: undefined,
        role: Role.OWNER,
      },
      {
        name: 'admin',
        email: 'admin@example.com',
        password: 'password-admin',
        id: <number>undefined,
        accessToken: undefined,
        role: Role.ADMINISTRATOR,
      },
      {
        name: 'member',
        email: 'member@example.com',
        password: 'password-member',
        id: <number>undefined,
        accessToken: undefined,
        role: Role.MEMBER,
      },
      {
        name: 'NotMember',
        email: 'NotMember@example.com',
        password: 'password-NotMember',
        id: <number>undefined,
        accessToken: undefined,
        role: undefined,
      },
    ];
    const testRoom = {
      name: 'testRoom1',
      roomId: <number>undefined,
    };
    beforeEach(() => {
      return Promise.all(
        users.map((user) => {
          return request(app.getHttpServer())
            .post('/user')
            .send(user)
            .then((res) => {
              expect(res.body).toHaveProperty('id');
              expect(res.body.id).not.toBeUndefined();
              user.id = res.body.id;
              return request(app.getHttpServer())
                .post('/auth/login')
                .send(user)
                .then((res) => {
                  user.accessToken = res.body.accessToken;
                });
            })
            .catch((err) => {
              throw err;
            });
        }),
      )
        .then(() => {
          const createRoomDto: CreateRoomDto = {
            name: testRoom.name,
          };
          return request(app.getHttpServer())
            .post('/room')
            .set('Authorization', `Bearer ${users[UserType.owner].accessToken}`)
            .send(createRoomDto)
            .then((res) => {
              testRoom.roomId = res.body.id;
              const addMemberPromises = users
                .filter(
                  (user) => user.role !== Role.OWNER && user.role !== undefined,
                )
                .map((user) => {
                  return request(app.getHttpServer())
                    .post(`/room/${testRoom.roomId}`)
                    .set('Authorization', `Bearer ${user.accessToken}`);
                });
              const updateRolePromises = users
                .filter((user) => user.role === Role.ADMINISTRATOR)
                .map((user) => {
                  return request(app.getHttpServer())
                    .patch(`/room/${testRoom.roomId}/${user.id}`)
                    .set(
                      'Authorization',
                      `Bearer ${users[UserType.owner].accessToken}`,
                    )
                    .send({ role: user.role });
                });
              return Promise.all([
                ...addMemberPromises,
                ...updateRolePromises,
              ]).then(() => {
                return request(app.getHttpServer())
                  .get(`/room/${testRoom.roomId}`)
                  .set(
                    'Authorization',
                    `Bearer ${users[UserType.owner].accessToken}`,
                  )
                  .then((res) => {
                    console.log(res.body);
                  });
              });
            })
            .catch((err) => {
              throw err;
            });
        })
        .catch((err) => {
          throw err;
        });
    });
    afterEach(() => {
      return request(app.getHttpServer())
        .delete(`/room/${testRoom.roomId}`)
        .set('Authorization', `Bearer ${users[UserType.owner].accessToken}`)
        .then(() => {
          return Promise.all(
            users.map((user) => {
              return request(app.getHttpServer())
                .delete(`/user/${user.id}`)
                .set('Authorization', `Bearer ${user.accessToken}`)
                .expect(204);
            }),
          ).catch((err) => {
            throw err;
          });
        });
    });
    // it('GET from roomMember should return the room', () => {
    //   return users
    //     .filter((user) => user.role !== undefined)
    //     .map((user) => {
    //       return request(app.getHttpServer())
    //         .get(`/room/${testRoom.roomId}`)
    //         .set('Authorization', `Bearer ${user.accessToken}`)
    //         .expect(200)
    //         .then((res) => {
    //           expect(res.body).toHaveProperty('id');
    //           expect(res.body).toHaveProperty('name');
    //           expect(res.body).toHaveProperty('users');
    //           expect(res.body.users).toBeInstanceOf(Array);
    //           expect(res.body.users.length).toBeGreaterThan(0);
    //           res.body.users.forEach((user) => {
    //             expect(user).toHaveProperty('id');
    //             expect(user).toHaveProperty('role');
    //             expect(user).toHaveProperty('roomId');
    //             expect(user).not.toHaveProperty('userId');
    //           });
    //         });
    //     });
    // });
    it('GET should from notMember return 403 Forbidden', () => {
      console.log(
        'GET should from notMember return 403 Forbidden',
        users[UserType.NotMember],
      );
      return request(app.getHttpServer())
        .get(`/room/${testRoom.roomId}`)
        .set('Authorization', `Bearer ${users[UserType.NotMember].accessToken}`)
        .expect(403);
    });
    it('GET should without Authorization return 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .get(`/room/${testRoom.roomId}`)
        .expect(401);
    });
    it('nothing', () => {
      expect(true).toBe(true);
    });
    it('nothing', () => {
      expect(true).toBe(true);
    });
  });
});
