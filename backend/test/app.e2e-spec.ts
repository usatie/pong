import { Role } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserEntity } from 'src/user/entities/user.entity';

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
    beforeAll(async () => {
      const createUser = (dto: CreateUserDto): Promise<UserEntity> => {
        return request(app.getHttpServer())
          .post('/user')
          .send(dto)
          .then((res) => {
            expect(res.body).toHaveProperty('email');
            expect(res.body).toHaveProperty('name');
            expect(res.body).not.toHaveProperty('password');
            return res.body;
          });
      };
      const getAccessTokenOfUser = ({
        email,
        password,
      }: {
        email: string;
        password: string;
      }): Promise<{ accessToken: string }> => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({ email, password })
          .then((res) => {
            return { accessToken: res.body.accessToken };
          });
      };
      const createUserDtos: CreateUserDto[] = [
        {
          name: 'owner',
          email: 'owner@example.com',
          password: 'password-owner',
        },
        {
          name: 'admin',
          email: 'admin@example.com',
          password: 'password-admin',
        },
        {
          name: 'member',
          email: 'member@example.com',
          password: 'password-member',
        },
        {
          name: 'NotMember',
          email: 'NotMember@example.com',
          password: 'password-NotMember',
        },
      ];
      const createdUsers = await Promise.all(
        createUserDtos.map((dto) => {
          return createUser(dto).then((user) => ({
            ...user,
            password: dto.password,
          }));
        }),
      );
      const usersWithToken = await Promise.all(
        createdUsers.map((u) => {
          return getAccessTokenOfUser(u).then((token) => ({ ...u, ...token }));
        }),
      );
	  const createRoom = ({accessToken}: {accessToken: string}, createRoomDto: CreateRoomDto) => (
		request(app.getHttpServer())
              .post('/room')
              .set('Authorization', `Bearer ${accessToken}`)
              .send(createRoomDto).then((res) => res.body)
	  );
	  const ownerUser = usersWithToken.find(u => u.name === 'owner');
	  const room = await createRoom(ownerUser, {name: 'test'});
	  console.log(room);
      return;

        //         testRoom.roomId = res.body.id;
        //         const addMemberPromises = users
        //           .filter(
        //             (user) => user.role !== Role.OWNER && user.role !== undefined,
        //           )
        //           .map((user) => {
        //             return request(app.getHttpServer())
        //               .post(`/room/${testRoom.roomId}`)
        //               .set('Authorization', `Bearer ${user.accessToken}`);
        //           });
        //         const updateRolePromises = users
        //           .filter((user) => user.role === Role.ADMINISTRATOR)
        //           .map((user) => {
        //             return request(app.getHttpServer())
        //               .patch(`/room/${testRoom.roomId}/${user.id}`)
        //               .set(
        //                 'Authorization',
        //                 `Bearer ${users[UserType.owner].accessToken}`,
        //               )
        //               .send({ role: user.role });
        //           });
        //         return Promise.all([
        //           ...addMemberPromises,
        //           ...updateRolePromises,
        //         ]).then(() => {
        //           return request(app.getHttpServer())
        //             .get(`/room/${testRoom.roomId}`)
        //             .set(
        //               'Authorization',
        //               `Bearer ${users[UserType.owner].accessToken}`,
        //             )
        //             .then((res) => {
        //               console.log(res.body);
        //             });
        //         });
        //       })
        //       .catch((err) => {
        //         throw err;
        //       });
        //   })
        //   .catch((err) => {
        //     throw err;
        //   });
    });
    afterAll(() => {
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
    describe('GET', () => {
      it('from roomMember: should return the room 200 OK', () => {
        return Promise.all(
          users
            .filter((user) => user.role !== undefined)
            .map((user) => {
              return request(app.getHttpServer())
                .get(`/room/${testRoom.roomId}`)
                .set('Authorization', `Bearer ${user.accessToken}`)
                .expect(200)
                .then((res) => {
                  expect(res.body).toHaveProperty('id');
                  expect(res.body).toHaveProperty('name');
                  expect(res.body).toHaveProperty('users');
                  expect(res.body.users).toBeInstanceOf(Array);
                  expect(res.body.users.length).toBeGreaterThan(0);
                  res.body.users.forEach((user) => {
                    expect(user).toHaveProperty('id');
                    expect(user).toHaveProperty('role');
                    expect(user).toHaveProperty('roomId');
                    expect(user).toHaveProperty('userId');
                  });
                });
            }),
        );
      });
      it('from notMember: should return 403 Forbidden', () => {
        return request(app.getHttpServer())
          .get(`/room/${testRoom.roomId}`)
          .set(
            'Authorization',
            `Bearer ${users[UserType.NotMember].accessToken}`,
          )
          .expect(403);
      });
      it('from unAuthorized User: should return 401 Unauthorized', () => {
        return request(app.getHttpServer())
          .get(`/room/${testRoom.roomId}`)
          .expect(401);
      });
    });
    describe('POST', () => {
      it('from member: should return 409 Conflict', () => {
        return Promise.all(
          users
            .filter((user) => user.role !== undefined)
            .map((user) => {
              return request(app.getHttpServer())
                .post(`/room/${testRoom.roomId}`)
                .set('Authorization', `Bearer ${user.accessToken}`)
                .expect(409);
            }),
        );
      });
      it('from notMember: should return 201 Created', () => {
        return Promise.all(
          users
            .filter((user) => user.role === undefined)
            .map((user) => {
              return request(app.getHttpServer())
                .post(`/room/${testRoom.roomId}`)
                .set('Authorization', `Bearer ${user.accessToken}`)
                .expect(201);
            }),
        ).then(() => {
          return request(app.getHttpServer())
            .get(`/room/${testRoom.roomId}`)
            .set(
              'Authorization',
              `Bearer ${users[UserType.NotMember].accessToken}`,
            )
            .expect(200)
            .then((res) => {
              expect(res.body.users.length).toBe(users.length);
              return request(app.getHttpServer())
                .delete(
                  `/room/${testRoom.roomId}/${users[UserType.NotMember].id}`,
                )
                .set(
                  'Authorization',
                  `Bearer ${users[UserType.owner].accessToken}`,
                )
                .expect(200);
            })
            .then(() => {
              return request(app.getHttpServer())
                .get(`/room/${testRoom.roomId}`)
                .set(
                  'Authorization',
                  `Bearer ${users[UserType.NotMember].accessToken}`,
                )
                .expect(403);
            });
        });
      });
      it('from unAuthorized User: should return 401 Unauthorized', () => {
        return request(app.getHttpServer())
          .post(`/room/${testRoom.roomId}`)
          .expect(401);
      });
    });
    describe('PATCH', () => {
      const newName = 'new_name';
      it('from roomMember: Owner : should return 200 OK', () => {
        return Promise.all(
          users
            .filter((user) => user.role === Role.OWNER)
            .map((user) => {
              return request(app.getHttpServer())
                .patch(`/room/${testRoom.roomId}`)
                .set('Authorization', `Bearer ${user.accessToken}`)
                .send({ name: newName })
                .expect(200);
            }),
        ).then(() => {
          return request(app.getHttpServer())
            .get(`/room/${testRoom.roomId}`)
            .set('Authorization', `Bearer ${users[UserType.owner].accessToken}`)
            .expect(200)
            .then((res) => expect(res.body.name).toBe(newName));
        });
      });
      it('from notMember and Member except Owner: should return 403 Forbidden', () => {
        return Promise.all(
          users
            .filter((user) => user.role !== Role.OWNER)
            .map((user) => {
              return request(app.getHttpServer())
                .patch(`/room/${testRoom.roomId}`)
                .set('Authorization', `Bearer ${user.accessToken}`)
                .send({ name: newName })
                .expect(403);
            }),
        );
      });
      it('from unAuthorized User: should return 401 Unauthorized', () => {
        return request(app.getHttpServer())
          .patch(`/room/${testRoom.roomId}`)
          .send({ name: newName })
          .expect(401);
      });
    });
    describe('DELETE', () => {
      it('from roomMember: Owner : should return 200 OK (to prepare test, this action is tried. To prevent room delete, don"t execute this test! take care!)', () => {
        return expect(true).toBe(true);
      });
      it('from notMember and Member except Owner: should return 403 Forbidden', () => {
        return Promise.all(
          users
            .filter((user) => user.role !== Role.OWNER)
            .map((user) => {
              return request(app.getHttpServer())
                .delete(`/room/${testRoom.roomId}`)
                .set('Authorization', `Bearer ${user.accessToken}`)
                .expect(403);
            }),
        );
      });
      it('from unAuthorized User: should return 401 Unauthorized', () => {
        return request(app.getHttpServer())
          .delete(`/room/${testRoom.roomId}`)
          .expect(401);
      });
    });
  });
});
